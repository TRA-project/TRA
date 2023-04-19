import collections
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
        #num = hot_random * i.get('hot') + tag_random * (i.get('tag') == tag) + distance_random
        num = hot_random * i.get('hot')
        dict[seq] = num
        seq = seq + 1

    sys = sorted(dict.items(), key=lambda d: d[1], reverse=False)[0:10]
    better_sight = []
    for i,j in sys:
        print(i)
        better_sight.append(list[i])
    """
    计算每个list的值，之后排序，选择合适的
    """
    #再对better进行乱序处理或者结合时间安排处理
    return random.shuffle(better_sight)


class PlanApis(GenericViewSet, CreateModelMixin):
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

    def list(self, request, *args, **kwargs):
        owner_id = permission.user_check(request)
        if owner_id <= 0:
            owner_id = 1
            # return error_response(Error.NOT_LOGIN, 'Please login.', status=status.HTTP_403_FORBIDDEN)
        queryset = Plan.objects.filter(owner=owner_id)
        serializer = self.get_serializer(queryset, many=True)
        return Response({"results": serializer.data})

    """
    生成一个旅行计划，先暂时采取最简单的逻辑
    传入一个地点，按照评分对该地点的景点进行排序，之后选择前面合适数量的景点传回
    """

    @action(methods=['GET'], detail=False, url_path='new')
    def new(self, request):

        """
        可以尝试先去查询地点对应的ID，再反向查询景点
        """
        # 还有哪些硬性条件？
        city = request.GET.get('city')
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
        owner_id = permission.user_check(request)
        if owner_id <= 0:
            owner_id = 1
        # return error_response(Error.NOT_LOGIN, 'Please login.', status=status.HTTP_403_FORBIDDEN)
        # 获取目前最大的order，并在此基础上+1
        queryset = Plan.objects.filter(owner=owner_id).order_by('-order')
        serializer = PlanSerializer(queryset, many=True)
        order = 0
        for i in serializer.data:
            order = i.get('order')
            break
        print(order)
        order = order + 1
        all_data = request.POST.get('sight')
        data = {'owner': owner_id, 'order': order}
        for i in all_data:
            data['sight'] = i
            serializer = PlanSerializer(data=data)
            serializer.is_valid(raise_exception=True)
            serializer.save()
        return error_response(Error.SUCCESS, status=status.HTTP_201_CREATED)
        # return error_response(Error.PARSE_ERROR, 'WRONG DATA.', status=status.HTTP_403_FORBIDDEN)
