from utility.models import Port
from web.serializers import PortSerializer
from utils import filters
from rest_framework import viewsets, permissions


class PortFilterBackend(filters.QueryFilterBackend):
    filter_fields = [
        ('id', 'id', 'exact'),
        ('code', 'code', 'exact'),
        ('name', 'name', 'contains'),
    ]
    default_ordering_rule = 'id'

    def filter_queryset(self, request, queryset, view):
        queryset = super().filter_queryset(request, queryset, view)
        return queryset


class PortApis(viewsets.ModelViewSet):
    filter_backends = [PortFilterBackend]
    permission_classes = [permissions.IsAuthenticated]
    queryset = Port.objects.all()
    serializer_class = PortSerializer
