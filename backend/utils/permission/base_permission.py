# -*- coding: utf-8 -*-
# @Time    : 2023/3/29 上午11:23
# @Author  : Su Yang
# @File    : base_permission.py
# @Software: PyCharm 
# @Comment :
from rest_framework.permissions import BasePermission as _BasePermission


class BasePermission(_BasePermission):
    def check_white_list(self, view):
        action = getattr(view, view.action, None)
        if action and getattr(action, '__whitelist__', False):
            return True
        whitelist = getattr(view, 'whitelist_methods', None)
        if whitelist and view.action in whitelist:
            return True
        return False
