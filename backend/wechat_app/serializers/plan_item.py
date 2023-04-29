from rest_framework import serializers
from utility.models.plan_item import PlanItem
from wechat_app.serializers.sight import SightPlanSerializer


class PlanItemSerializer(serializers.ModelSerializer):
    sight = SightPlanSerializer(read_only=True)

    class Meta:
        model = PlanItem
        fields = '__all__'

    def create(self, validated_data):
        return super().create(validated_data)
