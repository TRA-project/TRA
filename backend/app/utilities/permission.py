from rest_framework.permissions import BasePermission as _BasePermission
from utilities import permission, conversion
from rest_framework.decorators import action as _action
from django.conf import settings

class BasePermission(_BasePermission):
    def check_whitelist(self, view):
        action = getattr(view, view.action, None)
        if action and getattr(action, '__whitelist__', False):
            return True
        whitelist = getattr(view, 'whitelist_methods', None)
        if whitelist and view.action in whitelist:
            return True
        return False

class UserPermission(BasePermission):
    """
    Permission class of AppUser model.
    """
    def has_permission(self, request, view):
        return True

    def has_object_permission(self, request, view, obj):
        user = permission.user_check(request)
        if self.check_whitelist(view):
            return True
        return user < 0 or user == obj.id \
            or permission.is_readonly_method(request.method)

class ContentPermission(BasePermission):
    """
    Permission class of Travel, Comment, Schedule, Message and TravelCollection model.
    """
    def has_permission(self, request, view):
        return True

    def has_object_permission(self, request, view, obj):
        user = permission.user_check(request)

        if self.check_whitelist(view):
            return True
        return user < 0 or user == obj.owner_id \
            or permission.is_readonly_method(request.method)


class FlightPermission(BasePermission):
    """
    Permission class of Flight model.
    Deny anonymous users
    """
    def has_permission(self, request, view):
        return True

    def has_object_permission(self, request, view, obj):
        user = permission.user_check(request)

        if self.check_whitelist(view):
            return True
        return user != 0

class UsersFlightPermission(BasePermission):
    """
    Permission class of UsersFlight model.
    """
    def has_permission(self, request, view):
        return True

    def has_object_permission(self, request, view, obj):
        user = permission.user_check(request)

        if self.check_whitelist(view):
            return True
        return user < 0 or user == obj.user_id

class ScheduleItemPermission(BasePermission):
    """
    Permission class of ScheduleItem model.
    """
    def has_permission(self, request, view):
        return True

    def has_object_permission(self, request, view, obj):
        user = permission.user_check(request)

        if self.check_whitelist(view):
            return True
        return user < 0 or user == obj.schedule.owner_id

def whiteaction(methods=None, detail=None, url_path=None, url_name=None, **kwargs):
    dec = _action(methods=methods, detail=detail, url_path=url_path, url_name=url_name, **kwargs)
    def decorator(func):
        func = dec(func)
        func.__whitelist__ = True
        return func
    return decorator
