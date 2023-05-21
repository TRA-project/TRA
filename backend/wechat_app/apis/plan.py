import collections
import copy
import json
import random
import string
import time
import datetime
from math import inf

import numpy as np

from utility.models.plan_item import PlanItem
from utils.baiduAPI import *
from numpy import size
from rest_framework import status
from utility.models import Plan, Sight, Schedule, PlanSchedule
from utils import permission
from utils.response import error_response, Error
from wechat_app.serializers import ScheduleSerializer, ScheduleItemSerializer
from wechat_app.serializers.plan import PlanSerializer
from utility.models.plan import Plan
from rest_framework.viewsets import GenericViewSet
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.mixins import RetrieveModelMixin, CreateModelMixin, DestroyModelMixin

from wechat_app.serializers.plan_create_log import PlanCreateLogSerializer
from wechat_app.serializers.plan_item import PlanItemSerializer, PlanItemDetailSerializer
from wechat_app.serializers.plan_schedule import PlanScheduleSerializer
from wechat_app.serializers.sight import SightSerializer, SightPlanSerializer
from text2vec import SentenceModel

# embedder = SentenceModel()
testflag = 1


def string_to_time(a, rate=1):
    temp = int(float(a) / rate)
    if rate == 1000:
        temp = int((temp + hour(8)) / 86400) * 86400 - hour(8)
    return temp


def time_to_day(time):
    return int((time + hour(8)) / 86400)


def day(a):
    return a * 86400


def hour(a):
    return a * 3600


def minute(a):
    return 60 * a


def time_to_schedule(a):
    pass


def time_to_schedule_item():
    pass


def data_create(data, serializer_class):
    serializer = serializer_class(data=data)
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return serializer


def compute_emb(model, sentences):
    sentence_embeddings = model.encode(sentences, show_progress_bar=True)
    print(type(sentence_embeddings), sentence_embeddings.shape)
    return sentence_embeddings


def test(a, b):
    return 0
    c = (eval(b))
    d = a - c

    num = 0
    return 784 - (d * d).sum()


def position(point, list):
    # point为起始点，list为景点列表
    new_list = []
    target_point = point
    while size(new_list) < size(list):
        min_sight = list[0]
        min_distance = inf
        for i in list:
            temp_distance = (i.get('longitude') - target_point.get('longitude')) \
                            * (i.get('longitude') - target_point.get('longitude')) \
                            + (i.get('latitude') - target_point.get('latitude')) \
                            * (i.get('latitude') - target_point.get('latitude'))
            if temp_distance < min_distance and i not in new_list:
                min_distance = temp_distance
                min_sight = i
        new_list.append(min_sight)
        target_point = min_sight
    return new_list


def calculate(list, tag, start_time, end_time, type):
    hot_random = random.uniform(0.5, 1) + type[0]
    grade_random = random.uniform(0.5, 1) + type[1]
    # distance_random = random.uniform(0.5,1)
    # 我们有这样的一个假设，即对于一个综合评分很高的景点，较远的地点是可以容忍的，但是对于一个相对较差的景点，则过远的距离是不好的
    # 所以地点的评分是距离，热度，评价的三元函数
    tag_random = random.uniform(0.5, 1) + type[2]
    corpus_embedding = 0
    """
    embedder = SentenceModel()
    corpus_embedding = embedder.encode([tag])[0]
    """
    n = size(list)
    dict = {}
    seq = 0
    for i in list:
        num = test(corpus_embedding, i.get('embedding')) / 784 * 7 * tag_random \
              + i.get('hot') * hot_random \
              + i.get('grade') * grade_random
        dict[seq] = num
        seq = seq + 1
    print(start_time)
    print(end_time)
    days = int((end_time - start_time) / 86400) + 1
    print(days)
    sys = sorted(dict.items(), key=lambda d: d[1], reverse=True)[0:days * 3]
    better_sight = []
    for i, j in sys:
        dict = copy.deepcopy(list[i])
        dict.pop('embedding')
        better_sight.append(dict)
    return better_sight


def new_plan_item(plan_id, i, name, temp, time):
    data = {}
    data['plan_id'] = plan_id
    data['sight'] = i.get('id')
    data['name'] = name
    # 放入前端所需要的字段
    data['start_time'] = temp
    data['end_time'] = time
    if name == '交通':
        data['type'] = 2
    elif name == '住宿':
        data['type'] = 3
    else:
        data['type'] = 1
    serializer = PlanItemSerializer(data=data)
    serializer.is_valid(raise_exception=True)
    plan = serializer.save()
    return data


