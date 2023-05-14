from django.conf import settings
from django.db import models
from django.db import models
from django.conf import settings
from .appuser import AppUser
from .sight import Sight
from .plan import Plan


class PlanItem(models.Model):
    id = models.AutoField(primary_key=True)
    plan_id = models.ForeignKey(Plan, on_delete=models.CASCADE)
    sight = models.ForeignKey(Sight, on_delete=models.CASCADE)
    start_time = models.DateTimeField('start_time', null=True)
    end_time = models.DateTimeField('end_time', null=True)
    type = models.IntegerField('type', default=1, choices=((1, '景点'), (2, '交通'), (3, '住宿'), (4, "餐饮")))
    desc = models.TextField(null=True)
