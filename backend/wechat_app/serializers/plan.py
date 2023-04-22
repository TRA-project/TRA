from rest_framework import serializers
from utility.models import Plan
from wechat_app.serializers import AddressSerializer
from wechat_app.serializers.sight import SightSerializer, SightDetailedSerializer


# 注意大小写！！！！


class PlanSerializer(serializers.ModelSerializer):


    class Meta:
        model = Plan
        fields = '__all__'
