from rest_framework import serializers
from utility.models import PlanSchedule


class PlanScheduleSerializer(serializers.ModelSerializer):

    class Meta:
        model = PlanSchedule
        fields = '__all__'

    def create(self, validated_data):
        return super().create(validated_data)