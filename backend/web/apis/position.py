from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from django.db.models import Q

from utility.models import Position, Image
from web.serializers import PositionSerializer
from utils.response import *
from django.conf import settings
from utils import conversion, filters
from django.core.files.uploadedfile import UploadedFile


class PositionFilterBackend(filters.QueryFilterBackend):
    filter_fields = [
        ('id', 'id', 'exact'),
        ('name', 'name', 'contains'),
        ('description', 'description', 'contains'),
    ]

    def filter_queryset(self, request, queryset, view):
        query_content = request.query_params.get('content', None)
        if query_content:
            queryset = queryset.filter(Q(name__contains=query_content) | \
                                       Q(description__contains=query_content))
        queryset = super().filter_queryset(request, queryset, view)
        return queryset


class PositionApis(viewsets.ModelViewSet):
    filter_backends = [PositionFilterBackend]
    permission_classes = [permissions.IsAuthenticated]
    queryset = Position.objects.all().order_by('id')
    serializer_class = PositionSerializer

    def bulk_destroy(self, request, *args, **kwargs):
        ids = conversion.get_list(request.data, 'id')
        objs = self.get_queryset().filter(id__in=ids)
        objs.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(methods=['POST'], detail=False, url_path='reset')
    def reset(self, request, *args, **kwargs):
        Position.objects.all().delete()
        df = settings.ADCODE_DF
        objs = []
        for _, (adcode, name, longitude, latitude, *__) in df.iterrows():
            objs.append(Position(id=adcode, name=name, longitude=longitude, latitude=latitude))
        Position.objects.bulk_create(objs)
        return response()

    @action(methods=['POST', 'DELETE'], detail=True, url_path='image')
    def image(self, request, *args, **kwargs):
        if request.method == 'DELETE':
            return self.image_delete(request, *args, **kwargs)
        return self.image_upload(request, *args, **kwargs)

    def image_upload(self, request, *args, **kwargs):
        obj = self.get_object()
        imgfile = request.data.get('image', None)
        if imgfile is None or not isinstance(imgfile, UploadedFile):
            return error_response(status.HTTP_400_BAD_REQUEST, 'Invalid image.', status=status.HTTP_400_BAD_REQUEST)
        desc = request.data.get('description', '')
        image = Image.objects.create(image=imgfile, description=desc)
        obj.images.add(image)
        return response({'id': image.id})

    def image_delete(self, request, *args, **kwargs):
        obj = self.get_object()
        imgid = conversion.get_list(request.data, 'id')
        images = obj.images.filter(id__in=imgid)
        images.delete()
        for image in images:
            image.delete()
        return response()

    @action(methods=['POST', 'DELETE'], detail=True, url_path='cover')
    def cover(self, request, *args, **kwargs):
        if request.method == 'DELETE':
            return self.cover_delete(request, *args, **kwargs)
        return self.cover_upload(request, *args, **kwargs)

    def cover_upload(self, request, *args, **kwargs):
        obj = self.get_object()
        imgfile = request.data.get('image', None)
        if imgfile is None or not isinstance(imgfile, UploadedFile):
            return error_response(status.HTTP_400_BAD_REQUEST, 'Invalid image.', status=status.HTTP_400_BAD_REQUEST)
        desc = request.data.get('description', '')
        image = Image.objects.create(image=imgfile, description=desc)
        if obj.cover is not None:
            obj.cover.delete()
        obj.cover = image
        obj.save()
        return response({'id': image.id})

    def cover_delete(self, request, *args, **kwargs):
        obj = self.get_object()
        if obj.cover is not None:
            obj.cover.delete()
        obj.cover = None
        obj.save()
        return response()
