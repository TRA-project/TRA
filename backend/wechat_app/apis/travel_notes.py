from django.db.models.functions import Cast, Sqrt
from datetime import datetime, timezone
from rest_framework import viewsets
from rest_framework.request import Request
from rest_framework.exceptions import ParseError, NotFound
from rest_framework.decorators import action
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Sum, F, Count, Q, DateTimeField, IntegerField, ExpressionWrapper, \
    Exists, Subquery, OuterRef
from django.http import QueryDict
import random

from django.conf import settings

from utils.api_tools import save_log, copy_schedule, judge_shielding_words
from utility.models import TravelNotes, AppUser, Image, Address, Comment, Message, TravelNotesCollection, Tag, Schedule
from wechat_app.serializers import TravelSerializer, TravelAddressSerializer, CommentSerializer, \
    TravelListSerializer
from utils.response import *
from utils import conversion, permission, filters
from django.core.files.uploadedfile import UploadedFile

from utils.AI.NLP import my_model


# TODO


class TravelFilterBackend(filters.QueryFilterBackend):
    filter_fields = [
        ("owner", "owner_id", "exact"),
        ("owner_name", "owner__name", "contains"),
        ("title", "title", "contains"),
    ]
    default_ordering_rule = '-time'

    def filter_queryset(self, request, queryset, view):
        owner = permission.user_check(request)
        queryset = super().filter_queryset(request, queryset.filter(Q(forbidden=settings.TRAVEL_FORBIDDEN_FALSE,
                                                                      visibility=settings.TRAVEL_VISIBILITIES_ALL) |
                                                                    Q(owner_id=owner)), view)
        tags = request.query_params.get('tag', None)
        if tags is not None:
            tags = tags.split(' ')
            for tag in tags:
                if tag == '':
                    continue
                queryset = queryset.filter(tag=tag)

        position = request.query_params.get('position', None)
        if position is not None:
            if position[-4:] == '0000':
                queryset = queryset.filter(position__province_position_id=position)
            elif position[-2:] == '00':
                queryset = queryset.filter(position__city_position_id=position)
            else:
                queryset = queryset.filter(position__position_id=position)
        if view:
            action = view.action
            if action != 'list':
                return queryset
        order = conversion.get_int(request.query_params, 'order')
        if not order in settings.TRAVEL_LIST_MODES:
            order = settings.TRAVEL_LIST_MODE_DEFAULT
        if order == settings.TRAVEL_LIST_MODE_TIME:
            queryset = queryset.order_by('-time')
        elif order == settings.TRAVEL_LIST_MODE_HEAT:
            queryset = self.heat_annotate(queryset)
        elif order == settings.TRAVEL_LIST_MODE_RECOMMEND:
            queryset = queryset
        return queryset

    @classmethod
    def heat_annotate(cls, queryset):
        return queryset \
            .annotate(heat= \
                          settings.TRAVEL_HEAT_WEIGHT_RECENT * Sum('read_records__amount') + \
                          settings.TRAVEL_HEAT_WEIGHT_COLLECTIONS * Count('collectors') + \
                          settings.TRAVEL_HEAT_WEIGHT_LIKES * Count('likes') + \
                          settings.TRAVEL_HEAT_WEIGHT_COMMENTS * Count('comments')
                      ) \
            .order_by('-heat')


