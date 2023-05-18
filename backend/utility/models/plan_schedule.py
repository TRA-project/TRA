from django.db import models
from .plan import Plan
from .schedule import Schedule


class PlanSchedule(models.Model):
    id = models.AutoField(primary_key=True)
    plan_id = models.ForeignKey(Plan, on_delete=models.CASCADE)
    schedule_id = models.ForeignKey(Schedule, on_delete=models.CASCADE)
