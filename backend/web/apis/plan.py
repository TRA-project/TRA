# -*- coding: utf-8 -*-
# @Time    : 2023/4/2 下午9:04
# @Author  : Su Yang
# @File    : sight.py
# @Software: PyCharm
# @Comment :
from django.core.paginator import Paginator
from rest_framework import permissions
from rest_framework.viewsets import ModelViewSet
from rest_framework.response import Response
from utility.models import Plan, PlanCreateLog
from utility.models.plan_item import PlanItem
from utility.models.sight import Sight
from ..serializers.plan import PlanSerializer
from ..serializers.plan_item import PlanItemDetailSerializer
from ..serializers.sight import SightSerializer
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
from utility.models import Plan, Sight
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
from wechat_app.serializers.sight import SightSerializer, SightPlanSerializer
from text2vec import Word2Vec, SentenceModel


class PlanApis(ModelViewSet):
    flag = 0
    queryset = Plan.objects.all()
    Paginator.per_page = 10
    def get_serializer_class(self, *args, **kwargs):
        if self.flag == 0:
            return PlanSerializer
        else:
            return PlanCreateLogSerializer

    def get_queryset(self):
        if self.flag == 0:
            return Plan.objects.all()
        else:
            return PlanCreateLog.objects.all()

    # permission_classes = [permissions.IsAuthenticated]

    def retrieve(self, request, *args, **kwargs):
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

    @action(methods=['GET'], detail=False, url_path='logs')
    def logs(self, request):
        self.flag = 1
        return super().list(self, request)
