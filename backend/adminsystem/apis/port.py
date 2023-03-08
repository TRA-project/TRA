from datetime import datetime, timedelta

from django.db.models import Q
from rest_framework.decorators import action
from django.http import QueryDict

from app.models import Message, AppUser, Flight, UsersFlight, City, Province, Port
from adminsystem.serializers import PortSerializer
from app.utilities import permission
from app.response import *
from utilities import conversion, filters, permission as _permission
from django.conf import settings
from rest_framework.exceptions import ParseError, NotAcceptable, PermissionDenied, NotFound
from rest_framework import viewsets, permissions

from utilities.conversion import get_list

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