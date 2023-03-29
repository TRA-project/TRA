from django.conf import settings
from rest_framework.decorators import action

from utils.api_tools import save_log
from user.models import UsersFlight, Flight
from user.serializers import UsersFlightSerializer

from rest_framework import viewsets
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.exceptions import NotFound
from django.http import QueryDict
from django.db.models import Q
from utils.response import *
from utils import permission, filters


class UsersFlightFilterBackend(filters.QueryFilterBackend):
    default_ordering_rule = '-flight__depart_time'

    def filter_queryset(self, request, queryset, view):
        owner = permission.user_check(request)

        queryset = super().filter_queryset(request, queryset.filter(user_id=owner), view)
        flight_id = request.query_params.get('flight_id', None)
        if flight_id is not None:
            queryset = queryset.filter(flight_id=flight_id)
        return queryset


class UsersFlightApis(viewsets.ModelViewSet):
    filter_backends = [UsersFlightFilterBackend, DjangoFilterBackend]
    permission_classes = [permission.UsersFlightPermission]
    queryset = UsersFlight.objects.all()
    serializer_class = UsersFlightSerializer

    def create(self, request, *args, **kwargs):
        user = permission.user_check(request)

        if user <= 0:
            return error_response(Error.NOT_LOGIN, 'Please login.', status=status.HTTP_403_FORBIDDEN)
        data = request.data
        if isinstance(data, QueryDict):
            data = data.dict()
        flight_id = data.get('flight', None)
        if flight_id is None or Flight.objects.all().filter(id=flight_id).first() is None:
            raise NotFound()
        if UsersFlight.objects.all().filter(Q(user_id=user) & Q(flight_id=flight_id)).count() > 0:
            return error_response(Error.USERS_FLIGHT_EXISTS, 'Already exists.', status=status.HTTP_403_FORBIDDEN)

        data['user'] = user
        data['flight'] = eval(flight_id)
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        obj = serializer.save()

        # Log
        save_log(user_id=user, action=settings.LOG_FLIGHT_FOLLOW, target_id=eval(flight_id))

        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    @action(methods=['POST'], detail=False, url_path='cancel_follow')
    def cancel_follow(self, request, *args, **kwargs):
        user = permission.user_check(request)

        data = request.data
        if isinstance(data, QueryDict):
            data = data.dict()
        flight = data.get('flight', None)
        obj = UsersFlight.objects.all().filter(Q(user_id=user) & Q(flight_id=flight)).first()
        if obj is None:
            raise NotFound()
        self.check_object_permissions(self.request, obj)
        obj.delete()

        # Log
        save_log(user_id=user, action=settings.LOG_FLIGHT_FOLLOW_CANCEL, target_id=flight)

        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(methods=['POST'], detail=False, url_path='alarm')
    def alarm(self, request, *args, **kwargs):
        user = permission.user_check(request)

        data = request.data
        if isinstance(data, QueryDict):
            data = data.dict()
        flight = data.get('flight', None)
        if_alarm = eval(data.get('if_alarm', None))
        if flight is None or if_alarm is None or if_alarm not in settings.SCHEDULE_ALARM_LIST:
            raise NotFound()

        obj = UsersFlight.objects.all().filter(Q(user_id=user) & Q(flight_id=flight)).first()
        if obj is None:
            raise NotFound()

        self.check_object_permissions(self.request, obj)
        obj.if_alarm = if_alarm
        obj.save()
        serializer = UsersFlightSerializer(obj)

        return Response(serializer.data)
