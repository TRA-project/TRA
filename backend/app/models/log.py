from django.db import models
from django.conf import settings
from .appuser import AppUser

class Log(models.Model):
    time = models.DateTimeField(auto_now_add=True)
    user = models.ForeignKey(AppUser, on_delete=models.CASCADE, related_name='log')
    action = models.IntegerField(null=False)
    target_id = models.IntegerField(null=True,default=None)
    remarks = models.CharField(max_length=settings.MAX_REMARKS_LEN,default='')
