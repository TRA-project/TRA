from rest_framework import viewsets, permissions

from utility.models import FeedBack
from web.serializers import FeedbackSerializer


class FeedbackApis(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    queryset = FeedBack.objects.all()
    serializer_class = FeedbackSerializer
