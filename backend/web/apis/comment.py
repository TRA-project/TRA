from rest_framework import viewsets, permissions
from rest_framework.decorators import action

from utility.models import Comment
from web.serializers import CommentSerializer
from utils import conversion, filters
from utils.response import *

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


