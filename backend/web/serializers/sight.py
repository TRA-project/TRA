# -*- coding: utf-8 -*-
# @Time    : 2023/4/2 下午7:49
# @Author  : Su Yang
# @File    : sight.py
# @Software: PyCharm 
# @Comment :
from rest_framework import serializers

from utility.models import Address
from utility.models.sight import Sight
from .address import AddressSerializer


class SightSerializer(serializers.ModelSerializer):
    address = AddressSerializer()

    class Meta:
        model = Sight
        fields = '__all__'
