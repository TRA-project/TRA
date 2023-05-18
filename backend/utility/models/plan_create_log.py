from django.conf import settings
from django.db import models
from django.db import models
from django.conf import settings
from .appuser import AppUser


class PlanCreateLog(models.Model):
    owner = models.ForeignKey(AppUser, on_delete=models.CASCADE, related_name='user_create_plan_name')
    create_time = models.IntegerField('create_time', null=True)
    start_time = models.IntegerField('start_time', null=True)
    end_time = models.IntegerField('end_time', null=True)
    target_city = models.CharField(max_length=32, default='', blank=True)
    desc = models.TextField(null=True,blank=True)
