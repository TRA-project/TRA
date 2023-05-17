# -*- coding: utf-8 -*-
# @Time    : 2023/4/2 下午7:49
# @Author  : Su Yang
# @File    : sight.py
# @Software: PyCharm 
# @Comment :
from rest_framework import serializers

from utility.models.sight import Sight
from utility.models.image import Image
from utility.models.address import Address
from .address import AddressSerializer
from .price import PriceSerializer
from .inner_sight import InnerSightSerializer


class SightSerializer(serializers.ModelSerializer):
    address = AddressSerializer()
    subsight_set = InnerSightSerializer(many=True, read_only=True)
    price_set = PriceSerializer(many=True, read_only=True)

    def create(self, validated_data):
        address = Address.objects.create(**validated_data['address'])
        validated_data['address'] = address
        return super().create(validated_data)

    class Meta:
        model = Sight
        fields = '__all__'
        read_only_fields = ('subsight_set', 'price_set')

