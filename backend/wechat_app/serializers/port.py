from rest_framework import serializers
from utility.models import Port

class PortSerializer(serializers.ModelSerializer):

    class Meta:
        model = Port
        fields = ["code","name"]