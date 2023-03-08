from rest_framework import viewsets, permissions
from rest_framework.response import Response
from rest_framework.exceptions import ParseError, NotAcceptable, PermissionDenied
from rest_framework.decorators import action
from django.http.response import HttpResponse
from django.dispatch.dispatcher import receiver
from django.db.models.signals import pre_delete

from app.models import Image
from app.serializers import ImageSerializer
from app.utilities import permission
import os

class ImageApis(viewsets.GenericViewSet, viewsets.mixins.CreateModelMixin,
                viewsets.mixins.RetrieveModelMixin):
    IMAGE_CONTENT_TYPE = {
        'tif': 'image/tiff',
        'tiff': 'image/tiff',
        'jfif': 'image/jpeg',
        'jpg': 'image/jpeg',
        'jpe': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'gif': 'image/gif',
        'png': 'image/png',
        None: 'image/png',
    }

    permission_classes = []
    queryset = Image.objects.all()
    serializer_class = ImageSerializer

    @action(methods=['GET'], detail=True, url_path='data')
    def data(self, requests, *args, **kwargs):
        obj = self.get_object()
        imgfile = obj.image
        return self.image_response(imgfile)

    @classmethod
    def image_response(cls, imgfile):
        fname = os.path.basename(imgfile.name)
        exti = fname.rfind(os.path.extsep)
        if exti >= 0:
            ext = fname[exti + 1:]
        else:
            ext = None
        ctype = cls.IMAGE_CONTENT_TYPE.get(ext, cls.IMAGE_CONTENT_TYPE[None])
        data = imgfile.read()
        return HttpResponse(data, content_type=ctype)

@receiver(pre_delete, sender=Image)
def image_delete(sender, instance:Image, **kwargs):
    instance.image.delete(False)
