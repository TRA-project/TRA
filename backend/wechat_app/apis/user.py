from rest_framework import viewsets, mixins
from rest_framework.decorators import action
from django.db.models import Sum

from utility.models import Companion, Image, Message, \
    TravelCollection, ScheduleItem, UsersFlight, Address
from wechat_app.serializers import UserSerializer, TravelSerializer, MessageSerializer, \
    CompanionSerializer, UsersFlightSerializer
from utils.response import *
from utils import conversion, date, encrypt, permission, filters, wechat
from django.core.files.uploadedfile import UploadedFile

from .travel_notes import TravelFilterBackend
from utils.api_tools import *


class UserApis(viewsets.GenericViewSet, mixins.CreateModelMixin,
               mixins.RetrieveModelMixin, mixins.ListModelMixin):
    filter_backends = [filters.QueryFilterBackend.custom(
        ('name', 'name', 'contains'),
        ('nickname', 'nickname', 'contains'),
        ordering_rule='-time')]
    permission_classes = [permission.UserPermission]
    queryset = AppUser.objects.all()
    serializer_class = UserSerializer

    @classmethod
    def _password_validity_check(cls, password):
        if password is None:
            return False
        return True

    def create(self, request, *args, **kwargs):
        name = request.data.get('name', None)
        password = request.data.get('password', None)
        wechat_code = request.data.get('js_code', None)
        if name is not None and AppUser.objects.filter(name=name):
            return error_response(Error.USER_NAME_ALREADY_EXISTS, 'User name already exists')
        if not isinstance(wechat_code, str):
            return error_response(Error.USER_INVALID_WECHAT_CODE, 'Invalid wechat code')
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        if not self._password_validity_check(password):
            return error_response(Error.PARSE_ERROR, 'Invalid password')
        if settings.DEBUG:
            openid = wechat_code
        else:
            openid = wechat.get_openid(wechat_code)
        if AppUser.objects.filter(openid=openid):
            return error_response(Error.USER_INVALID_WECHAT_ID, 'Wechat ID already exists')
        obj = serializer.save()
        obj.password = encrypt.sha256(password)
        obj.openid = openid
        obj.save()

        # Log
        save_log(user_id=obj.id, action=settings.LOG_USER_REGISTER, target_id=None)

        # 创建默认合集
        TravelCollection.objects.create(title='默认合集', owner=obj)

        headers = self.get_success_headers(serializer.data)
        data = serializer.data
        data['token'] = obj.jwt_token()
        return Response(data, status=status.HTTP_201_CREATED, headers=headers)

    def retrieve(self, request, *args, **kwargs):
        user = self.get_object()
        request_user = permission.user_check(request)
        data = self._retrieve(user, request_user < 0 or request_user == user.id, request_user)
        return Response(data, status=status.HTTP_200_OK)

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        request_user = permission.user_check(request)

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            s_data = serializer.data
            for data in s_data:
                if request_user and request_user > 0:
                    user = self.get_queryset().get(id=data['id'])
                    data['subscribed'] = True if user.subscribers.filter(id=request_user) else False
                else:
                    data['subscribed'] = False
            return self.get_paginated_response(s_data)

        serializer = self.get_serializer(queryset, many=True)
        s_data = serializer.data
        for data in s_data:
            if request_user and request_user > 0:
                user = self.get_queryset().get(id=data['id'])
                data['subscribed'] = True if user.subscribers.filter(id=request_user) else False
            else:
                data['subscribed'] = False
        return Response(s_data)

    def _retrieve(self, user, detail=False, request_user_id=None):
        serializer = self.get_serializer_class()(user, context=self.get_serializer_context())
        data = serializer.data
        likes = TravelNotes.objects.filter(owner=user).annotate(likes_count=Count('likes')). \
            aggregate(Sum('likes_count'))['likes_count__sum']
        if likes is None:
            likes = 0
        data['likes'] = likes
        if request_user_id and request_user_id > 0:
            data['subscribed'] = True if user.subscribers.filter(id=request_user_id) else False
        else:
            data['subscribed'] = False
        if detail:
            data['collection'] = user.collection.count()
            data['received_messages'] = user.received_messages.count()
        return data

    def user_update(self, request, *args, **kwargs):
        request_user = permission.user_check(request)
        instance = AppUser.objects.filter(id=request_user)
        if not instance:
            wechat_code = request.data.get('js_code', None)
            if settings.DEBUG:
                openid = wechat_code
            else:
                openid = wechat.get_openid(wechat_code)
            instance = AppUser.objects.filter(openid=openid)
            if not instance:
                return error_response(Error.INVALID_USER, 'Invalid user.')
        instance = instance.first()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        args = {}
        password = request.data.get('password', None)
        if password:
            args['password'] = encrypt.sha256(password)
        serializer.save(**args)

        if getattr(instance, '_prefetched_objects_cache', None):
            instance._prefetched_objects_cache = {}
        return Response(serializer.data)

    @action(methods=['POST'], detail=False, url_path='login')
    def login(self, request, *args, **kwargs):
        request_user = permission.user_check(request)
        if request_user > 0:
            user = self.get_queryset().filter(id=request_user)
            if user:
                user = user.first()
                res = self._retrieve(user, True)
                res['token'] = user.jwt_token()
                user.last_login_time = date.now()
                user.save()
                return response(res)

        username = request.data.get('name', None)
        password = request.data.get('password', None)
        if not isinstance(password, str) or not isinstance(username, str):
            wechat_code = request.data.get('js_code', None)
            if not isinstance(wechat_code, str):
                return error_response(Error.PARSE_ERROR, 'Invalid password or wechat code')
            openid = wechat.get_openid(wechat_code)
            users = AppUser.objects.filter(openid=openid)
            if not users:
                return error_response(Error.USER_INVALID_WECHAT_ID, 'Wechat user does not exist')
            user = users.first()
            """
            request.session['is_login'] = True
            request.session['user_id'] = user.id
            """
            res = self._retrieve(user, True)
            res['token'] = user.jwt_token()
            return response(res)
        else:
            users = AppUser.objects.filter(name=username)
            if not users:
                return error_response(Error.USER_INCORRECT_PASSWORD, 'User name or password is incorrect')
        user = users.first()
        user.last_login_time = date.now()
        user.save()

        pw_sha256 = encrypt.sha256(password)
        real_pw = user.password
        if pw_sha256 == real_pw:
            """
            request.session['is_login'] = True
            request.session['user_id'] = user.id
            """
            res = self._retrieve(user, True)
            res['token'] = user.jwt_token()

            # Log
            save_log(user_id=user.id, action=settings.LOG_USER_LOGIN, target_id=None)

            return response(res)
        return error_response(Error.USER_INCORRECT_PASSWORD, 'User name or password is incorrect')

    @action(methods=['POST'], detail=False, url_path='logout')
    def logout(self, request, *args, **kwargs):
        uid = permission.user_check(request)
        request.session['is_login'] = False
        request.session['user_id'] = settings.ANONYMOUS_USER_ID
        return response({'id': uid})

    @action(methods=['POST'], detail=False, url_path='subscribe')
    def subscribe(self, request, *args, **kwargs):
        cancel = conversion.get_bool(request.data, 'cancel')
        ids = set(conversion.get_list(request.data, 'id'))
        request_user = permission.user_check(request)
        user = self.get_queryset().filter(id=request_user)
        if not user:
            return error_response(Error.INVALID_USER, status=status.HTTP_403_FORBIDDEN)
        user = user.first()
        ids.discard(user.id)
        if cancel:
            objs = self.get_queryset().filter(id__in=ids).values_list('id', flat=True)
            user.subscription.remove(*objs)
            removed_messages = Message.objects.filter(owner=user, target_users__id__in=objs,
                                                      type=settings.MESSAGE_TYPE_SUBSCRIBE)
            removed_messages.delete()
        else:
            objs = self.get_queryset().filter(id__in=ids)
            objs = objs.difference(user.subscription.all()).values_list('id', flat=True)
            user.subscription.add(*objs)
            for user_id in objs:
                m = Message.create_message(user, user_id, settings.MESSAGE_TYPE_SUBSCRIBE)
                if m is None:
                    continue
                m.target_users.add(user_id)
        return response()

    @action(methods=['POST'], detail=False, url_path='collect')
    def collect(self, request, *args, **kwargs):
        cancel = conversion.get_bool(request.data, 'cancel')
        ids = set(conversion.get_list(request.data, 'id'))
        request_user = permission.user_check(request)
        user = AppUser.objects.filter(id=request_user)
        if not user:
            return error_response(Error.INVALID_USER, status=status.HTTP_403_FORBIDDEN)
        user = user.first()
        if cancel:
            user.collection.remove(*ids)
        else:
            user.collection.add(*ids)
        return response()

    @action(methods=['GET', 'POST'], detail=False, url_path='join')
    def companion(self, request, *args, **kwargs):
        if request.method == 'POST':
            return self.join_companion(request, *args, **kwargs)
        return self.companions(request, *args, **kwargs)

    def companions(self, request, *args, **kwargs):
        request_user = permission.user_check(request)
        user = AppUser.objects.filter(id=request_user)
        if not user:
            return error_response(Error.INVALID_USER, status=status.HTTP_403_FORBIDDEN)
        user: AppUser = user.first()
        queryset = user.joined_companions.all() | user.companions.all()
        page = self.paginate_queryset(self.filter_queryset(queryset).distinct())
        if page is not None:
            serializer = CompanionSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = CompanionSerializer(queryset, many=True)
        return Response(serializer.data)

    def join_companion(self, request, *args, **kwargs):
        cancel = conversion.get_bool(request.data, 'cancel')
        ids = set(conversion.get_list(request.data, 'id'))
        request_user = permission.user_check(request)
        user = AppUser.objects.filter(id=request_user)
        if not user:
            return error_response(Error.INVALID_USER, status=status.HTTP_403_FORBIDDEN)
        user = user.first()
        now = date.now()
        if cancel:
            objs = Companion.objects.filter(id__in=ids)
            deadline_reached = objs.filter(deadline__lt=now)
            deadline_reached_id = deadline_reached.values_list('id', flat=True)
            objs = objs.exclude(id__in=deadline_reached_id)
            user.joined_companions.remove(*ids)
            obj_ids = objs.values_list('id', flat=True)
            removed_messages = Message.objects.filter(owner=user, related_companion_id__in=obj_ids,
                                                      type=settings.MESSAGE_TYPE_COMPANION)
            for msg in removed_messages:
                for target in msg.target_users.all():
                    target.unread_messages.remove(msg)
            removed_messages = Message.objects.filter(owner=user, related_companion_id__in=obj_ids,
                                                      type=settings.MESSAGE_TYPE_COMPANION_QUIT)
            removed_messages.update(time=date.now())
            for msg in removed_messages:
                for target in msg.target_users.all():
                    target.unread_messages.add(msg)
            msg_cids = removed_messages.values_list('related_companion__id', flat=True)
            objs = objs.exclude(id__in=msg_cids)
            for companion in objs:
                Message.create_message(user, companion.owner, companion=companion,
                                       type=settings.MESSAGE_TYPE_COMPANION_QUIT)
                # companion.cancelled_users.add(user)
            failure = [{'id': companion.id, 'code': Error.COMPANION_DEADLINE_REACHED} for companion in deadline_reached]
            return response({'failed': failure},
                            status=status.HTTP_200_OK if not failure else status.HTTP_206_PARTIAL_CONTENT)
        else:
            failure = []
            for companion in Companion.objects.filter(id__in=ids):
                if companion.fellows.count() >= companion.capacity:
                    failure.append({'id': companion.id, 'code': Error.COMPANION_ALREADY_FULL})
                elif companion.cancelled_users.filter(id=request_user):
                    failure.append({'id': companion.id, 'code': Error.COMPANION_CANNOT_JOIN})
                elif companion.forbidden != settings.TRAVEL_FORBIDDEN_FALSE:
                    continue
                elif companion.owner_id == request_user:
                    failure.append({'id': companion.id, 'code': Error.COMPANION_IS_OWNER})
                elif companion.deadline < now:
                    failure.append({'id': companion.id, 'code': Error.COMPANION_DEADLINE_REACHED})
                else:
                    companion.fellows.add(user)
                    cowner = companion.owner
                    msgs = Message.objects.filter(related_companion=companion, target_users=cowner, owner=user,
                                                  type=settings.MESSAGE_TYPE_COMPANION_QUIT)
                    if msgs:
                        msgs = msgs.first()
                        msgs.unread_users.remove(cowner)
                    msgs = Message.objects.filter(related_companion=companion, target_users=cowner, owner=user,
                                                  type=settings.MESSAGE_TYPE_COMPANION)
                    if msgs:
                        msgs = msgs.first()
                        msgs.time = date.now()
                        msgs.unread_users.add(cowner)
                    else:
                        msgs = Message.create_message(user, companion.owner, companion=companion,
                                                      type=settings.MESSAGE_TYPE_COMPANION)
                        if msgs:
                            msgs.unread_users.add(cowner)
            return response({'failed': failure},
                            status=status.HTTP_200_OK if not failure else status.HTTP_206_PARTIAL_CONTENT)

    @action(methods=['GET'], detail=False, url_path='history')
    def history(self, request, *args, **kwargs):
        request_user = permission.user_check(request)
        user = AppUser.objects.filter(id=request_user)
        if not user:
            return error_response(Error.INVALID_USER, status=status.HTTP_403_FORBIDDEN)
        travels = TravelNotes.objects.filter(owner_id=request_user)

        page = self.paginate_queryset(travels)
        if page is not None:
            travels = page

        positions = travels.values_list('id', 'time', 'position').order_by('-time')
        res_dict = {}
        for id_, t, posid in positions:
            res_dict[id_] = {'time': t, 'position': posid}
        data = list(res_dict.values())
        if page is not None:
            data = self.get_paginated_response(data)

        return response(data)

    @action(methods=['POST', 'DELETE'], detail=False, url_path='icon')
    def icon(self, request, *args, **kwargs):
        if request.method == 'DELETE':
            return self.icon_delete(request, *args, **kwargs)
        return self.icon_upload(request, *args, **kwargs)

    def icon_upload(self, request, *args, **kwargs):
        request_user = permission.user_check(request)
        user = AppUser.objects.filter(id=request_user)
        if not user:
            return error_response(Error.INVALID_USER, status=status.HTTP_403_FORBIDDEN)
        user = user.first()
        imgfile = request.data.get('image', None)
        if imgfile is None or not isinstance(imgfile, UploadedFile):
            return error_response(status.HTTP_400_BAD_REQUEST, 'Invalid image.', status=status.HTTP_400_BAD_REQUEST)
        desc = request.data.get('description', '')
        image = Image.objects.create(image=imgfile, description=desc)
        user.icon = image
        user.save()
        return response({'id': image.id})

    def icon_delete(self, request, *args, **kwargs):
        request_user = permission.user_check(request)
        user = AppUser.objects.filter(id=request_user)
        if not user:
            return error_response(Error.INVALID_USER, status=status.HTTP_403_FORBIDDEN)
        user = user.first()
        imgid = user.icon
        if imgid is not None:
            imgid = imgid.id
        user.icon = None
        user.save()
        return response({'id': imgid})

    @action(methods=['GET'], detail=False, url_path='subscription')
    def subscription(self, request, *args, **kwargs):
        request_user = permission.user_check(request)
        user = AppUser.objects.filter(id=request_user)
        if not user:
            return error_response(Error.INVALID_USER, status=status.HTTP_403_FORBIDDEN)
        user = user.first()
        queryset = user.subscription.all()
        page = self.paginate_queryset(self.filter_queryset(queryset))
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(methods=['GET'], detail=False, url_path='subscribers')
    def subscribers(self, request, *args, **kwargs):
        request_user = permission.user_check(request)
        user = AppUser.objects.filter(id=request_user)
        if not user:
            return error_response(Error.INVALID_USER, status=status.HTTP_403_FORBIDDEN)
        user = user.first()
        queryset = user.subscribers.all()
        queryset = self.filter_queryset(queryset)
        subscribed_set = set((user.subscription.all() & (queryset)).values_list('id', flat=True))
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            data = serializer.data
            for d in data:
                if d['id'] in subscribed_set:
                    d['subscribed'] = True
                else:
                    d['subscribed'] = False
            return self.get_paginated_response(data)

        serializer = self.get_serializer(queryset, many=True)
        data = serializer.data
        for d in data:
            if d['id'] in subscribed_set:
                d['subscribed'] = True
            else:
                d['subscribed'] = False
        return Response(data)

    @action(methods=['GET'], detail=False, url_path='collection')
    def collection(self, request, *args, **kwargs):
        request_user = permission.user_check(request)
        user = AppUser.objects.filter(id=request_user)
        if not user:
            return error_response(Error.INVALID_USER, status=status.HTTP_403_FORBIDDEN)
        user = user.first()
        queryset = TravelFilterBackend().filter_queryset(request, user.collection.all(), None)
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = TravelSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = TravelSerializer(queryset, many=True)
        return Response(serializer.data)

    @action(methods=['GET'], detail=False, url_path='likes')
    def likes(self, request, *args, **kwargs):
        request_user = permission.user_check(request)
        user = AppUser.objects.filter(id=request_user)
        if not user:
            return error_response(Error.INVALID_USER, status=status.HTTP_403_FORBIDDEN)
        user = user.first()
        queryset = TravelFilterBackend().filter_queryset(request, user.liked_records.all(), None)
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = TravelSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = TravelSerializer(queryset, many=True)
        return Response(serializer.data)

    @action(methods=['GET'], detail=False, url_path='messages')
    def messages(self, request, *args, **kwargs):
        request_user = permission.user_check(request)
        user = AppUser.objects.filter(id=request_user)
        if not user:
            return error_response(Error.INVALID_USER, status=status.HTTP_403_FORBIDDEN)
        user = user.first()

        if request.query_params.get('unread'):
            unread = conversion.get_bool(request.query_params, 'unread')
            if unread:
                queryset = user.unread_messages.all()
            else:
                queryset = user.received_messages.difference(user.unread_messages.all())
        else:
            queryset = user.received_messages.all()

        queryset = queryset.order_by('-time')
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = MessageSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = MessageSerializer(queryset, many=True)
        return Response(serializer.data)

    @action(methods=['GET'], detail=False, url_path='statistics')
    def statistics(self, request, *args, **kwargs):
        owner = permission.user_check(request)
        user = AppUser.objects.all().filter(id=owner).first()
        travels = user.travel_records.all()
        cities = travels.exclude(position=None)
        cities_num = Address.objects.filter(travel_record__forbidden=False,
                                            travel_record__owner__id=owner).values_list('position__id',
                                                                                        flat=True).distinct().count()
        if cities.count() > 0:
            love_city = cities.values('position__city').annotate(city=F('position__city'),
                                                                 city_count=Count(F('position__city'))) \
                .order_by('-city_count').first()
            love_city = love_city['city']
        else:
            love_city = None

        companions = ((user.joined_companions.all()) | (user.companions.all())).distinct()

        map = dict()
        peoples = AppUser.objects.none()
        for companion in companions:
            peoples = peoples | companion.fellows.all()
            x = str(companion.owner.id)
            if x in map:
                map[x] += 1
            else:
                map[x] = 1
        peoples = peoples.values('id').annotate(count=Count('id'))
        for person in peoples:
            id = str(person['id'])
            count = person['count']
            if id in map:
                map[id] += count
            else:
                map[id] = count
        if len(map) < 2:
            love_people = None
        else:
            map.pop(str(owner))
            love_people = max(map, key=lambda x: map[x])
        travel_num = travels.count()
        data = []
        data.append({'cities_num': cities_num})
        data.append({'love_people': love_people})
        data.append({'love_city': love_city})
        data.append({'travel_num': travel_num})
        return Response({"results": data})

    @action(methods=['GET'], detail=False, url_path='todos')
    def todos(self, request, *args, **kwargs):
        request_user = permission.user_check(request)
        now = date.now()
        now_date = now.date()
        now_time = now.time()
        todo_items = ScheduleItem.objects.all().filter(
            Q(schedule__owner_id=request_user) & (Q(schedule__date__gt=now_date)
                                                  | (Q(schedule__date=now_date) & Q(end_time__gt=now_time)))).order_by(
            'schedule__date', 'start_time')[0:3]
        item_ser = ScheduleItemSerializer(todo_items, many=True)

        todo_flights = UsersFlight.objects.all().filter(
            Q(user_id=request_user) & Q(flight__depart_time__gt=now)).order_by('flight__depart_time')[0:3]
        fli_ser = UsersFlightSerializer(todo_flights, many=True, context={'user_id': request_user})

        recent_alarm_flight = UsersFlight.objects.all().filter(
            Q(user_id=request_user) & Q(flight__depart_time__gt=now) &
            Q(if_alarm=settings.FLIGHT_ALARM_TRUE)).order_by('flight__depart_time')[0:2]
        recent_alarm_item = ScheduleItem.objects.all().filter(
            Q(schedule__owner_id=request_user) & Q(if_alarm=settings.SCHEDULE_ALARM_TRUE) & (
                    Q(schedule__date__gt=now_date) | (Q(schedule__date=now_date) & Q(end_time__gt=now_time)))). \
                                order_by('schedule__date', 'start_time')[0:2]
        alarm_item_ser = ScheduleItemSerializer(recent_alarm_item, many=True)
        alarm_fli_ser = UsersFlightSerializer(recent_alarm_flight, many=True, context={'user_id': request_user})
        return Response({"todo_items": item_ser.data, "todo_flights": fli_ser.data,
                         "alarm_items": alarm_item_ser.data, "alarm_flights": alarm_fli_ser.data})
