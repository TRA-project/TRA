from rest_framework import viewsets, permissions
from rest_framework.response import Response
from rest_framework.exceptions import ParseError, NotAcceptable, PermissionDenied
from rest_framework.decorators import action
from django.http import QueryDict

from django.conf import settings
from app.models import Advertisement, Image
from adminsystem.serializers import AdvertisementSerializer
from app.response import *
from utilities import conversion, filters, permission as _permission
from django.core.files.uploadedfile import UploadedFile

class AdvertisementApis(viewsets.ModelViewSet):
    filter_backends = []
    permission_classes = [permissions.IsAuthenticated]
    queryset = Advertisement.objects.all()
    serializer_class = AdvertisementSerializer

    def create(self, request, *args, **kwargs):
        data = request.data
        if isinstance(data, QueryDict):
            data = data.dict()

        cover = data.get('cover', None)
        if isinstance(cover, UploadedFile):
            data['cover'] = Image.objects.create(image=cover).id

        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    @action(methods=['POST'], detail=False, url_path='visible')
    def visible(self, request, *args, **kwargs):
        ids = conversion.get_list(request.data, 'id')
        visible = not conversion.get_bool(request.data, 'cancel')

        objs = self.get_queryset().filter(id__in=ids)
        query = {
            'visible': visible,
        }
        objs.update(**query)
        return Response(self.get_serializer(objs, many=True).data)
