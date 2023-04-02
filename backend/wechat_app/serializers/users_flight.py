from rest_framework import serializers
from utility.models import UsersFlight
from .flight import FlightBaseSerializer
from utils import mixins


class UsersFlightSerializer(serializers.ModelSerializer):
    # user = mixins.PrimaryKeyNestedField(serializer=UserSerializer)
    flight = mixins.PrimaryKeyNestedField(serializer=FlightBaseSerializer)

    class Meta:
        model = UsersFlight
        fields = ['user', 'flight', 'if_alarm']
