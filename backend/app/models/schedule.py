from django.db import models
from django.conf import settings

from .address import Address
from .appuser import AppUser


class Schedule(models.Model):
    owner = models.ForeignKey(AppUser, on_delete=models.CASCADE, null=True, related_name='user_schedule_records')
    create_time = models.DateTimeField(auto_now_add=True)
    date = models.DateField(null=False)
    title = models.TextField(null=False, max_length=settings.MAX_SCHEDULE_REMARKS_LENGTH)
    remarks = models.TextField(null=True, default=None, max_length=settings.MAX_SCHEDULE_REMARKS_LENGTH)
    visibility = models.IntegerField(default=settings.SCHEDULE_VISIBILITIES_PRIVATE)
    forbidden = models.IntegerField(default=settings.SCHEDULE_FORBIDDEN_FALSE)
    forbidden_reason = models.TextField(default='')


class ScheduleItem(models.Model):
    start_time = models.TimeField(null=False)
    end_time = models.TimeField(null=False)
    content = models.TextField(default='', max_length=settings.MAX_SCHEDULEITEM_CONTENT_LENGTH, blank=True)
    budget = models.FloatField(null=True)
    real_consumption = models.FloatField(null=True)
    position = models.ForeignKey(Address, related_name='addr_scheduleitem_records', null=True,
                                 on_delete=models.SET_NULL)
    if_alarm = models.IntegerField(default=settings.SCHEDULE_ALARM_FALSE)
    schedule = models.ForeignKey(Schedule, related_name='schedule_items', null=False, on_delete=models.CASCADE)
