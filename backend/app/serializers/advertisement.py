from rest_framework import serializers
from app.models import Advertisement
from .images import ImageSerializer
from utilities import mixins

class AdvertisementSerializer(serializers.ModelSerializer):
    id = serializers.ReadOnlyField()
    cover = mixins.PrimaryKeyNestedField(serializer=ImageSerializer)

    class Meta:
        model = Advertisement
        exclude = ['time', 'visible', 'read']
