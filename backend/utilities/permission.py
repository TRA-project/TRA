from rest_framework.permissions import SAFE_METHODS
from rest_framework.request import Request as _Request
from django.contrib.auth.models import User, AnonymousUser
from django.conf import settings

from . import jwt

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
