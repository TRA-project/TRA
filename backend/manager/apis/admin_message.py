from rest_framework import viewsets, permissions

from user.models import FeedBack
from manager.serializers import AdminMessageSerializer


class AdminMessageApis(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    queryset = FeedBack.objects.all()
    serializer_class = AdminMessageSerializer
