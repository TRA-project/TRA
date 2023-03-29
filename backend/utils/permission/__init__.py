# -*- coding: utf-8 -*-
# @Time    : 2023/3/29 上午11:22
# @Author  : Su Yang
# @File    : __init__.py.py
# @Software: PyCharm 
# @Comment :
from django.conf import settings
from django.contrib.auth.models import User, AnonymousUser
from rest_framework.decorators import action as _action
from rest_framework.permissions import SAFE_METHODS
from rest_framework.request import Request as _Request

from utils import jwt

from .base_permission import BasePermission
from .content_permission import ContentPermission
from .flight_permission import FlightPermission
from .schedule_item_permission import ScheduleItemPermission
from .user_permission import UserPermission
from .users_flight_permission import UsersFlightPermission


def is_readonly_method(method):
    return method in SAFE_METHODS


def user_check(request: _Request):
    user = request.user
    if isinstance(user, AnonymousUser):
        if request.session.get('is_login', False):
            return request.session.get('user_id', settings.ANONYMOUS_USER_ID)
        jwt_token = request.headers.get(settings.USER_JWT_HEADER_NAME, None)
        if jwt_token:
            try:
                payload = jwt.jwt_verify(jwt_token, settings.USER_JWT_KEY)
            except jwt.JwtError:
                return settings.ANONYMOUS_USER_ID
            return payload.get('id', settings.ANONYMOUS_USER_ID)
        return settings.ANONYMOUS_USER_ID
    elif isinstance(user, User):
        if user.is_superuser:
            return settings.SUPER_USER_ID
        return settings.ADMIN_USER_ID
    return settings.ANONYMOUS_USER_ID


def white_action(methods=None, detail=None, url_path=None, url_name=None, **kwargs):
    dec = _action(methods=methods, detail=detail, url_path=url_path, url_name=url_name, **kwargs)

    def decorator(func):
        func = dec(func)
        func.__whitelist__ = True
        return func

    return decorator
