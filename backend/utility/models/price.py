# -*- coding: utf-8 -*-
# @Time    : 2023/4/2 下午7:36
# @Author  : Su Yang
# @File    : price.py
# @Software: PyCharm 
# @Comment :
from django.db import models
from django.conf import settings


class Price(models.Model):
    name = models.CharField(max_length=settings.MAX_PRICE_TYPE_LEN)
    sight = models.ForeignKey("Sight", on_delete=models.CASCADE, null=True, related_name="prices")
    inner_sight = models.ForeignKey("InnerSight", on_delete=models.CASCADE, null=True, related_name="prices")
    price = models.FloatField()
