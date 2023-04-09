# -*- coding: utf-8 -*-
# @Time    : 2023/3/29 下午7:21
# @Author  : Su Yang
# @File    : schedule_item.py
# @Software: PyCharm 
# @Comment :
from django.conf import settings
from django.db import models

from .address import Address


class ScheduleItem(models.Model):
    start_time = models.TimeField(null=False)
    end_time = models.TimeField(null=False)
    content = models.TextField(default='', max_length=settings.MAX_SCHEDULEITEM_CONTENT_LENGTH, blank=True)
    budget = models.FloatField(null=True)
    real_consumption = models.FloatField(null=True)
    position = models.ForeignKey(Address, related_name='addr_schedule_item_records', null=True,
                                 on_delete=models.SET_NULL)
    if_alarm = models.IntegerField(default=settings.SCHEDULE_ALARM_FALSE)
    schedule = models.ForeignKey('Schedule', related_name='schedule_items', null=False, on_delete=models.CASCADE)