def manage(plan_id, sight_list, start_time, end_time, get_up_time, sleep_time):
    present_time = start_time + hour(get_up_time)
    print('present_time  is ', present_time)
    list = []
    last = None
    for sight_id in sight_list:
        sight = Sight.objects.get(id=int(sight_id))
        i = SightPlanSerializer(sight).data
        if last is not None:
            temp = present_time
            present_time += hour(1)
            new_item = new_plan_item(plan_id, last, '交通', temp, present_time)
            list.append(new_item)
        timeArray = time.localtime(present_time)
        if timeArray.tm_hour > sleep_time or timeArray.tm_hour + i.get('playtime') > sleep_time:
            temp = present_time
            persistent = day(1) - hour(timeArray.tm_hour)
            persistent += hour(get_up_time)
            present_time += persistent
            new_item = new_plan_item(plan_id, last, '住宿', temp, present_time)
            list.append(new_item)
        temp = present_time
        present_time += hour(string_to_time(i.get('playtime')))
        new_item = new_plan_item(plan_id, i, i.get('name'), temp, present_time)
        list.append(new_item)
        last = i
    return list


def create_schedule(plan_id, owner_id, name, list):
    base_date = None
    schedule_id = -1
    for i in list:
        if time_to_day(i.get('start_time')) != base_date:
            base_date = time_to_day(i.get('start_time'))
            # 创建一个新的schedule以及新的schedule与plan的对应关系
            data = {'owner': owner_id, 'title': name,
                    'date': time.strftime("%Y-%m-%d", time.localtime(i.get('start_time')))}
            schedule = data_create(data, ScheduleSerializer).data
            schedule_id = schedule.get('id')
            data = {'plan_id': plan_id, 'schedule_id': schedule_id}
            data_create(data, PlanScheduleSerializer)
        start_struct_time = time.localtime(i.get('start_time'))
        end_struct_time = time.localtime(i.get('end_time'))
        schedule_item = {'start_time': "{hour}:{minute}".format(hour=start_struct_time.tm_hour,
                                                                minute=start_struct_time.tm_min),
                         'end_time': "{hour}:{minute}".format(hour=end_struct_time.tm_hour,
                                                              minute=end_struct_time.tm_min), 'schedule': schedule_id,
                         'content': i.get('name')}
        if name != '交通' and name != '休息':
            data['if_alarm'] = 1
        data_create(schedule_item, ScheduleItemSerializer)
    return 0