class TravelApis(viewsets.ModelViewSet):
    permission_classes = [permission.ContentPermission]
    filter_backends = [TravelFilterBackend, DjangoFilterBackend]
    queryset = TravelNotes.objects.all()
    serializer_class = TravelSerializer

    def retrieve(self, request, *args, **kwargs):
        obj = self.get_object()
        request_user = permission.user_check(request)
        is_owner = obj.owner_id == request_user
        if (obj.forbidden or obj.visibility == settings.TRAVEL_VISIBILITIES_PRIVATE) and not is_owner:
            raise NotFound()

        obj.read_increase()
        obj = self.get_object()
        serializer = self.get_serializer(obj)
        data = serializer.data
        if request_user > 0:
            data['liked'] = True if obj.likes.filter(id=request_user) else False
        else:
            data['liked'] = False
        if is_owner:
            data['forbidden_reason'] = obj.forbidden_reason
        else:
            # Log
            save_log(user_id=request_user, action=settings.LOG_TRAVEL_VIEW, target_id=obj.id)
        return Response(data)

    @action(methods=["GET"], detail=False, url_path='positions')
    def list_positions(self, request, *args, **kwargs):
        """
        owner = _permission.user_check(request)
        if owner <= 0:
            return error_response(Error.NOT_LOGIN, 'Please login.', status=status.HTTP_403_FORBIDDEN)
        #"""
        owner = conversion.get_int(request.GET, 'id', errtype=ParseError)
        queryset = self.filter_queryset(self.get_queryset().filter(owner_id=owner))

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = TravelAddressSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = TravelAddressSerializer(queryset, many=True)
        return Response(serializer.data)

    def create(self, request, *args, **kwargs):
        owner = permission.user_check(request)

        if owner <= 0:
            return error_response(Error.NOT_LOGIN, 'Please login.', status=status.HTTP_403_FORBIDDEN)
        data = request.data
        if isinstance(data, QueryDict):
            data = data.dict()
        if 'position' in data:
            position = data.get('position')
        else:
            position = None

        data['owner'] = owner
        # Collection
        collection = data.get('collection', None)
        try:
            data['collection'] = TravelNotesCollection.objects.all().filter(
                Q(owner_id=owner) & Q(id=collection)).first().id
        except Exception:
            data['collection'] = TravelNotesCollection.objects.all().filter(
                Q(owner_id=owner) & Q(title=settings.DEFAULT_TITLE_NAME)).first().id

        # Tags
        if_legal = True
        try:
            tags = data['tag'].split(' ')
            data['tag'] = []
            for tag in tags:
                if tag == '': continue
                try:
                    Tag.objects.all().get(name=tag)
                except Exception:
                    if judge_shielding_words(tag):
                        if_legal = False
                        continue
                    else:
                        Tag.objects.create(name=tag)
                data['tag'].append(tag)
        except Exception:
            data['tag'] = []
            pass
        if position is not None:
            # TODO:when update changes position?
            tag = position['address']['city']
            if tag is not None and tag != '':
                try:
                    Tag.objects.all().get(name=tag)
                except Exception:
                    Tag.objects.create(name=tag)
                data['tag'].append(tag)
        # Schedule
        src_sch_date = data.get('schedule_date', None)
        try:
            src_sch = Schedule.objects.all().filter(Q(date=src_sch_date) & Q(owner_id=owner)).first()
        except Exception:
            src_sch = None
        if src_sch is not None:
            dst_src = copy_schedule(src_sch)
            schedule_title = data.get('schedule_title', None)
            if schedule_title is not None and schedule_title != "":
                dst_src.title = schedule_title
                dst_src.save()
            data['schedule'] = dst_src.id
        else:
            data.pop('schedule', None)

        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        obj = serializer.save()
        if position:
            obj.position = Address.create_address(position)

        # Log
        save_log(user_id=owner, action=settings.LOG_TRAVEL_CREATE, target_id=obj.id)

        # add_corpus
        if obj.visibility == settings.TRAVEL_VISIBILITIES_ALL and obj.forbidden == settings.TRAVEL_FORBIDDEN_FALSE:
            travel = {obj.id: obj.content[:300]}
            my_model.add_travel(travel)

        headers = self.get_success_headers(serializer.data)
        return Response(data={"result": serializer.data, "if_legal": if_legal}, status=status.HTTP_201_CREATED,
                        headers=headers)

    def update(self, request, *args, **kwargs):
        owner = permission.user_check(request)
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        data = request.data
        if isinstance(data, QueryDict):
            data = data.dict()
        # Schedule
        data.pop('schedule', None)

        # Tag
        tags = data['tag'].split(' ')
        data['tag'] = []
        for tag in tags:
            if tag == '': continue
            try:
                Tag.objects.all().get(name=tag)
            except Exception:
                Tag.objects.create(name=tag)
            data['tag'].append(tag)

        serializer = self.get_serializer(instance, data=data, partial=partial)
        serializer.is_valid(raise_exception=True)
        try:
            serializer.save()
        except Exception as e:
            print(e)
            raise NotFound()

        # Log
        save_log(user_id=owner, action=settings.LOG_TRAVEL_EDIT, target_id=instance.id)

        if getattr(instance, '_prefetched_objects_cache', None):
            # If 'prefetch_related' has been applied to a queryset, we need to
            # forcibly invalidate the prefetch cache on the instance.
            instance._prefetched_objects_cache = {}

        return Response(serializer.data)

    @permission.white_action(methods=['POST'], detail=True, url_path='like')
    def like(self, request, *args, **kwargs):
        owner = permission.user_check(request)
        if owner <= 0:
            return error_response(Error.NOT_LOGIN, 'Please login.', status=status.HTTP_403_FORBIDDEN)
        if not AppUser.objects.filter(id=owner):
            return error_response(Error.INVALID_USER, 'Invalid user.', status=status.HTTP_400_BAD_REQUEST)
        obj = self.get_object()
        cancel = conversion.get_bool(request.data, 'cancel')
        if cancel:
            obj.likes.remove(owner)
            msg = Message.objects.filter(related_travel=obj, owner=owner, type=settings.MESSAGE_TYPE_LIKE_TRAVEL)
            if msg:
                msg.delete()

            # Log
            save_log(user_id=owner, action=settings.LOG_TRAVEL_LIKE_CANCEL, target_id=obj.id)

        else:
            obj.likes.add(owner)
            if not Message.objects.filter(related_travel=obj, owner=owner, type=settings.MESSAGE_TYPE_LIKE_TRAVEL):
                Message.create_message(owner, obj.owner, settings.MESSAGE_TYPE_LIKE_TRAVEL, travel=obj)

            # Log
            save_log(user_id=owner, action=settings.LOG_TRAVEL_LIKE, target_id=obj.id)

        return response()

    @action(methods=['POST', 'DELETE'], detail=True, url_path='image')
    def image(self, request, *args, **kwargs):
        if request.method == 'DELETE':
            return self.image_delete(request, *args, **kwargs)
        return self.image_upload(request, *args, **kwargs)

    def image_upload(self, request, *args, **kwargs):
        obj = self.get_object()
        imgfile = request.data.get('image', None)
        if imgfile is None or not isinstance(imgfile, UploadedFile):
            return error_response(status.HTTP_400_BAD_REQUEST, 'Invalid image.', status=status.HTTP_400_BAD_REQUEST)
        desc = request.data.get('description', '')
        image = Image.objects.create(image=imgfile, description=desc)
        obj.images.add(image)
        return response({'id': image.id})

    def image_delete(self, request, *args, **kwargs):
        obj = self.get_object()
        imgid = conversion.get_list(request.data, 'id')
        images = obj.images.filter(id__in=imgid)
        images.delete()
        return response()

    @action(methods=['POST', 'DELETE'], detail=True, url_path='cover')
    def cover(self, request, *args, **kwargs):
        if request.method == 'DELETE':
            return self.cover_delete(request, *args, **kwargs)
        return self.cover_upload(request, *args, **kwargs)

    def cover_upload(self, request, *args, **kwargs):
        obj = self.get_object()
        imgfile = request.data.get('image', None)
        if imgfile is None or not isinstance(imgfile, UploadedFile):
            return error_response(status.HTTP_400_BAD_REQUEST, 'Invalid image.', status=status.HTTP_400_BAD_REQUEST)
        desc = request.data.get('description', '')
        image = Image.objects.create(image=imgfile, description=desc)
        obj.cover = image
        obj.save()
        return response({'id': image.id})

    def cover_delete(self, request, *args, **kwargs):
        obj = self.get_object()
        obj.cover = None
        obj.save()
        return response()

    @permission.white_action(methods=['GET', 'POST'], detail=True, url_path='comments')
    def comments(self, request, *args, **kwargs):
        request_user = permission.user_check(request)
        obj = self.get_object()
        is_owner = obj.owner_id == request_user
        if (obj.forbidden or obj.visibility == settings.TRAVEL_VISIBILITIES_PRIVATE) and not is_owner:
            raise NotFound()
        if request.method == 'POST':
            return self.comment_create(request, *args, **kwargs)
        return self.comment_retrieve(request, *args, **kwargs)

    def comment_retrieve(self, request, *args, **kwargs):
        direct = conversion.get_bool(request.GET, 'direct')
        if direct:
            queryset = Comment.objects.filter(
                master=self.get_object(),
                reply=None,
                # deleted=False,
            )
        else:
            queryset = Comment.objects.filter(
                master=self.get_object(),
                # deleted=False,
            )

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = CommentSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = CommentSerializer(queryset, many=True)
        return Response(serializer.data)

    def comment_create(self, request, *args, **kwargs):
        owner_id = permission.user_check(request)
        if owner_id <= 0:
            return error_response(Error.NOT_LOGIN, 'Please login.', status=status.HTTP_403_FORBIDDEN)
        data = request.data
        if isinstance(data, QueryDict):
            data = data.dict()
        data['owner'] = owner_id
        data['type'] = settings.COMMENT_TYPE_TRAVEL

        serializer = CommentSerializer(data=data)
        serializer.is_valid(raise_exception=True)
        comment = serializer.save()
        obj = self.get_object()
        comment.master = obj
        comment.save()

        reply = comment.reply
        if reply:
            root = reply.reply_root
            if root:
                comment.reply_root = root
            else:
                comment.reply_root = reply
            comment.save()

        if comment.reply:
            if owner_id != comment.reply.owner_id:
                Message.create_message(comment.owner, comment.reply.owner, settings.MESSAGE_TYPE_COMMENT_ON_COMMENT,
                                       comment=comment.reply)
        else:
            if owner_id != obj.owner_id:
                Message.create_message(comment.owner, obj.owner, settings.MESSAGE_TYPE_COMMENT_ON_TRAVEL, travel=obj)

        # Log
        save_log(user_id=owner_id, action=settings.LOG_COMMENT_CREATE, target_id=comment.id)

        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    @action(methods=['GET'], detail=False, url_path='recommend')
    def recommend(self, request: Request, *args, **kwargs):
        owner_id = permission.user_check(request)
        if owner_id > 0:
            user = AppUser.objects.filter(id=owner_id)
            if user:
                user = user.first()
            else:
                user = None
        else:
            user = None
        amount = conversion.get_int(request.query_params, 'count')
        if amount is None:
            amount = settings.TRAVEL_RECOMMEND_DEFAULT_AMOUNT
        else:
            amount = min(amount, settings.TRAVEL_RECOMMEND_MAX_AMOUNT)

        self_queryset = self.get_queryset().filter(Q(forbidden=settings.TRAVEL_FORBIDDEN_FALSE,
                                                     visibility=settings.TRAVEL_VISIBILITIES_ALL))

        if user is not None:
            filter_args = {}

            first_likes = user.first_likes()
            if first_likes:
                filter_args['time__gte'] = first_likes[first_likes.count() - 1].time
            liked_users = first_likes.values_list('owner_id', flat=True)

            cluster_amount = round(
                settings.TRAVEL_RECOMMEND_CLUSTER_WEIGHT * amount * settings.TRAVEL_RECOMMEND_EXCEED_RATE)
            user_amount = round(settings.TRAVEL_RECOMMEND_USER_WEIGHT * amount * settings.TRAVEL_RECOMMEND_EXCEED_RATE)
            heat_amount = round(settings.TRAVEL_RECOMMEND_HEAT_WEIGHT * amount * settings.TRAVEL_RECOMMEND_EXCEED_RATE)

            cluster_query = self_queryset.filter(likes__cluster=user.cluster, **filter_args)
            cluster_query = filters.random_filter(cluster_query, cluster_amount).distinct()
            cluster_ids = cluster_query.values_list('id', flat=True)
            user_query = self_queryset.exclude(id__in=cluster_ids).filter(owner_id__in=liked_users, **filter_args)
            user_amount += max(0, cluster_amount - cluster_query.count())
            user_query = filters.random_filter(user_query, user_amount).distinct()
            user_ids = user_query.values_list('id', flat=True)
            heat_query = TravelFilterBackend.heat_annotate(self_queryset.exclude(id__in=user_ids | cluster_ids))

            heat_amount += max(0, user_amount - user_query.count())

            data = cluster_query | user_query
            a = round((settings.TRAVEL_RECOMMEND_CLUSTER_WEIGHT + settings.TRAVEL_RECOMMEND_USER_WEIGHT) * amount)
            data = filters.random_filter(data, a, distinct=True)
            data = self.get_list_data(request, data)
            data1 = [q for q in heat_query[:heat_amount]]
            data1 = random.sample(data1, min(amount - a, len(data1)))
            data += self.get_list_data(request, data1)
        else:
            data = self_queryset
            data = filters.random_filter(data, amount, distinct=True)
            data = self.get_list_data(request, data)
        filters.shuffle(data)
        return Response({'count': len(data), 'data': data})

    @action(methods=['GET'], detail=False, url_path='tag_query')
    def tag_query(self, request, *args, **kwargs):
        owner_id = permission.user_check(request)
        if owner_id > 0:
            user = AppUser.objects.filter(id=owner_id)
            if user:
                user = user.first()
            else:
                raise NotFound()
        else:
            raise NotFound()

        self_queryset = self.get_queryset().filter(Q(forbidden=settings.TRAVEL_FORBIDDEN_FALSE,
                                                     visibility=settings.TRAVEL_VISIBILITIES_ALL))
        tags = request.query_params.get('tag', None)
        if tags is not None:
            tags = tags.split(' ')
            for tag in tags:
                if tag == '':
                    continue
                self_queryset = self_queryset.filter(tag=tag)
        order = request.query_params.get('order', None)
        if order is not None:
            order = eval(order)
        else:
            order = settings.TAG_QUERY_ORDER_BY_DEFAULT
        if order == settings.TAG_QUERY_ORDER_BY_TIME_UP:
            self_queryset = self_queryset.order_by('time')
        elif order == settings.TAG_QUERY_ORDER_BY_TIME_DOWN:
            self_queryset = self_queryset.order_by('-time')
        else:
            self_queryset = self_queryset.annotate(
                heat_score=12 + F('read_total') + 4 * Count('likes') + 6 * Count('comments'),
                time_score=ExpressionWrapper((Cast(datetime.now(timezone.utc), output_field=DateTimeField()))
                                             - F('time'), output_field=IntegerField()),
                subscribe_score=Exists(Subquery(user.subscription.all().filter(id=OuterRef('owner_id')))),
                influence_score=Count('owner__subscribers')
            ).annotate(final_score=Sqrt(F('heat_score')) *
                                   (1 + 618 * pow(1.5, -0.1 - F('time_score') / 3600000000 / 24.0)) *
                                   (10 if F('subscribe_score') == True else 1) *
                                   (3 + 0.2 * Sqrt(F('influence_score')))).order_by('-final_score')
        page = self.paginate_queryset(self_queryset)
        if page is not None:
            data = self.get_list_data(request, page)
            return self.get_paginated_response(data)

        data = self.get_list_data(request, self_queryset)
        return Response(data)

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())

        page = self.paginate_queryset(queryset)
        if page is not None:
            data = self.get_list_data(request, page)
            return self.get_paginated_response(data)

        data = self.get_list_data(request, queryset)
        return Response(data)

    def get_list_data(self, request, queryset):
        owner_id = permission.user_check(request)
        if owner_id > 0:
            user = AppUser.objects.filter(id=owner_id)
            if user:
                user = user.first()
            else:
                user = None
        else:
            user = None
        serializer = TravelListSerializer(queryset, many=True)
        data = serializer.data
        for d, obj in zip(data, queryset):
            if user:
                d['liked'] = True if obj.likes.filter(id=owner_id) else False
            else:
                d['liked'] = False
        return data

    # 这是老版本的similar
    @action(methods=['GET'], detail=True, url_path='similar_old')
    def similar_old(self, request, *args, **kwargs):
        obj: TravelNotes = self.get_object()
        count = conversion.get_int(request.query_params, 'count')
        if count is None:
            count = settings.TRAVEL_SIMILAR_AMOUNT
        else:
            count = min(count, settings.TRAVEL_SIMILAR_MAX_AMOUNT)

        self_queryset = self.get_queryset().filter(Q(forbidden=settings.TRAVEL_FORBIDDEN_FALSE,
                                                     visibility=settings.TRAVEL_VISIBILITIES_ALL))

        queryset = self_queryset.exclude(id=obj.id)
        if obj.position is None:
            data = self.get_list_data(request, filters.random_filter(queryset, count))
        else:
            same_district = queryset.filter(position__position__id=obj.position.position_id)
            c = count - same_district.count()
            if c > 0:
                same_city = queryset.filter(position__city_position__id=obj.position.city_position_id)
                c1 = c - same_city.count()
                if c1 > 0:
                    same_province = queryset.filter(position__province_position__id=obj.position.province_position_id)
                    ids = same_city.values_list('id', flat=True)
                    same_province = same_province.exclude(id__in=ids)
                    same_province = filters.random_filter(same_province, c1)
                    same_province = same_province.exclude(id__in=same_city.values_list('id', flat=True))
                    if same_province:
                        same_city |= same_province
                else:
                    ids = same_district.values_list('id', flat=True)
                    same_city = same_city.exclude(id__in=ids)
                    same_city = filters.random_filter(same_city, c)
                same_city = same_city.exclude(id__in=same_district.values_list('id', flat=True))
                if same_city:
                    same_district = list(same_city) + list(same_district)
                else:
                    same_district = list(same_district)
            else:
                same_district = filters.random_filter(same_district, count)
                same_district = list(same_district)

            c = count - len(same_district)
            if c > 0:
                ids = list(map(lambda x: x.id, same_district))  # same_district.values_list('id', flat=True)
                queryset = queryset.exclude(id__in=ids)
                same_district += list(filters.random_filter(queryset, c))

            data = self.get_list_data(request, same_district)
        filters.shuffle(data)
        return Response({'count': len(data), 'data': data})


    # 下面是重写的similar部分
    @action(methods=['GET'], detail=True, url_path='similar')
    def similar(self, request, *args, **kwargs):
        obj: TravelNotes = self.get_object()
        similar_ids = my_model.get_similar_travels(src_travel=obj.content)
        try:
            similar_ids.remove(obj.id)
        except Exception:
            similar_ids.pop(-1)
        queryset = TravelNotes.objects.all().filter(Q(id__in=similar_ids) &
                                                    Q(forbidden=settings.TRAVEL_FORBIDDEN_FALSE,
                                                 visibility=settings.TRAVEL_VISIBILITIES_ALL)) \
                       .order_by("?")[:3]
        data = self.get_list_data(request, queryset)
        filters.shuffle(data)
        return Response({'count': len(data), 'data': data})

    def destroy(self, request, *args, **kwargs):
        owner = permission.user_check(request)
        instance = self.get_object()
        try:
            instance.schedule.delete()
        except Exception:
            pass
        # Log
        save_log(user_id=owner, action=settings.LOG_TRAVEL_DELETE, target_id=instance.id)
        instance.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    # 为节省加载时间，AI模型的导入需要使用下面这个接口
    # 注意多进程情况下的资源不共享的问题，因此需要多次调用该接口，确保每个进程都加载模型
    # 此处应当存在更优秀的处理办法，但是因时间与精力问题没有继续优化
    @action(methods=['POST'], detail=False, url_path='start_training')
    def start_training(self, request, *args, **kwargs):
        data = request.data
        password = data.get('password',None)
        if password == 'FcT#19*)PO&21w.35z177[//,':
            my_model.my_init()
        else:
            raise NotFound()
        return Response(status=status.HTTP_200_OK)

