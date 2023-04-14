import json

from rest_framework import viewsets, status
from rest_framework.response import Response

from utility.models import Hotel
from wechat_app.serializers import HotelSerializer
from django.db.models import Q
from rest_framework.decorators import action

from utils import baiduAPI


class HotelApis(viewsets.ModelViewSet):
    queryset = Hotel.objects.all()
    serializer_class = HotelSerializer

    @action(methods=['GET'], detail=False, url_path='search')
    def search(self, request):
        query = request.GET.get("query")
        qs = Hotel.objects.all()
        if query:
            qs = qs.filter(Q(name__icontains=query) | Q(description__icontains=query))
            serializer = HotelSerializer(instance=qs, many=True)
        return Response(serializer.data)

    @action(methods=['GET'], detail=False, url_path='nearbyHotels')
    def search_nearby_hotels(self, request):
        return Response(data=baiduAPI.search_hotels(**request.GET.dict()))
