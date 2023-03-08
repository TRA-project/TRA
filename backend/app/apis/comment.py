from rest_framework import viewsets, permissions
from rest_framework.response import Response
from rest_framework.exceptions import ParseError, NotAcceptable, PermissionDenied, NotFound
from rest_framework.decorators import action
from django.conf import settings

from app.apis.tools import save_log
from app.models import Comment
from app.serializers import CommentSerializer, LogSerializer
from app.utilities import permission
from app.response import *
from utilities import conversion, filters
from utilities import filters, permission as _permission


class CommentFilterBackend(filters.QueryFilterBackend):
    default_ordering_rule = '-time'

    def filter_queryset(self, request, queryset, view):
        # queryset = queryset.filter(deleted=False)
        return super().filter_queryset(request, queryset, view)


class CommentApis(viewsets.GenericViewSet, viewsets.mixins.ListModelMixin,
                  viewsets.mixins.RetrieveModelMixin):
    filter_backends = [CommentFilterBackend]
    permission_classes = [permission.ContentPermission]
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer

    def destroy(self, request, *args, **kwargs):
        obj = self.get_object()
        if obj.deleted:
            raise NotFound()

        obj.deleted = True
        obj.save()

        owner = _permission.user_check(request)
        # Log
        save_log(user_id=owner, action=settings.LOG_COMMENT_DELETE, target_id=obj.id)

        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(methods=['GET'], detail=True, url_path='responses')
    def responses(self, request, *args, **kwargs):
        direct = conversion.get_bool(request.GET, 'direct')
        if direct:
            queryset = self.get_object().responses.all()
        else:
            queryset = self.get_object().recursive_responses.all()
        queryset = self.filter_queryset(queryset)

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
