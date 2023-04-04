# -*- coding: utf-8 -*-
# @Time    : 2023/4/2 下午7:36
# @Author  : Su Yang
# @File    : price.py
# @Software: PyCharm 
# @Comment :
from django.db import models
from django.conf import settings


class Price(models.Model):
    name = models.CharField(max_length=settings.MAX_PRICE_NAME_LEN)
    sight = models.ForeignKey("Sight", on_delete=models.CASCADE, null=True)
    subsight = models.ForeignKey("Subsight", on_delete=models.CASCADE, null=True)
    price = models.FloatField()
    price_type = [
        (0, '成人'),
        (1, '儿童'),
        (2, '学生'),
        (3, '老人')
    ]
    type = models.SmallIntegerField(choices=price_type, default=0)
