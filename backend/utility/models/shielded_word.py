from django.db import models
from django.conf import settings


class ShieldedWord(models.Model):
    name = models.CharField(max_length=settings.MAX_SHIELDINGWORDS_LEN)
