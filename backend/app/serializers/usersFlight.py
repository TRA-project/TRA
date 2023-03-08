from rest_framework import serializers
from app.models import UsersFlight, Flight
from .flight import FlightBaseSerializer
from .user import UserSerializer
from utilities import mixins

class UsersFlightSerializer(serializers.ModelSerializer):
    # user = mixins.PrimaryKeyNestedField(serializer=UserSerializer)
    flight = mixins.PrimaryKeyNestedField(serializer=FlightBaseSerializer)

    class Meta:
        model = UsersFlight
        fields = ['user', 'flight', 'if_alarm']