from rest_framework import serializers
from user.models import Flight, City, Province

from utils.mixins import PrimaryKeyNestedField
from .port import PortSerializer

class ProvinceSerializer(serializers.ModelSerializer):
    id = serializers.ReadOnlyField()
    class Meta:
        model = Province
        fields = ['id', 'name']
        ref_name = "Admin_Province"

class CitySerializer(serializers.ModelSerializer):
    class Meta:
        model = City
        fields = ['name', 'province']
        ref_name = "Admin_City"

class FlightBaseSerializer(serializers.ModelSerializer):
    id = serializers.ReadOnlyField()
    city = CitySerializer(required=True, allow_null=False)
    endcity = CitySerializer(required=True, allow_null=False)

    class Meta:
        model = Flight
        fields = ["id","flight_no", "economy_minprice","economy_discount",
                 "bussiness_minprice", "bussiness_discount", "depart_time",
                  "cost_time", "arrival_time", "city", "endcity", "status"]
        ref_name = "Admin_FlightBase"


class FlightSerializer(serializers.ModelSerializer):
    id = serializers.ReadOnlyField()
    city = CitySerializer(required=True, allow_null=False)
    endcity = CitySerializer(required=True, allow_null=False)

    class Meta:
        model = Flight
        fields = ["id","flight_no", "economy_minprice","economy_discount",
                 "bussiness_minprice", "bussiness_discount", "depart_time",
                  "cost_time", "arrival_time", "city", "endcity", "status"]
        ref_name = "Admin_Flight"

class FlightDetailedSerializer(serializers.ModelSerializer):
    id = serializers.ReadOnlyField()
    city = PrimaryKeyNestedField(serializer=CitySerializer)
    endcity = PrimaryKeyNestedField(serializer=CitySerializer)
    departport = PrimaryKeyNestedField(serializer=PortSerializer)
    arrivalport = PrimaryKeyNestedField(serializer=PortSerializer)

    class Meta:
        model = Flight
        fields = ["id","flight_no", "economy_minprice","economy_discount",
                 "bussiness_minprice", "bussiness_discount","depart_time",
                  "cost_time", "arrival_time", "city", "endcity",
                  "food", "airline", "departport", "arrivalport", "status"]
        ref_name = "Admin_FlightDetailed"
