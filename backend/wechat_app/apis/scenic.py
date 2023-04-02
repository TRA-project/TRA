from utils.response import *
from rest_framework import viewsets
from utility.models import Scenic, Sight
from wechat_app.serializers import ScenicSerializer, SightSerializer
from rest_framework.decorators import action
from rest_framework import status


class ScenicApis(viewsets.ModelViewSet):
    queryset = Scenic.objects.all()
    serializer_class = ScenicSerializer
    lookup_field = 'id'
    
    @action( methods=['get'], detail=False, url_path='getRoutes')
    def related_sights(self, request, *args, **kwargs):
        sights = Sight.objects.filter(sight = request.query_params.get('sight'))
        # sights =  Sight.objects.all()
        serializer = SightSerializer(sights, many=True)
        order = 1
        for i in serializer.data:
            i['order'] = '第' + str(order) + '站'
            order += 1
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class SightApis(viewsets.ModelViewSet):
    queryset = Sight.objects.all()
    serializer_class = SightSerializer