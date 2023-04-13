from rest_framework import viewsets, status
from rest_framework.response import Response

from utility.models import Food, Image
from wechat_app.serializers import FoodSerializer
from django.db.models import Q
from rest_framework.decorators import action

from rest_framework.parsers import MultiPartParser, JSONParser, FormParser
from utils import conversion

class FoodApis(viewsets.ModelViewSet):
    queryset = Food.objects.all()
    serializer_class = FoodSerializer
    parser_classes = [MultiPartParser, JSONParser, FormParser]
    
        
    @action(methods=['POST', 'DELETE'], detail=True, url_path='image')
    def image(self, request, *args, **kwargs):
        if request.method == 'DELETE':
            return self.image_delete(request, *args, **kwargs)
        return self.image_upload(request, *args, **kwargs)

    def image_upload(self, request, *args, **kwargs):
        obj = self.get_object()
        imgfile = request.data.get('image', None)
        desc = request.data.get('description', '')
        image = Image.objects.create(image=imgfile, description=desc)
        obj.images.add(image)
        return Response({'id': str(image.image)})
    
    def image_delete(self, request, *args, **kwargs):
        obj = self.get_object()
        imgid = conversion.get_list(request.data, 'id')
        print(imgid)
        print(obj.images)
        print(obj.name)
        images = obj.images.filter(id=imgid)
        print(images)
        images.delete()
        return Response()
    
    @action(methods=['DELETE'], detail=False, url_path='deleteAll')
    def deleteAll(self, request, *args, **kwargs):
        deleted, _ = Food.objects.all().delete()
        return Response({'message': f'{deleted} Food instances deleted.'}, status=status.HTTP_200_OK)


    