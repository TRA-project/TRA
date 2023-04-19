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
    price_set = PriceSerializer(read_only=True, many=True)
    subsight_set = SubsightSerializer(read_only=True, many=True)

    class Meta:
        model = Sight
        fields = '__all__'
        extra_kwargs = {
            'price_set': {},
            'subsight_set': {}
        }
        fields = '__all__'

class SightSerializer(serializers.ModelSerializer):
    address = AddressSerializer(required=False, allow_null=True)

    class Meta:
        model = Sight
        exclude = ['open_time', 'close_time', 'playtime']


class SightBriefSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sight
        fields = ['id', 'name', 'hot', 'grade']
