from rest_framework import serializers
from utility.models import Feedback
from utils.mixins import PrimaryKeyNestedField
from .user import UserSerializer


class FeedbackSerializer(serializers.ModelSerializer):
    id = serializers.ReadOnlyField()
    owner = PrimaryKeyNestedField(serializer=UserSerializer)
    content = serializers.CharField(allow_null=False)

    class Meta:
        model = Feedback
        fields = '__all__'
