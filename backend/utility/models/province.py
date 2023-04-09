# -*- coding: utf-8 -*-
# @Time    : 2023/4/2 下午6:49
# @Author  : Su Yang
# @File    : province.py
# @Software: PyCharm 
# @Comment :
from django.conf import settings
from django.db import models


class Province(models.Model):
    name = models.CharField(max_length=settings.MAX_PROVINCE_NAME_LEN)
