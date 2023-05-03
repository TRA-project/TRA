# -*- coding: utf-8 -*-
# @Time    : 2023/4/2 下午6:34
# @Author  : Su Yang
# @File    : sight.py
# @Software: PyCharm 
# @Comment :
from django.db import models
from django.conf import settings


class Sight(models.Model):
    name = models.CharField(max_length=settings.MAX_SIGHT_NAME_LEN, unique=True)
    address = models.ForeignKey("Address", on_delete=models.CASCADE, null=True)
    desc = models.TextField(null=True)
    hot = models.FloatField(default=0.0)
    grade = models.FloatField(default=5.0)
    open_time = models.CharField(null=True, max_length=128)
    playtime = models.FloatField(null=True)
    tags = models.ManyToManyField('Tag', related_name='sights', null=True)
    images = models.ManyToManyField('Image', related_name='sights', null=True)
    types = models.ManyToManyField('SightType', related_name='sights', null=True)
