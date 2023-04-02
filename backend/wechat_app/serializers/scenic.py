from rest_framework import serializers
from utility.models import Scenic, Sight
from utils.mixins import PrimaryKeyNestedField


class ScenicSerializer(serializers.ModelSerializer):
    class Meta:
        model = Scenic
        fields = '__all__'


class SightSerializer(serializers.ModelSerializer):
    # sight = ScenicSerializer(read_only=True)
    class Meta:
        model = Sight
        fields = '__all__'