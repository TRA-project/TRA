from rest_framework import serializers
from utility.models import Plan
#注意大小写！！！！


class PlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = Plan
        fields = '__all__'
