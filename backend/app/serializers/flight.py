from rest_framework import serializers
from app.models import Flight, City, Province
from django.conf import settings

from .port import PortSerializer

class ProvinceSerializer(serializers.ModelSerializer):
    id = serializers.ReadOnlyField()
    class Meta:
        model = Province
        fields = ['id', 'name']

class CitySerializer(serializers.ModelSerializer):
    class Meta:
        model = City
        fields = ['name', 'province']

class FlightBaseSerializer(serializers.ModelSerializer):
    id = serializers.ReadOnlyField()
    city = CitySerializer(required=True, allow_null=False)
    endcity = CitySerializer(required=True, allow_null=False)

    class Meta:
        model = Flight
        fields = ["id","flight_no", "economy_minprice","economy_discount",
                 "bussiness_minprice", "bussiness_discount", "depart_time",
                  "cost_time", "arrival_time", "city", "endcity", "status"]


class FlightSerializer(serializers.ModelSerializer):
    id = serializers.ReadOnlyField()
    city = CitySerializer(required=True, allow_null=False)
    endcity = CitySerializer(required=True, allow_null=False)
    if_follow = serializers.SerializerMethodField('get_if_follow')

    def get_if_follow(self, obj):
        ret = settings.USERS_FLIGHT_UNFOLLOW
        try:
            usersFlight = obj.flight_to_user.all().filter(user_id=self.context.get("user_id")).first()
            if usersFlight is not None:
                ret = settings.USERS_FLIGHT_FOLLOW
        except Exception:
            pass
        return ret

    class Meta:
        model = Flight
        fields = ["id","flight_no", "economy_minprice","economy_discount",
                 "bussiness_minprice", "bussiness_discount", "depart_time",
                  "cost_time", "arrival_time", "city", "endcity", "if_follow", "status"]

class FlightDetailedSerializer(serializers.ModelSerializer):
    id = serializers.ReadOnlyField()
    city = CitySerializer(required=True, allow_null=False)
    endcity = CitySerializer(required=True, allow_null=False)
    departport = PortSerializer(required=True, allow_null=False)
    arrivalport = PortSerializer(required=True, allow_null=False)

    class Meta:
        model = Flight
        fields = ["id","flight_no", "economy_minprice","economy_discount",
                 "bussiness_minprice", "bussiness_discount","depart_time",
                  "cost_time", "arrival_time", "city", "endcity",
                  "food", "airline", "departport", "arrivalport", "status"]

