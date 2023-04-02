# -*- coding: utf-8 -*-
# @Time    : 2023/4/2 下午7:31
# @Author  : Su Yang
# @File    : subsight.py
# @Software: PyCharm 
# @Comment :
from django.db import models
from django.conf import settings


class Subsight(models.Model):
    name = models.CharField(max_length=settings.MAX_SUBSIGHT_NAME_LEN)
    position = models.ForeignKey("Position", on_delete=models.CASCADE)
    sight = models.ForeignKey("Sight", on_delete=models.CASCADE)
    introduce = models.TextField(null=True)
