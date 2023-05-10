from rest_framework import serializers
from utility.models.plan_item import PlanItem
from wechat_app.serializers.sight import SightPlanSerializer, SightPlanShowSerializer


class PlanItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = PlanItem
        fields = '__all__'

    def create(self, validated_data):
        return super().create(validated_data)


class PlanItemDetailSerializer(serializers.ModelSerializer):
    sight_id = SightPlanShowSerializer(read_only=True)

    class Meta:
        model = PlanItem
        fields = '__all__'

    def create(self, validated_data):
        return super().create(validated_data)
