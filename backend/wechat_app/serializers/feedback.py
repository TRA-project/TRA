from rest_framework import serializers
from utility.models import FeedBack
from utils.mixins import PrimaryKeyNestedField
from .user import UserSerializer

class AdminMessageSerializer(serializers.ModelSerializer):
    id = serializers.ReadOnlyField()
    owner = PrimaryKeyNestedField(serializer=UserSerializer)
    content = serializers.CharField(allow_null=False)

    class Meta:
        model = FeedBack
        exclude = []
