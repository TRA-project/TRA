# -*- coding: utf-8 -*-
# @Time    : 2023/4/2 下午7:49
# @Author  : Su Yang
# @File    : sight.py
# @Software: PyCharm 
# @Comment :
from rest_framework import serializers

from utility.models.sight import Sight
from . import ImageSerializer
from .address import AddressSerializer
from .price import PriceSerializer
from .inner_sight import InnerSightSerializer


class SightDetailedSerializer(serializers.ModelSerializer):
    address = AddressSerializer(required=False, allow_null=True)
    prices = PriceSerializer(read_only=True, many=True)
    inner_sights = InnerSightSerializer(read_only=True, many=True)
    images = ImageSerializer(read_only=True, many=True)

    def to_representation(self, instance):
        data = super().to_representation(instance)
        images = [d.get('image') for d in data.pop('images', None)]
        data['images'] = images
        return data

    class Meta:
        model = Sight
        fields = '__all__'


class SightSerializer(serializers.ModelSerializer):
    prices = PriceSerializer(read_only=True, many=True)

    def to_representation(self, instance):
        data = super().to_representation(instance)
        prices_data = [d.get('price') for d in data.pop('prices', None)]
        data['price'] = min(prices_data, default=0)
        return data

    class Meta:
        model = Sight
        exclude = ['open_time', 'close_time', 'images']


class SightBriefSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sight
        fields = ['id', 'name', 'hot']
