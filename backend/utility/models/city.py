# -*- coding: utf-8 -*-
# @Time    : 2023/4/2 下午6:48
# @Author  : Su Yang
# @File    : city.py
# @Software: PyCharm 
# @Comment :
from django.conf import settings
from django.db import models

from utility.models.province import Province


class City(models.Model):
    name = models.CharField(max_length=settings.MAX_CITY_NAME_LEN, primary_key=True)
    province = models.ForeignKey(Province, on_delete=models.CASCADE, related_name='city_province')