class PlanApis(GenericViewSet, CreateModelMixin, RetrieveModelMixin, DestroyModelMixin):
    queryset = Plan.objects.all()
    serializer_class = PlanSerializer
    """
    在查询旅行计划时，传入用户和对应的序号，确定唯一的一个旅行计划，
    """

    def retrieve(self, request, *args, **kwargs):
        owner_id = permission.user_check(request)
        if owner_id <= 0:
            return error_response(Error.NOT_LOGIN, 'Please login.', status=status.HTTP_403_FORBIDDEN)

        """安全性检验
        plan = Plan.objects.get(id)
        serializer = PlanSerializer(instance=plan)
        plan_id = serializer.data.get('id')"""
        data = {}
        plan_id = kwargs.get('pk')
        plan_items = PlanItem.objects.filter(plan_id=plan_id)
        serializer = PlanItemDetailSerializer(plan_items, many=True)
        data['plan_items'] = serializer.data
        plan = Plan.objects.get(id=plan_id)
        serializer = PlanSerializer(plan)
        data['name'] = serializer.data.get('name')
        data['id'] = plan_id
        return Response(data)

    def list(self, request, *args, **kwargs):
        owner_id = permission.user_check(request)
        if owner_id <= 0:
            owner_id = 1
            return error_response(Error.NOT_LOGIN, 'Please login.', status=status.HTTP_403_FORBIDDEN)
        queryset = Plan.objects.filter(owner=owner_id)
        serializer = PlanSerializer(queryset, many=True)
        all_list = []
        for i in serializer.data:
            list = PlanItem.objects.filter(plan_id=i.get('id'))
            item_serializer = PlanItemSerializer(list, many=True)
            sights_name = []
            for j in item_serializer.data:
                if j.get('type') != 1:
                    continue
                sight_id = j.get('sight')
                sight = Sight.objects.get(id=sight_id)
                sight_serializer = SightPlanSerializer(sight)
                sights_name.append(sight_serializer.data.get('name'))
            dict = i
            dict['sights_name'] = sights_name
            all_list.append(dict)
        return Response(all_list)

    @action(methods=['GET'], detail=False, url_path='new')
    def new(self, request):
        owner_id = permission.user_check(request)
        if owner_id <= 0:
            owner_id = 1
            # return error_response(Error.NOT_LOGIN, 'Please login.', status=status.HTTP_403_FORBIDDEN)
        # 还有哪些硬性条件？
        city = request.GET.get('city', '北京市')
        tag = request.GET.get('tag', ' ')
        start_time = string_to_time(request.GET.get('start_time', time.time()), rate=1000)

        end_time = string_to_time(request.GET.get('end_time', time.time() + 86400 * 3), rate=1000)

        this_time = start_time
        while this_time <= end_time:
            print(time.strftime("%Y-%m-%d", time.localtime(this_time)))
            schedule = Schedule.objects.filter(owner_id=owner_id,
                                               date=time.strftime("%Y-%m-%d", time.localtime(this_time)))
            if schedule.exists():
                return error_response(Error.SCHEDULE_OVERLAP, 'The current schedule is already scheduled',
                                      status=status.HTTP_403_FORBIDDEN)
            this_time += day(1)

        data = {'owner': owner_id, 'create_time': int(time.time()),
                'start_time': start_time, 'end_time': end_time,
                'target_city': city, 'desc': tag}
        data_create(data, PlanCreateLogSerializer)

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
            type = [0, 0, 0]
            type[i - 1] = 1
            initial_plan = calculate(list, tag, start_time, end_time, type)
            all_list.append(initial_plan)
        return Response(all_list)

    def create(self, request, *args, **kwargs):
        start_time = string_to_time(request.POST.get('start_time'), rate=1000)
        end_time = string_to_time(request.POST.get('end_time'), rate=1000)
        sights = request.POST.get('sights')
        sights = sights.split(',')
        get_up_time = eval(request.POST.get('get_up_time', '8'))
        sleep_time = eval(request.POST.get('sleep_time', '20'))
        try:
            name = request.POST.get('name')
        except:
            name = '旅行计划'
        owner_id = permission.user_check(request)
        if owner_id <= 0:
            owner_id = 1
            # return error_response(Error.NOT_LOGIN, 'Please login.', status=status.HTTP_403_FORBIDDEN)

        data = {'owner': owner_id, 'name': name, 'start_time': start_time, 'end_time': end_time}
        plan = data_create(data, PlanSerializer).data
        plan_id = plan.get('id')
        list = manage(plan_id, sights, start_time, end_time, get_up_time, sleep_time)
        create_schedule(plan_id, owner_id, name, list)
        return Response(plan)

    def destroy(self, request, *args, **kwargs):
        owner_id = permission.user_check(request)
        if owner_id <= 0:
            owner_id = 1
            # return error_response(Error.NOT_LOGIN, 'Please login.', status=status.HTTP_403_FORBIDDEN)
        # 还是一样的处理方法，根据这个id，找到对应所有计划，所有计划，之后在删除这个plan
        plan_id = kwargs.get('pk')
        schedules = PlanSchedule.objects.filter(plan_id=plan_id)
        serializer = PlanScheduleSerializer(schedules, many=True)
        for i in serializer.data:
            try:
                schedules_id = i.get('schedule_id')
                schedule = Schedule.objects.get(id=schedules_id)
                schedule.delete()
            except Schedule.DoesNotExist:
                pass
        return super().destroy(self, request, *args, **kwargs)

    def partial_update(self, request, *args, **kwargs):
        owner_id = permission.user_check(request)
        if owner_id <= 0:
            owner_id = 1
            # return error_response(Error.NOT_LOGIN, 'Please login.', status=status.HTTP_403_FORBIDDEN)
        plan_id = kwargs.get('pk')
        plan = Plan.objects.get(id=plan_id)
        plan_serializer = PlanSerializer(plan)
        data = plan_serializer.data

        start_time = data.get('start_time')
        end_time = data.get('end_time')
        name = data.get('name')
        sights = []
        plan_item = PlanItem.objects.filter(plan_id=plan_id)
        serializer = PlanItemDetailSerializer(plan_item, many=True)
        data = serializer.data
        for i in data:
            if i.get('type') == 1:
                sight = i.get('sight')
                sights.append(str(sight.get('id')))
        get_up_time = int(request.data.get('get_up_time', '8'))
        sleep_time = int(request.data.get('sleep_time', '20'))

        schedules = PlanSchedule.objects.filter(plan_id=plan_id)
        serializer = PlanScheduleSerializer(schedules, many=True)

        for i in serializer.data:
            for i in serializer.data:
                try:
                    schedules_id = i.get('schedule_id')
                    schedule = Schedule.objects.get(id=schedules_id)
                    schedule.delete()
                except Schedule.DoesNotExist:
                    pass

        super().destroy(self, request, *args, **kwargs)
        data = {'owner': owner_id, 'name': name, 'start_time': start_time, 'end_time': end_time}
        plan = data_create(data, PlanSerializer).data
        plan_id = plan.get('id')
        list = manage(plan_id, sights, start_time, end_time, get_up_time, sleep_time)
        create_schedule(plan_id, owner_id, name, list)
        return Response(plan)
