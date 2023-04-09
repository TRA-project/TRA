# -*- coding: utf-8 -*-
# @Time    : 2023/4/2 下午9:04
# @Author  : Su Yang
# @File    : sight.py
# @Software: PyCharm 
# @Comment :
from rest_framework.viewsets import GenericViewSet
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.mixins import RetrieveModelMixin

from utility.models.sight import Sight
from ..serializers.sight import SightSerializer, SightBriefSerializer, SightDetailedSerializer


class SightApis(GenericViewSet, RetrieveModelMixin):
    queryset = Sight.objects.all()
    serializer_class = SightDetailedSerializer

    @action(methods=['GET'], detail=False, url_path='brief_search')
    def brief_search(self, request):
        sight_queryset = Sight.objects.filter(name__contains=request.GET.get('keyword'))
        serializer = SightBriefSerializer(instance=sight_queryset, many=True)
        return Response(serializer.data)

    @action(methods=['GET'], detail=False, url_path='search')
    def search(self, request):
        sight_queryset = Sight.objects.filter(name__contains=request.GET.get('kw'))
        serializer = SightSerializer(instance=sight_queryset, many=True)
        return Response(serializer.data)
