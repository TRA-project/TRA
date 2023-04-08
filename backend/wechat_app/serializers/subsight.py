# -*- coding: utf-8 -*-
# @Time    : 2023/4/4 上午11:35
# @Author  : Su Yang
# @File    : subsight.py
# @Software: PyCharm 
# @Comment :
from rest_framework import serializers

from utility.models import Subsight
from .price import PriceSerializer
from .position import PositionSerializer


class SubsightSerializer(serializers.ModelSerializer):
    prices = PriceSerializer(read_only=True, many=True)
    position = PositionSerializer(read_only=True)

    class Meta:
        model = Subsight
        fields = '__all__'
        extra_kwargs = {
            'prices': {'min_value': 0, 'required': True}
        }
