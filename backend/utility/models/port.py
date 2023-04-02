from django.db import models
from django.conf import settings

class Port(models.Model):
    code = models.CharField(max_length=settings.MAX_PORT_CODE_LEN, default='', blank=True)
    name = models.CharField(max_length=settings.MAX_PORT_NAME_LEN, default='', blank=True)
