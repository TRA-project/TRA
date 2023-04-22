# -*- coding: utf-8 -*-
# @Time    : 2023/4/20 下午6:43
# @Author  : Su Yang
# @File    : sight_type.py
# @Software: PyCharm 
# @Comment :
from django.db import models
from backend import settings


class SightType(models.Model):
    type = models.SmallIntegerField(choices=settings.SIGHT_TYPE_CHOICE)
