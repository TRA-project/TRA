# -*- coding: utf-8 -*-
# @Time    : 2023/4/2 下午7:49
# @Author  : Su Yang
# @File    : sight.py
# @Software: PyCharm 
# @Comment :
from rest_framework import serializers

from utility.models.sight import Sight
from .address import AddressSerializer
from .price import PriceSerializer


class SightDetailedSerializer(serializers.ModelSerializer):
    address = AddressSerializer(required=False, allow_null=True)
    prices = PriceSerializer(read_only=True, many=True)

    class Meta:
        model = Sight
        extra_kwargs = {
            'prices': {'min_value': 0, 'required': True}
        }


class SightSerializer(serializers.ModelSerializer):
    address = AddressSerializer(required=False, allow_null=True)

    class Meta:
        model = Sight
        exclude = ['open_time', 'close_time', 'play_time']


class SightBriefSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sight
        fields = ['name', 'hot', 'grade']
