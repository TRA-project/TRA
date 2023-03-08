from rest_framework import viewsets, permissions
from rest_framework.response import Response
from rest_framework.exceptions import ParseError, NotAcceptable, PermissionDenied
from rest_framework.decorators import action
from django.db.models import Sum, F, Count, Q

from app.models import Comment
from adminsystem.serializers import CommentSerializer
from utilities import conversion, permission as _permission, filters
from app.response import *

class CommentApis(viewsets.ModelViewSet):
    filter_backends = [filters.QueryFilterBackend.custom(
        ('travel', 'master.id', 'exact'),
        ('root', 'reply_root', 'isnull'),
        ordering_rule='-time')]
    permission_classes = [permissions.IsAuthenticated]
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer

    def bulk_destroy(self, request, *args, **kwargs):
        ids = conversion.get_list(request.data, 'id')
        objs = self.get_queryset().filter(id__in=ids)
        objs.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(methods=['POST'], detail=False, url_path='delete')
    def delete(self, request, *args, **kwargs):
        ids = conversion.get_list(request.data, 'id')
        objs = self.get_queryset().filter(id__in=ids)
        objs.update(deleted=True)
        return Response(status=status.HTTP_204_NO_CONTENT)


