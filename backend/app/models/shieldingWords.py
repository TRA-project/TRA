from django.db import models
from django.conf import settings

class ShieldingWords(models.Model):
    name = models.CharField(max_length=settings.MAX_SHIELDINGWORDS_LEN)