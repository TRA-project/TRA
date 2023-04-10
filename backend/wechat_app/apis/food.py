from rest_framework import viewsets, status
from rest_framework.response import Response

from utility.models import Food, Image
from wechat_app.serializers import FoodSerializer
from django.db.models import Q
from rest_framework.decorators import action

from rest_framework.parsers import MultiPartParser, JSONParser, FormParser

class FoodApis(viewsets.ModelViewSet):
    queryset = Food.objects.all()
    serializer_class = FoodSerializer
    parser_classes = [MultiPartParser, JSONParser, FormParser]
    
    @action(methods=['POST'], detail=False, url_path='test')
    def test(self, request, *args, **kwargs):
        print(request.data)
        response = super().create(request, *args, **kwargs)
        return response
    
    @action(methods=['DELETE'], detail=False, url_path='deleteAll')
    def deleteAll(self, request, *args, **kwargs):
        deleted, _ = Food.objects.all().delete()
        return Response({'message': f'{deleted} Food instances deleted.'}, status=status.HTTP_200_OK)


    def image_upload(self, request, *args, **kwargs):
        obj = self.get_object()
        imgfile = request.data.get('image', None)
        desc = request.data.get('description', '')
        image = Image.objects.create(image=imgfile, description=desc)
        obj.images.add(image)
        return Response({'id': image.id})
    