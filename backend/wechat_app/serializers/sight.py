# -*- coding: utf-8 -*-
# @Time    : 2023/4/2 下午7:49
# @Author  : Su Yang
# @File    : sight.py
# @Software: PyCharm 
# @Comment :
from rest_framework import serializers

from utility.models.price import Price
from utility.models.sight import Sight
from .address import AddressSerializer


class SightSerializer(serializers.ModelSerializer):
    address = AddressSerializer(required=False, allow_null=True)
    prices = serializers.PrimaryKeyRelatedField(queryset=Price.objects.all(), read_only=True)

    class Meta:
        model = Sight
        fields = ['name', 'address', 'introduce', 'hot', 'grade', 'open_time', 'close_time', 'play_time', 'prices']


class SightBriefSerializer(serializers.ModelSerializer):

    class Meta:
        model = Sight
        fields = ['name', 'hot', 'grade']
