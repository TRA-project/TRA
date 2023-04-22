import collections
import json
import random

from numpy import size
from rest_framework import status
from utility.models import Plan, Sight
from utils import permission
from utils.response import error_response, Error
from wechat_app.serializers.plan import PlanSerializer
from rest_framework.viewsets import GenericViewSet
from rest_framework.response import Response
from utility.models.plan import Plan
from rest_framework.viewsets import GenericViewSet
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.mixins import RetrieveModelMixin, CreateModelMixin

from wechat_app.serializers.sight import SightSerializer


def calculate(list, tag):
    hot_random = random.random()
    distance_random = random.random()
    tag_random = random.random()
    # list为传入的符合硬性条件的数据
    # 在合适的区间随机生成参数
    # 考虑评分，距离，标签三个条件
    n = size(list)
    print(n)
    dict = {}
    seq = 0
    for i in list:
        # num = hot_random * i.get('hot') + tag_random * (i.get('tag') == tag) + distance_random
        num = hot_random * i.get('hot')
        dict[seq] = num
        seq = seq + 1

    sys = sorted(dict.items(), key=lambda d: d[1], reverse=False)[0:10]
    better_sight = []
    for i, j in sys:
        print(i)
        better_sight.append(list[i])
    """
    计算每个list的值，之后排序，选择合适的
    """
    # 再对better进行乱序处理或者结合时间安排处理
    # return random.shuffle(better_sight)
    return better_sight


class PlanApis(GenericViewSet, CreateModelMixin,RetrieveModelMixin):
    flag = 0
    queryset = Plan.objects.all()
    serializer_class = PlanSerializer

    def get_serializer_class(self):
        if self.flag == 0:
            return PlanSerializer
        else:
            return SightSerializer

    def get_queryset(self):
        keyword = self.request.query_params.get('location')
        if self.flag == 0:
            return Plan.objects.all()
        elif keyword:
            return Sight.objects.filter()
        else:
            return Sight.objects.all()

    """
    在查询旅行计划时，传入用户和对应的序号，确定唯一的一个旅行计划，
    """
    def retrieve(self, request, *args, **kwargs):
        owner_id = permission.user_check(request)
        if owner_id <= 0:
            owner_id = 1
            # return error_response(Error.NOT_LOGIN, 'Please login.', status=status.HTTP_403_FORBIDDEN)
        #缺少了安全性检验
        return super().retrieve(request, *args, **kwargs)

    def list(self, request, *args, **kwargs):
        owner_id = permission.user_check(request)
        if owner_id <= 0:
            owner_id = 1
            # return error_response(Error.NOT_LOGIN, 'Please login.', status=status.HTTP_403_FORBIDDEN)
        queryset = Plan.objects.filter(owner=owner_id)
        serializer = PlanSerializer(queryset, many=True)
        return Response(serializer.data)


    @action(methods=['GET'], detail=False, url_path='new')
    def new(self, request):

        """
        可以尝试先去查询地点对应的ID，再反向查询景点
        """
        # 还有哪些硬性条件？
        city = request.GET.get('city','北京市')
        tag = request.GET.get('tag')
        print(city)
        queryset = Sight.objects.order_by('hot')
        serializer = SightSerializer(queryset, many=True)
        all_list = []
        list = []
        # 硬性筛选
        for i in serializer.data:
            if i.get('address').get('city') == city:
                list.append(i)
        # 软筛选
        for i in range(3):
            all_list.append(calculate(list, tag))
        return Response(all_list)

    def create(self, request, *args, **kwargs):
        sights = request.POST.get('sights')
        name = request.POST.get('name')
        owner_id = permission.user_check(request)
        if owner_id <= 0:
            owner_id = 1
        data = {}
        data['owner'] = owner_id
        data['name'] = name
        serializer = PlanSerializer(data=data)
        serializer.is_valid(raise_exception=True)
        plan = serializer.save()
        print(type(plan))
        test = sights.replace('[', '').replace(']','').split(',')
        print(test)
        for i in test:
            data = Sight.objects.get(id=eval(i))
            print(type(data))
            plan.sights.add(data)
        return error_response(Error.SUCCESS, status=status.HTTP_201_CREATED)
