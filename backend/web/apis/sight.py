# -*- coding: utf-8 -*-
# @Time    : 2023/4/2 下午9:04
# @Author  : Su Yang
# @File    : sight.py
# @Software: PyCharm 
# @Comment :
from rest_framework.viewsets import ModelViewSet
from rest_framework.decorators import action

from utility.models.sight import Sight
from ..serializers.sight import SightSerializer


class SightApis(ModelViewSet):
    queryset = Sight.objects.all()
    serializer_class = SightSerializer

    @action(detail=False, methods=['post'], url_path='add_image')
    def add_image(self, request, *args, **kwargs):
        pass
