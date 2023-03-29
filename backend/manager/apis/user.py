from rest_framework import viewsets, permissions

from utils.response import *
from user.models import AppUser
from manager.serializers import UserSerializer
from utils.conversion import get_list
from utils import filters

class UserApis(viewsets.ModelViewSet):
    filter_backends = [filters.QueryFilterBackend.custom(
        ('name', 'name', 'contains'),
        ('nickname', 'nickname', 'contains'),
        ('id', 'id', 'exact'),
    ordering_rule='-time')]
    permission_classes = [permissions.IsAuthenticated]
    queryset = AppUser.objects.all()
    serializer_class = UserSerializer

    def bulk_destroy(self, request, *args, **kwargs):
        ids = get_list(request.data, 'id')
        objs = self.get_queryset().filter(id__in=ids)
        objs.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

