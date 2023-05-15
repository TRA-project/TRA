from rest_framework import viewsets, permissions

from utility.models import Feedback
from web.serializers import FeedbackSerializer


class FeedbackApis(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    queryset = Feedback.objects.all()
    serializer_class = FeedbackSerializer


