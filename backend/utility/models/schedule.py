from django.conf import settings
from django.db import models

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


