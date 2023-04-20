# -*- coding: utf-8 -*-
# @Time    : 2023/4/2 下午7:31
# @Author  : Su Yang
# @File    : inner_sight.py
# @Software: PyCharm 
# @Comment :
from django.db import models
from django.conf import settings


class InnerSight(models.Model):
    name = models.CharField(max_length=settings.MAX_SUBSIGHT_NAME_LEN)
    longitude = models.FloatField(null=True, blank=True)
    latitude = models.FloatField(null=True, blank=True)
    sight = models.ForeignKey("Sight", on_delete=models.CASCADE, related_name='inner_sights')
    desc = models.TextField(null=True)
