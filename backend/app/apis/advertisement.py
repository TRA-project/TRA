from rest_framework import viewsets, permissions
from rest_framework.response import Response
from rest_framework.exceptions import ParseError, NotAcceptable, PermissionDenied
from rest_framework.decorators import action
from django.db.models import F

from app.models import Advertisement
from app.serializers import AdvertisementSerializer
from app.utilities import permission
from app.response import *
from utilities import conversion, filters, permission as _permission

class AdvertisementFilterBackend(filters.QueryFilterBackend):
    def filter_queryset(self, request, queryset, view):
        return super().filter_queryset(request, queryset.filter(visible=True), view)

class AdvertisementApis(viewsets.GenericViewSet, viewsets.mixins.RetrieveModelMixin,
                  viewsets.mixins.ListModelMixin):
    filter_backends = [AdvertisementFilterBackend]
    permission_classes = []
    queryset = Advertisement.objects.all()
    serializer_class = AdvertisementSerializer

    def modify(self, request, *args, **kwargs):
        obj = self.get_object()
        obj.read = F('read') + 1
        obj.save()
        return self.retrieve(request, *args, **kwargs)
