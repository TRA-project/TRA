from rest_framework import serializers
from user.models import Advertisement
from .image import ImageSerializer
from utils import mixins


class AdvertisementSerializer(serializers.ModelSerializer):
    id = serializers.ReadOnlyField()
    cover = mixins.PrimaryKeyNestedField(serializer=ImageSerializer)
    read = serializers.ReadOnlyField()

    class Meta:
        model = Advertisement
        exclude = []
        ref_name = "Admin_Advertisement"
