import datetime

from django.db.models import Sum
from django.http import QueryDict
from rest_framework import viewsets, mixins
from rest_framework.decorators import action
from rest_framework.viewsets import GenericViewSet

from utility.models import Schedule, ScheduleItem
from rest_framework.exceptions import NotFound
from wechat_app.serializers import ScheduleBriefSerializer
from django_filters.rest_framework import DjangoFilterBackend
from utils.response import *
from utils import filters, permission

from utils.api_tools import *


class ScheduleFilterBackend(filters.QueryFilterBackend):
    filter_fields = [
        ("owner", "owner_id", "exact"),
        ("owner_name", "owner__name", "contains"),
        ("title", "title", "contains"),
    ]
    default_ordering_rule = 'date'

    def filter_queryset(self, request, queryset, view):
        owner = permission.user_check(request)
        if owner >= 0:
            queryset = super().filter_queryset(request, queryset.filter(Q(forbidden=settings.SCHEDULE_FORBIDDEN_FALSE,
                                                                          visibility=settings.SCHEDULE_VISIBILITIES_ALL) |
                                                                        Q(owner_id=owner)), view)
        else:
            queryset = super().filter_queryset(request, queryset.filter(
                visibility=settings.SCHEDULE_VISIBILITIES_ALL), view)
        user = request.query_params.get('user', None)
        if user is not None:
            queryset = queryset.filter(owner__name=user)
        query_date = request.query_params.get('date', None)
        if query_date is not None:
            query_year, query_month, query_day = query_date.split("-")
            query_date = datetime.date(eval(query_year), eval(query_month), eval(query_day))
            queryset = queryset.filter(Q(date=query_date))
        return queryset


