from django.conf import settings
from django.db import models
from django.db import models
from django.conf import settings
from .appuser import AppUser
from .sight import Sight


class Plan(models.Model):
    owner = models.ForeignKey(AppUser, on_delete=models.CASCADE, related_name='user_plan_name')
    name = models.CharField('plan_name',max_length=100,default='出行计划')


