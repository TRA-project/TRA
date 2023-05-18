# -*- coding: utf-8 -*-
# @Time    : 2023/4/2 下午9:04
# @Author  : Su Yang
# @File    : sight.py
# @Software: PyCharm 
# @Comment :
import json

from rest_framework.viewsets import ModelViewSet
from rest_framework.decorators import action
from rest_framework.response import Response

from utility.models.sight import Sight
from utility.models.inner_sight import InnerSight
from utility.models.feedback import Feedback
from ..serializers.sight import SightSerializer, SightDetailedSerializer
from ..serializers.feedback import FeedbackSerializer
from rest_framework import permissions
from rest_framework.pagination import PageNumberPagination


class SightPagination(PageNumberPagination):
    page_size = 10  # 每页显示的结果数量
    page_size_query_param = 'page_size'  # 可以通过 URL 参数指定每页结果的数量
    max_page_size = 100  # 每页结果的最大数量


class SightApis(ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    queryset = Sight.objects.all()
    serializer_class = SightDetailedSerializer
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

    @action(detail=False, methods=['GET'], url_path='audit')
    def retrieve_feedbacks(self, request, *args, **kwargs):
        feedbacks = Feedback.objects.filter(status=0) # Draft
        paginator = self.pagination_class()
        paginated_sights = paginator.paginate_queryset(feedbacks, request)
        serializer = FeedbackSerializer(paginated_sights, many=True)
        return paginator.get_paginated_response(serializer.data)

    @action(detail=False, methods=['POST'], url_path='audit/approve')
    def audit_approve(self, request):
        audit_id = request.POST.get('audit_id')
        feedback = Feedback.objects.filter(id=audit_id).first()
        feedback.status = 1  # approve
        feedback.save()

        # write the database to renew data
        request = json.loads(feedback.content)
        # print(request)
        sight_id = request.get('sight_id')

        desc = request.get('desc')
        open_time = request.get('open_time')
        # print(desc, open_time)

        if sight_id is None:
            sight = Sight(desc=desc, open_time=open_time)
            sight.save()
        else:
            sight = Sight.objects.get(id=sight_id)
            sight.desc = desc
            sight.open_time = open_time
            sight.save()

        for data in request.get('inner_sights'):
            inner_sight = InnerSight(name=data.get('name'),
                                     desc=data.get('desc'),
                                     sight=sight)
            inner_sight.save()

        return Response(SightDetailedSerializer(sight).data)

    @action(detail=False, methods=['POST'], url_path='audit/reject')
    def audit_reject(self, request):
        audit_id = request.data.get('audit_id')
        # print(audit_id)
        feedback = Feedback.objects.filter(id=audit_id).first()
        feedback.status = 2  # reject
        feedback.save()
        
        return Response(FeedbackSerializer(feedback).data)
