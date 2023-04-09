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
from .subsight import SubsightSerializer


class SightDetailedSerializer(serializers.ModelSerializer):
    address = AddressSerializer(required=False, allow_null=True)
    price_list = PriceSerializer(read_only=True, many=True)
    subsight_list = SubsightSerializer(read_only=True, many=True)

    class Meta:
        model = Sight
        extra_kwargs = {
            'price_list': {'min_value': 0, 'required': True},
            'subsight_list': {'min_value': 0, 'required': True}
        }


class SightSerializer(serializers.ModelSerializer):
    address = AddressSerializer(required=False, allow_null=True)

    class Meta:
        model = Sight
        exclude = ['open_time', 'close_time', 'play_time']


class SightBriefSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sight
        fields = ['id', 'name', 'hot', 'grade']
