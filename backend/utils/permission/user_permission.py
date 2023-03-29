# -*- coding: utf-8 -*-
# @Time    : 2023/3/29 上午11:23
# @Author  : Su Yang
# @File    : user_permission.py
# @Software: PyCharm 
# @Comment :
from utils import permission
from utils.permission.base_permission import BasePermission


class UserPermission(BasePermission):
    """
    Permission class of AppUser model.
    """

    def has_permission(self, request, view):
        return True

    def has_object_permission(self, request, view, obj):
        user = permission.user_check(request)
        if self.check_white_list(view):
            return True
        return user < 0 or user == obj.id \
            or permission.is_readonly_method(request.method)
