from rest_framework import viewsets
from django.db.models import F

from user.models import Advertisement
from user.serializers import AdvertisementSerializer
from utils import filters


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
