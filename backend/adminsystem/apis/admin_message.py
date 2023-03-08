from rest_framework import viewsets, permissions
from rest_framework.response import Response
from rest_framework.exceptions import ParseError, NotAcceptable, PermissionDenied
from rest_framework.decorators import action

from django.conf import settings
from app.models import AdminMessage, AppUser
from adminsystem.serializers import AdminMessageSerializer
from utilities import conversion, filters, permission as _permission, date


class AdminMessageApis(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    queryset = AdminMessage.objects.all()
    serializer_class = AdminMessageSerializer
