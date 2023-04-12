
from rest_framework import viewsets, permissions
from rest_framework.decorators import action

from utility.models import Image
from web.serializers import ImageSerializer
from wechat_app.apis import ImageApis as _ImageApis


class ImageApis(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    queryset = Image.objects.all()
    serializer_class = ImageSerializer

    @action(methods=['GET'], detail=True, url_path='data')
    def data(self, requests, *args, **kwargs):
        obj = self.get_object()
        imgfile = obj.image
        return _ImageApis.image_response(imgfile)
