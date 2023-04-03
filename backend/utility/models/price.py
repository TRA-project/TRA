# -*- coding: utf-8 -*-
# @Time    : 2023/4/2 下午7:36
# @Author  : Su Yang
# @File    : price.py
# @Software: PyCharm 
# @Comment :
from django.db import models
from django.conf import settings


class Price(models.Model):
    name = models.CharField(max_length=settings)
    sight = models.ForeignKey("Sight", on_delete=models.CASCADE, null=True)
    subsight = models.ForeignKey("Subsight", on_delete=models.CASCADE, null=True)
    price = models.FloatField()
    price_type = {
        '成人': 0,
        '儿童': 1,
        '学生': 2,
        '老人': 3,
        '军人': 4
    }
    type = models.SmallIntegerField(choices=price_type, default=0)
