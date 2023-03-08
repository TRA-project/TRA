
from rest_framework import viewsets, permissions
from rest_framework.response import Response
from rest_framework.exceptions import ParseError, NotAcceptable, PermissionDenied
from rest_framework.decorators import action
from django.http.response import HttpResponse

from app.models import Image
from adminsystem.serializers import ImageSerializer
from app.apis import ImageApis as _ImageApis
from app.utilities import permission
import os

class ImageApis(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    queryset = Image.objects.all()
    serializer_class = ImageSerializer

    @action(methods=['GET'], detail=True, url_path='data')
    def data(self, requests, *args, **kwargs):
        obj = self.get_object()
        imgfile = obj.image
        return _ImageApis.image_response(imgfile)
