from rest_framework import serializers
from user.models import Advertisement
from .images import ImageSerializer
from utils import mixins

class AdvertisementSerializer(serializers.ModelSerializer):
    id = serializers.ReadOnlyField()
    cover = mixins.PrimaryKeyNestedField(serializer=ImageSerializer)

    class Meta:
        model = Advertisement
        exclude = ['time', 'visible', 'read']
