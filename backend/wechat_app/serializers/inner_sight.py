# -*- coding: utf-8 -*-
# @Time    : 2023/4/4 上午11:35
# @Author  : Su Yang
# @File    : inner_sight.py
# @Software: PyCharm 
# @Comment :
from rest_framework import serializers

from utility.models import InnerSight


class InnerSightSerializer(serializers.ModelSerializer):

    def create(self, validated_data):
        validated_data['sight_id'] = self.initial_data.get('sight_id')
        return super().create(validated_data)

    class Meta:
        model = InnerSight
        fields = ['id', 'name', 'desc']
