from django.db import models
from .appuser import AppUser
from .flight import Flight
from django.conf import settings


class UsersFlight(models.Model):
    user = models.ForeignKey(AppUser, on_delete=models.CASCADE, related_name='users_flight')
    flight = models.ForeignKey(Flight, on_delete=models.CASCADE, related_name='flight_to_user')
    if_alarm = models.IntegerField(default=settings.FLIGHT_ALARM_FALSE)
