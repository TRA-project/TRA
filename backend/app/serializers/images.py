from rest_framework import serializers
from app.models.images import Image
import os
from utilities.mixins import ImageNameField

class ImageSerializer(serializers.ModelSerializer):
    id = serializers.CharField(read_only=True)
    time = serializers.DateTimeField(read_only=True)
    description = serializers.CharField(read_only=True)
    image = ImageNameField(name_truncate=32)

    class Meta:
        model = Image
        exclude = []
