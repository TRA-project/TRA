from django.conf import settings
from django.db import models
from django.db import models
from django.conf import settings
from .appuser import AppUser
from .sight import Sight


class Plan(models.Model):
    owner = models.ForeignKey(AppUser, on_delete=models.CASCADE, related_name='user_plan_name')
    order = models.IntegerField('order')  # 一个旅行计划的次序，和pid共同构成主键
    sight = models.ForeignKey(Sight, related_name="sight_name", null=True, on_delete=models.CASCADE)

    class Meta:
        unique_together = ("owner", "order")
