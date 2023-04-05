# -*- coding: utf-8 -*-
# @Time    : 2023/4/2 下午7:49
# @Author  : Su Yang
# @File    : sight.py
# @Software: PyCharm 
# @Comment :
from rest_framework import serializers

from utility.models.sight import Sight
from utility.models.address import Address
from .address import AddressSerializer


class SightSerializer(serializers.ModelSerializer):
    address = AddressSerializer()

    def create(self, validated_data):
        address = Address.objects.create(**validated_data['address'])
        validated_data['address'] = address
        return super().create(validated_data)

    class Meta:
        model = Sight
        fields = '__all__'
