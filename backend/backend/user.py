from django.contrib.auth.models import User
from django.contrib.auth.hashers import make_password

from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.exceptions import ParseError, NotAcceptable, ValidationError
from rest_framework.response import Response
from rest_framework import serializers

from utils import conversion

import random


def make_sha256_password(password):
    return make_password(password, None, 'pbkdf2_sha256')


def generate(size=8, symbol=False):
    dic = '0123456789012345678901234567890123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
    if symbol: dic += '!@#$%^&*()_+=-'
    return ''.join(random.choices(dic, k=size))


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'email']
        ref_name = "Main_AppUser"


class UserView(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]

    queryset = User.objects.all()
    serializer_class = UserSerializer

    lookup_field = 'username'

    def check_superuser_permission(self, request):
        if not request.user.is_superuser and not request.user.username == self.get_object().username:
            raise ValidationError("Permission denied")

    def create(self, request, *args, **kwargs):
        username = request.data.get('username')
        password = request.data.get('password')
        email = request.data.get('email', '')
        is_superuser = conversion.get_bool(request.data, 'is_superuser')
        if not username or not password:
            raise ParseError("Username and password are required!")

        if not request.user.is_superuser and is_superuser:
            raise ValidationError("Super user can only be created by super users")

        try:
            User.objects.create(username=username, password=make_sha256_password(password), email=email,
                                is_superuser=is_superuser, is_staff=True)
        except Exception:
            raise NotAcceptable("Create user failed!")

        return Response(status=201)

    def update(self, request, *args, **kwargs):
        self.check_superuser_permission(request)
        username = request.data.get("username")
        password = request.data.get("password")
        if not username or not password:
            raise ParseError("Username and password are required!")

        return self.partial_update(request, *args, **kwargs)

    def partial_update(self, request, *args, **kwargs):
        self.check_superuser_permission(request)
        user = self.get_object()

        username = request.data.get("username", "")
        password = request.data.get("password", "")
        email = request.data.get("email", "")

        if email:
            user.email = email
        if password:
            user.password = make_sha256_password(password)
        try:
            if username:
                user.username = username
            user.save()
        except Exception:
            raise NotAcceptable("Username should be unique")

        return Response(status=200)

    def destroy(self, request, *args, **kwargs):
        self.check_superuser_permission(request)
        try:
            self.get_object().delete()
        except Exception:
            raise NotAcceptable("Delete user failed!")
        return Response(status=204)
