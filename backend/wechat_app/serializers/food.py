from rest_framework import serializers
from utility.models import Food, Image
from .images import ImageSerializer

class FoodSerializer(serializers.ModelSerializer):
    images = ImageSerializer(many=True, required=False, allow_null=True)

    class Meta:
        model = Food
        exclude = []

    def create(self, validated_data):
        print(validated_data)
        return super().create(validated_data)
    