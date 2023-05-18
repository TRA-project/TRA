from rest_framework import serializers
from utility.models import PlanCreateLog


class PlanCreateLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = PlanCreateLog
        fields = '__all__'

    def create(self, validated_data):
        return super().create(validated_data)