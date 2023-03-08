from rest_framework import viewsets, permissions
from rest_framework.response import Response
from rest_framework.exceptions import ParseError, NotAcceptable, PermissionDenied
from rest_framework.decorators import action

from app.models import Message, AppUser
from app.serializers import MessageSerializer
from app.utilities import permission
from app.response import *
from utilities import conversion, filters, permission as _permission

class MessageFilterBackend(filters.QueryFilterBackend):
    default_ordering_rule = '-time'

    def filter_queryset(self, request, queryset, view):
        owner = _permission.user_check(request)
        queryset = super().filter_queryset(request, queryset.filter(target_users__id=owner), view)
        return queryset

class MessageApis(viewsets.GenericViewSet, viewsets.mixins.RetrieveModelMixin,
                  viewsets.mixins.ListModelMixin):
    filter_backends = [MessageFilterBackend]
    permission_classes = [permission.ContentPermission]
    queryset = Message.objects.all()
    serializer_class = MessageSerializer

    def retrieve(self, request, *args, **kwargs):
        owner = _permission.user_check(request)
        if owner:
            obj = self.get_object()
            obj.unread_users.remove(owner)
            obj.save()
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        data = serializer.data
        return Response(data)

    @action(methods=['POST'], detail=False, url_path='read')
    def bulk_read(self, request, *args, **kwargs):
        request_user = _permission.user_check(request)
        user = AppUser.objects.filter(id=request_user)
        if not user:
            return error_response(Error.INVALID_USER, status=status.HTTP_403_FORBIDDEN)
        user: AppUser = user.first()
        ids = request.data.get('id', None)
        if ids is None:
            user.unread_messages.clear()
        else:
            ids = set(conversion.get_list(request.data, 'id'))
            user.unread_messages.filter(id__in=ids).delete()
        return response()
