from rest_framework import serializers
from utility.models import Feedback
from utils.mixins import PrimaryKeyNestedField
from .user import UserSerializer
from django.conf import settings


class FeedbackSerializer(serializers.ModelSerializer):
    id = serializers.ReadOnlyField()
    owner = PrimaryKeyNestedField(serializer=UserSerializer)
    content = serializers.CharField(allow_null=False)
    status = serializers.ChoiceField(choices=settings.FEEDBACK_STATUS)
    type = serializers.ChoiceField(choices=settings.FEEDBACK_TYPE)

    class Meta:
        model = Feedback
        fields = '__all__'
