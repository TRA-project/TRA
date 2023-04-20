# -*- coding: utf-8 -*-
# @Time    : 2023/4/2 下午8:14
# @Author  : Su Yang
# @File    : price.py
# @Software: PyCharm 
# @Comment :
from rest_framework import serializers

from utility.models.price import Price
from backend import settings


class PriceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Price
        fields = '__all__'

