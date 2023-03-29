import datetime

from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from django.db.models import Q
from django.conf import settings
from user.models import Message, Schedule
from utils.response import *
from manager.serializers import ScheduleSerializer
from utils import conversion, filters, date


class ScheduleFilterBackend(filters.QueryFilterBackend):
    filter_fields = [
        ('id', 'id', 'exact'),
        ('forbidden', 'forbidden'),
        ('owner', 'owner_id', 'exact'),
    ]
    default_ordering_rule = 'date'

    def filter_queryset(self, request, queryset, view):
        queryset = super().filter_queryset(request, queryset.filter(
            visibility=settings.SCHEDULE_VISIBILITIES_ALL), view)
        query_date = request.query_params.get('date', None)
        if query_date is not None:
            query_year, query_month, query_day = query_date.split("-")
            query_date = datetime.date(eval(query_year), eval(query_month), eval(query_day))
            queryset = queryset.filter(Q(date=query_date))
        return queryset

class ScheduleApis(viewsets.ModelViewSet):
    filter_backends = [ScheduleFilterBackend]
    permission_classes = [permissions.IsAuthenticated]
    queryset = Schedule.objects.all()
    serializer_class = ScheduleSerializer

    def bulk_destroy(self, request, *args, **kwargs):
        ids = conversion.get_list(request.data, 'id')
        objs = self.get_queryset().filter(id__in=ids)
        objs.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(methods=['POST'], detail=False, url_path='forbid')
    def forbid(self, request, *args, **kwargs):
        ids = conversion.get_list(request.data, 'id')
        stat = conversion.get_int(request.data, 'status')
        if stat is None:
            stat = settings.SCHEDULE_FORBIDDEN_TRUE
        reason = conversion.get_str(request.data, 'reason')
        objs = Schedule.objects.filter(id__in=ids)
        query = {
            'forbidden': stat,
        }
        if reason is not None:
            query['forbidden_reason'] = reason
        objs.update(**query)
        if stat == settings.SCHEDULE_FORBIDDEN_FALSE:
            for obj in objs:
                forbid = Message.objects.filter(target_users__id=obj.owner_id, related_schedule_id=obj.id, type=settings.MESSAGE_TYPE_SCHEDULE_FORBIDDEN)
                if forbid:
                    forbid : Message = forbid.first()
                    forbid.time = date.now()
                    forbid.type = settings.MESSAGE_TYPE_SCHEDULE_FORBIDDEN_CANCEL
                    obj.owner.unread_messages.remove(forbid)
                else:
                    cancel = Message.objects.filter(target_users__id=obj.owner_id, related_schedule_id=obj.id, type=settings.MESSAGE_TYPE_SCHEDULE_FORBIDDEN_CANCEL)
                    if not cancel:
                        Message.create_message(None, obj.owner, type=settings.MESSAGE_TYPE_SCHEDULE_FORBIDDEN_CANCEL, schedule=obj)
        else:
            for obj in objs:
                cancel = Message.objects.filter(target_users__id=obj.owner_id, related_schedule_id=obj.id, type=settings.MESSAGE_TYPE_SCHEDULE_FORBIDDEN_CANCEL)
                if cancel:
                    cancel : Message = cancel.first()
                    cancel.time = date.now()
                    cancel.type = settings.MESSAGE_TYPE_SCHEDULE_FORBIDDEN
                    obj.owner.unread_messages.remove(cancel)
                else:
                    forbid = Message.objects.filter(target_users__id=obj.owner_id, related_schedule_id=obj.id, type=settings.MESSAGE_TYPE_SCHEDULE_FORBIDDEN)
                    if not forbid:
                        Message.create_message(None, obj.owner, type=settings.MESSAGE_TYPE_SCHEDULE_FORBIDDEN, schedule=obj)
        return Response(self.get_serializer(objs, many=True).data)
