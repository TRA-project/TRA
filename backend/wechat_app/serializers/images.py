from rest_framework import serializers
from utility.models import Image
from utils.mixins import ImageNameField


class ImageSerializer(serializers.ModelSerializer):
    id = serializers.CharField(read_only=True)
    time = serializers.DateTimeField(read_only=True)
    description = serializers.CharField(read_only=True)
    image = ImageNameField(name_truncate=32)

    class Meta:
        model = Image
        exclude = []


class TestSerializer(serializers.ModelSerializer):
    id = serializers.CharField(read_only=True)
    time = serializers.DateTimeField(read_only=True)
    description = serializers.CharField(read_only=True)
    image = serializers.ImageField(read_only=True)

    class Meta:
        model = Image
        exclude = []