class ScheduleApis(GenericViewSet, mixins.RetrieveModelMixin, mixins.ListModelMixin):
    permission_classes = [permission.ContentPermission]
    filter_backends = [ScheduleFilterBackend, DjangoFilterBackend]
    queryset = Schedule.objects.all()
    serializer_class = ScheduleSerializer

    def retrieve(self, request, *args, **kwargs):
        obj = self.get_object()
        request_user = permission.user_check(request)
        is_owner = obj.owner_id == request_user

        serializer = self.get_serializer(obj)
        data = serializer.data
        if is_owner:
            data['forbidden_reason'] = obj.forbidden_reason
        else:
            # Log
            save_log(user_id=request_user, action=settings.LOG_SCHEDULE_VIEW, target_id=obj.id)
        return Response(data)

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = ScheduleBriefSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = ScheduleBriefSerializer(queryset, many=True)
        return Response(serializer.data)

    @action(methods=['GET'], detail=False, url_path='query')
    def query(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        if queryset is None:
            raise NotFound()
        if queryset.count() > 1:
            print("warning in schedule/query : dulplicated schedules")
            raise NotFound()
        obj = queryset.first()
        request_user = permission.user_check(request)
        is_owner = obj.owner_id == request_user

        serializer = self.get_serializer(obj)
        data = serializer.data
        if is_owner:
            data['forbidden_reason'] = obj.forbidden_reason
        else:
            # Log
            save_log(user_id=request_user, action=settings.LOG_SCHEDULE_VIEW, target_id=obj.id)
        return Response(data)

    @action(methods=['PUT'], detail=False, url_path='update')
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', True)
        owner = permission.user_check(request)
        data = request.data
        queryset = self.get_queryset().filter(Q(owner__id=owner))
        if isinstance(data, QueryDict):
            data = data.dict()
            query_date = data.pop('date', None)
            data.pop('owner', None)
            if query_date is not None:
                query_year, query_month, query_day = query_date.split("-")
                query_date = datetime.date(eval(query_year), eval(query_month), eval(query_day))
                queryset = queryset.filter(Q(date=query_date))

        if queryset is None:
            raise NotFound()
        if queryset.count() > 1:
            print("warning in schedule/update : dulplicated schedules")
            raise NotFound()
        instance = queryset.first()

        serializer = self.get_serializer(instance, data=data, partial=partial)
        serializer.is_valid(raise_exception=True)
        try:
            serializer.save()
        except Exception as e:
            print(e)

        if getattr(instance, '_prefetched_objects_cache', None):
            # If 'prefetch_related' has been applied to a queryset, we need to
            # forcibly invalidate the prefetch cache on the instance.
            instance._prefetched_objects_cache = {}

        # Log
        save_log(user_id=owner, action=settings.LOG_SCHEDULE_EDIT, target_id=instance.id)

        return Response(serializer.data)

    @action(methods=['DELETE'], detail=False, url_path='delete')
    def delete(self, request, *args, **kwargs):
        owner = permission.user_check(request)
        data = request.data
        queryset = self.get_queryset().filter(Q(owner__id=owner))
        if isinstance(data, QueryDict):
            data = data.dict()
            query_date = data.pop('date', None)
            data.pop('owner', None)
            if query_date is not None:
                query_year, query_month, query_day = query_date.split("-")
                query_date = datetime.date(eval(query_year), eval(query_month), eval(query_day))
                queryset = queryset.filter(Q(date=query_date))
        if queryset is None:
            raise NotFound()
        if queryset.count() > 1:
            print("warning in schedule/delete : dulplicated schedules")
            raise NotFound()
        instance = queryset.first()

        # Log
        save_log(user_id=owner, action=settings.LOG_SCHEDULE_DELETE, target_id=instance.id)

        instance.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(methods=['POST'], detail=False, url_path='copy')
    def copy(self, request, *args, **kwargs):
        owner_id = permission.user_check(request)
        owner = AppUser.objects.all().filter(id=owner_id).first()
        schedule_id = request.data.get('schedule_id', None)
        schedule = Schedule.objects.all().filter(id=schedule_id).first()
        if schedule is None:
            raise NotFound()
        travel = schedule.schedule_travel_records.all().first()
        if travel is None:
            companion = schedule.schedule_companion_records.all().first()
            if companion is None:
                raise NotFound()
            if companion.forbidden != settings.TRAVEL_FORBIDDEN_FALSE and companion.owner_id != owner_id:
                raise NotFound()
        elif (travel.visibility == settings.TRAVEL_VISIBILITIES_PRIVATE or
            travel.forbidden != settings.TRAVEL_FORBIDDEN_FALSE) and travel.owner_id != owner_id:
            raise NotFound()

        option = eval(request.data.get('option', str(settings.SCHEDULE_COPY_DEFAULT)))
        date = request.data.get('date', schedule.date)
        old_shcedule = Schedule.objects.all().filter(Q(owner_id=owner_id) & Q(date=date)).first()
        final_schedule = old_shcedule
        if option == settings.SCHEDULE_COPY_COVER or \
                (option == settings.SCHEDULE_COPY_MERGE and old_shcedule is None):
            if old_shcedule is not None:
                old_shcedule.delete()
            new_schedule = copy_schedule(schedule)
            new_schedule.owner = owner
            new_schedule.date = date
            new_schedule.save()
            final_schedule = new_schedule
        elif option == settings.SCHEDULE_COPY_MERGE:
            merge_schedule_items(schedule, old_shcedule)
        # Log
        save_log(user_id=owner_id, action=settings.LOG_SCHEDULE_COPY, target_id=final_schedule.id)
        serializer = self.get_serializer(final_schedule)
        return Response(status=status.HTTP_200_OK, data=serializer.data)


class ScheduleItemFilterBackend(filters.QueryFilterBackend):
    default_ordering_rule = 'start_time'

    def filter_queryset(self, request, queryset, view):
        owner = permission.user_check(request)
        query_schedule_id = request.query_params.get('schedule_id', None)
        schedule = Schedule.objects.all().filter(id=query_schedule_id).first()
        if schedule is not None and \
                ((schedule.visibility == settings.SCHEDULE_VISIBILITIES_ALL and
                  schedule.forbidden == settings.SCHEDULE_FORBIDDEN_FALSE) or schedule.owner_id == owner):
            queryset = schedule.schedule_items.all()

        queryset = super().filter_queryset(request, queryset, view)
        return queryset


class ScheduleItemApis(viewsets.ModelViewSet):
    permission_classes = [permission.ScheduleItemPermission]
    filter_backends = [ScheduleItemFilterBackend, DjangoFilterBackend]
    queryset = ScheduleItem.objects.all()
    serializer_class = ScheduleItemSerializer

    def create(self, request, *args, **kwargs):
        owner = permission.user_check(request)
        if owner <= 0:
            return error_response(Error.NOT_LOGIN, 'Please login.', status=status.HTTP_403_FORBIDDEN)
        data = request.data
        if isinstance(data, QueryDict):
            data = data.dict()
        query_date = data.get('date', None)
        if query_date is not None:
            query_year, query_month, query_day = query_date.split("-")
            query_date = datetime.date(eval(query_year), eval(query_month), eval(query_day))
        else:
            return error_response(Error.SCHEDULE_DATE_OVERSTEP, 'Please offer the date.',
                                  status=status.HTTP_404_NOT_FOUND)
        schedule = Schedule.objects.all().filter(Q(owner__id=owner) & Q(date=query_date)).first()
        if_create = False
        if schedule is None:
            schedule_data = dict()
            schedule_data['owner'] = owner
            schedule_data['date'] = query_date
            schedule_data['title'] = query_date.__str__()
            serializer = ScheduleSerializer(data=schedule_data)
            serializer.is_valid(raise_exception=True)
            schedule = serializer.save()
            if_create = True
            # Log
            save_log(user_id=owner, action=settings.LOG_SCHEDULE_CREATE, target_id=schedule.id)
        data['schedule'] = schedule.id

        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        obj = serializer.save()
        if not if_create:
            # Log
            save_log(user_id=owner, action=settings.LOG_SCHEDULE_EDIT, target_id=schedule.id)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def list(self, request, *args, **kwargs):
        owner = permission.user_check(request)
        if owner <= 0:
            return error_response(Error.NOT_LOGIN, 'Please login.', status=status.HTTP_403_FORBIDDEN)
        schedule = Schedule.objects.all().filter(Q(owner_id=owner))
        query_date = request.query_params.get('date', None)
        if query_date is not None:
            query_year, query_month, query_day = query_date.split("-")
            query_date = datetime.date(eval(query_year), eval(query_month), eval(query_day))
            schedule = schedule.filter(Q(date=query_date))

        if schedule.count() > 1:
            raise NotFound()
        elif schedule.count() == 0:
            count = 0
            queryset = ScheduleItem.objects.none()
        else:
            schedule = schedule.first()
            queryset = schedule.schedule_items.all().order_by('start_time', 'end_time')
            count = queryset.count()
        serializer = self.get_serializer(queryset, many=True)
        data = serializer.data
        sum_budget = queryset.aggregate(sum=Sum('budget'))
        sum_budget = 0 if sum_budget['sum'] is None else sum_budget['sum']
        sum_consumption = queryset.aggregate(sum=Sum('real_consumption'))
        sum_consumption = 0 if sum_consumption['sum'] is None else sum_consumption['sum']
        return Response({"count": count, "results": data, "sum_budget": sum_budget,
                         "sum_consumption": sum_consumption})

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        data = request.data.copy()
        data.pop('schedule', None)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        if getattr(instance, '_prefetched_objects_cache', None):
            # If 'prefetch_related' has been applied to a queryset, we need to
            # forcibly invalidate the prefetch cache on the instance.
            instance._prefetched_objects_cache = {}
        owner = permission.user_check(request)
        # Log
        save_log(user_id=owner, action=settings.LOG_SCHEDULE_EDIT, target_id=instance.schedule.id)
        return Response(serializer.data)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        schedule = instance.schedule
        instance.delete()
        owner = permission.user_check(request)
        if schedule.schedule_items.all().count() > 0:
            # Log
            save_log(user_id=owner, action=settings.LOG_SCHEDULE_EDIT, target_id=schedule.id)
        else:
            # Log
            save_log(user_id=owner, action=settings.LOG_SCHEDULE_DELETE, target_id=schedule.id)
            schedule.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

