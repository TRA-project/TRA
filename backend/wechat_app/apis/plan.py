import collections
import json
import random
import time

from utility.models.plan_item import PlanItem
from utils.baiduAPI import *
from numpy import size
from rest_framework import status
from utility.models import Plan, Sight
from utils import permission
from wechat_app.serializers.plan import PlanSerializer
from utility.models.plan import Plan
from rest_framework.viewsets import GenericViewSet
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.mixins import RetrieveModelMixin, CreateModelMixin, DestroyModelMixin

from wechat_app.serializers.plan_item import PlanItemSerializer
from wechat_app.serializers.sight import SightSerializer, SightPlanSerializer


def calculate(list, tag):
    hot_random = random.random()
    grade_random = random.random()
    distance_random = random.random()
    # tag_random = random.random()
    n = size(list)
    dict = {}
    seq = 0
    for i in list:
        # num = hot_random * i.get('hot') + tag_random * (i.get('tag') == tag) + distance_random
        print(i.get('hot'), i.get('grade'))
        num = hot_random * i.get('hot') / 200 + grade_random * i.get('grade') / 5 + random.random() / 2
        dict[seq] = num
        seq = seq + 1
    sys = sorted(dict.items(), key=lambda d: d[1], reverse=True)[0:5]
    print(sys)
    better_sight = []

    for i, j in sys:
        better_sight.append(list[i])
    """
    计算每个list的值，之后排序，选择合适的
    """
    # 再对better进行乱序处理或者结合时间安排处理
    # return random.shuffle(better_sight)
    return better_sight
    random.shuffle(better_sight)
    return better_sight


class PlanApis(GenericViewSet, CreateModelMixin, RetrieveModelMixin, DestroyModelMixin):
    queryset = Plan.objects.all()
    serializer_class = PlanSerializer
    # lookup_field = "id"

    """
    在查询旅行计划时，传入用户和对应的序号，确定唯一的一个旅行计划，
    """

    def retrieve(self, request, *args, **kwargs):
        owner_id = permission.user_check(request)
        if owner_id <= 0:
            owner_id = 1
            # return error_response(Error.NOT_LOGIN, 'Please login.', status=status.HTTP_403_FORBIDDEN)

        """安全性检验
        plan = Plan.objects.get(id)
        serializer = PlanSerializer(instance=plan)
        plan_id = serializer.data.get('id')"""

        plan_items = PlanItem.objects.filter(plan_id=kwargs.get('pk'))
        serializer = PlanItemSerializer(plan_items, many=True)
        return Response(serializer.data)

    def list(self, request, *args, **kwargs):
        owner_id = permission.user_check(request)
        if owner_id <= 0:
            owner_id = 1
            # return error_response(Error.NOT_LOGIN, 'Please login.', status=status.HTTP_403_FORBIDDEN)
        queryset = Plan.objects.filter(owner=owner_id)
        serializer = PlanSerializer(queryset, many=True)
        all_list = []
        for i in serializer.data:
            list = i.get('sights')
            sights_name = []
            for j in list:
                sight = Sight.objects.get(id=j)
                sight_serializer = SightSerializer(instance=sight)
                name = sight_serializer.data.get('name')
                sights_name.append(name)
            dict = i
            dict['sights_name'] = sights_name
            all_list.append(dict)
        return Response(all_list)

    @action(methods=['GET'], detail=False, url_path='new')
    def new(self, request):

        """
        可以尝试先去查询地点对应的ID，再反向查询景点
        """
        # 还有哪些硬性条件？
        city = request.GET.get('city', '北京市')
        tag = request.GET.get('tag')

        queryset = Sight.objects.all()
        serializer = SightPlanSerializer(queryset, many=True)
        all_list = []
        list = []
        # 硬性筛选
        for i in serializer.data:
            name = i.get('address').get('name')
            if city in name:
                list.append(i)
        # 软筛选
        for i in range(3):
            all_list.append(calculate(list, tag))
        return Response(all_list)

    def create(self, request, *args, **kwargs):
        sights = request.POST.get('sights')
        try:
            name = request.POST.get('name')
        except:
            name = '旅行计划'
        owner_id = permission.user_check(request)
        if owner_id <= 0:
            owner_id = 1
            # return error_response(Error.NOT_LOGIN, 'Please login.', status=status.HTTP_403_FORBIDDEN)
        data = {'owner': owner_id, 'name': name}
        serializer = PlanSerializer(data=data)
        serializer.is_valid(raise_exception=True)
        plan = serializer.save()
        test = sights.replace('[', '').replace(']', '').split(',')
        plan_id = serializer.data.get('id')
        for i in test:
            plan_item = {}
            plan_item['plan_id'] = plan_id
            plan_item['sight_id'] = eval(i)
            plan_item['type']
            serializer = PlanItemSerializer(data=plan_item)
            serializer.is_valid(raise_exception=True)
            serializer.save()
        return Response(PlanSerializer(plan).data)

    def destroy(self, request, *args, **kwargs):
        owner_id = permission.user_check(request)
        if owner_id <= 0:
            owner_id = 1
            # return error_response(Error.NOT_LOGIN, 'Please login.', status=status.HTTP_403_FORBIDDEN)
        return super().destroy(self, request, *args, **kwargs)
