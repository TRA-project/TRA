# -*- coding: utf-8 -*-
# @Time    : 2023/3/29 下午8:02
# @Author  : Su Yang
# @File    : read_record.py
# @Software: PyCharm 
# @Comment :
from django.db import models


class ReadRecord(models.Model):
    """
    Foreign keys:

    """
    date = models.DateField(auto_now=True)
    amount = models.IntegerField(default=0)
    owner = models.ForeignKey("TravelNotes", on_delete=models.CASCADE, related_name='read_records')
