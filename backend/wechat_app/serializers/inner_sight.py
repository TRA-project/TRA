# -*- coding: utf-8 -*-
# @Time    : 2023/4/4 上午11:35
# @Author  : Su Yang
# @File    : inner_sight.py
# @Software: PyCharm 
# @Comment :
from rest_framework import serializers

from utility.models import InnerSight


class InnerSightSerializer(serializers.ModelSerializer):

    class Meta:
        model = InnerSight
        fields = ['id', 'name', 'desc']
