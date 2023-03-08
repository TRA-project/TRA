from rest_framework import viewsets, permissions
from rest_framework.response import Response
from rest_framework.exceptions import ParseError, NotAcceptable, PermissionDenied
from rest_framework.decorators import action
from django.http import QueryDict

from django.conf import settings
from app.models import AdminMessage, AppUser
from app.serializers import AdminMessageSerializer
from app.utilities import permission
from app.response import *
from utilities import conversion, filters, permission as _permission, date

class AdminMessageApis(viewsets.GenericViewSet, viewsets.mixins.CreateModelMixin):
    permission_classes = []
    queryset = AdminMessage.objects.all()
    serializer_class = AdminMessageSerializer

    def create(self, request, *args, **kwargs):
        owner_id = _permission.user_check(request)
        if owner_id <= 0:
            return error_response(Error.NOT_LOGIN, 'Please login.', status=status.HTTP_403_FORBIDDEN)
        user = AppUser.objects.filter(id=owner_id)
        if not user:
            return error_response(Error.INVALID_USER, 'Invalid user.', status=status.HTTP_400_BAD_REQUEST)
        user : AppUser = user.first()

        time_limit = user.last_admin_message_time + date.delta(settings.ADMIN_MESSAGE_TIME_LIMIT)
        now = date.now()
        if now < time_limit:
            return error_response(Error.ADMIN_MESSAGE_TIME_LIMIT, f'{date.format(time_limit)}', status=status.HTTP_403_FORBIDDEN)

        data = request.data
        if isinstance(data, QueryDict):
            data = data.dict()

        data['owner'] = owner_id

        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)

        user.last_admin_message_time = now
        user.save()

        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

