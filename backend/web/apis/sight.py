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
from rest_framework import permissions
from rest_framework.pagination import PageNumberPagination


class SightPagination(PageNumberPagination):
    page_size = 10  # 每页显示的结果数量
    page_size_query_param = 'page_size'  # 可以通过 URL 参数指定每页结果的数量
    max_page_size = 100  # 每页结果的最大数量


class SightApis(ModelViewSet):
    # permission_classes = [permissions.IsAuthenticated]
    queryset = Sight.objects.all()
    serializer_class = SightSerializer
    pagination_class = SightPagination

    @action(detail=False, methods=['GET'])
    def search(self, request):
        keyword = request.GET.get('keyword')
        id = request.GET.get('id')

        sights = self.get_queryset()

        if id:
            sights = sights.filter(id=id)

        elif keyword:
            sights = sights.filter(name__icontains=keyword)

        paginator = self.pagination_class()
        paginated_sights = paginator.paginate_queryset(sights, request)
        serializer = self.get_serializer(paginated_sights, many=True)
        return paginator.get_paginated_response(serializer.data)


