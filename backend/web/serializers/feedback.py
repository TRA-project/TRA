from rest_framework import serializers
from utility.models import Feedback
from utils.mixins import PrimaryKeyNestedField
from .user import UserSerializer
from django.conf import settings


class FeedbackSerializer(serializers.ModelSerializer):
    id = serializers.ReadOnlyField()
    owner = PrimaryKeyNestedField(serializer=UserSerializer)
    status = serializers.ChoiceField(choices=settings.FEEDBACK_STATUS, source='get_status_display')
    type = serializers.ChoiceField(choices=settings.FEEDBACK_TYPE, source='get_type_display')

    class Meta:
        model = Feedback
        exclude = []
        ref_name = "Admin_AdminMessage"
