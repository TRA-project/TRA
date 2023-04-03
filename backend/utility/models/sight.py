# -*- coding: utf-8 -*-
# @Time    : 2023/4/2 下午6:34
# @Author  : Su Yang
# @File    : sight.py
# @Software: PyCharm 
# @Comment :
from django.db import models
from django.conf import settings


class Sight(models.Model):
    name = models.CharField(max_length=settings.MAX_SIGHT_NAME_LEN)
    address = models.ForeignKey("Address", on_delete=models.CASCADE)
    introduce = models.TextField(null=True)
    hot = models.FloatField(default=0.0)
    grade = models.FloatField(default=5.0)
    open_time = models.TimeField(null=True)
    close_time = models.TimeField(null=True)
    playtime = models.FloatField(null=True)
    cover = models.OneToOneField('Image', on_delete=models.CASCADE)

