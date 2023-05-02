import collections
import json
import random
import time
import datetime

import numpy as np
import torch

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

from wechat_app.serializers.plan_item import PlanItemSerializer, PlanItemDetailSerializer
from wechat_app.serializers.sight import SightSerializer, SightPlanSerializer
from text2vec import Word2Vec, cos_sim, semantic_search, SentenceModel


def compute_emb(model, sentences):
    sentence_embeddings = model.encode(sentences, show_progress_bar=True)
    print(type(sentence_embeddings), sentence_embeddings.shape)
    return sentence_embeddings


def test(a, b):
    c = (eval(b))
    d = a - c
    num = 0
    for i in d:
        num += i * i
    return 784 - num


def calculate(list, tag, start_time, end_time, type):
    hot_random = random.uniform(0.5,1) + type[0]
    grade_random = random.uniform(0.5,1) + type[1]
    # distance_random = random.uniform(0.5,1)
    tag_random = random.uniform(0.5,1) + type[2]
    print(hot_random,grade_random,tag_random)
    embedder = SentenceModel()
    corpus_embedding = embedder.encode([tag])[0]
    n = size(list)
    dict = {}
    seq = 0
    for i in list:
        num = test(corpus_embedding, i.get('embedding')) / 784 * 7 * tag_random \
              + i.get('hot') * hot_random \
              + i.get('grade') * grade_random
        dict[seq] = num
        seq = seq + 1
    sys = sorted(dict.items(), key=lambda d: d[1], reverse=True)[0:8]
    better_sight = []
    for i, j in sys:
        better_sight.append(list[i])
    return better_sight


def new_plan_item(param, time, persistent):
    dict = {}
    dict['name'] = '交通'
    # 放入前端所需要的字段
    dict['start_time'] = time
    time = time + persistent
    dict['end_time'] = time
    return dict


def manage(initial_plan, start_time, end_time):
    time = start_time + datetime.timedelta(hours=8)
    list = []
    last = None
    for i in initial_plan:
        if last is not None:
            list.append(new_plan_item('交通', time, datetime.timedelta(hours=1)))
        if time.hour > 20 or time.hour + i.get('playtime') > 20:
            persistent = datetime.timedelta(days=1) - datetime.timedelta(hours=time.hour)
            persistent += datetime.timedelta(hours=8)
            list.append(new_plan_item('休息', time, persistent))
        list.append(new_plan_item(i.get('name'), time, datetime.timedelta(hours=i.get('playtime'))))
        last = i
    return list


class PlanApis(GenericViewSet, CreateModelMixin, RetrieveModelMixin, DestroyModelMixin):
    queryset = Plan.objects.all()
    serializer_class = PlanSerializer
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
        serializer = PlanItemDetailSerializer(plan_items, many=True)
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
            list = PlanItem.objects.filter(plan_id=i.get('id'))
            item_serializer = PlanItemSerializer(list, many=True)
            sights_name = []
            for j in item_serializer.data:
                sight_id = j.get('sight_id')
                sight = Sight.objects.get(id=sight_id)
                sight_serializer = SightPlanSerializer(sight)
                sights_name.append(sight_serializer.data.get('name'))
            dict = i
            dict['sights_name'] = sights_name
            all_list.append(dict)
        return Response(all_list)

    @action(methods=['GET'], detail=False, url_path='new')
    def new(self, request):
        # 还有哪些硬性条件？
        city = request.GET.get('city', '北京市')
        tag = request.GET.get('tag', ' ')
        start_time_str = request.GET.get('start_time', '23.4.29')
        start_time = datetime.datetime.strptime(start_time_str, '%y.%m.%d')
        end_time_str = request.GET.get('end_time', '23.5.1')
        end_time = datetime.datetime.strptime(end_time_str, '%y.%m.%d')
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
            print(type)
            initial_plan = calculate(list, tag, start_time, end_time, type)
            all_list.append(initial_plan)
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
