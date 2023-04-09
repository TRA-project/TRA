import requests
import json
from django.conf import settings
from rest_framework import exceptions

def access_token():
    response = requests.get('https://api.weixin.qq.com/cgi-bin/token', params={
        'grant_type': 'client_credential',
        'appid': settings.APPID,
        'secret': settings.APPSECRET,
    })
    res = json.loads(response.content)
    token = res.get('access_token', None)
    return token

def get_openid(code):
    response = requests.get('https://api.weixin.qq.com/sns/jscode2session', params={
        'grant_type': 'authorization_code',
        'appid': settings.APPID,
        'secret': settings.APPSECRET,
        'js_code': code,
    })
    res = json.loads(response.content)
    errcode = res.get('errcode', 0)
    if errcode == -1:
        raise exceptions.Throttled()
    elif errcode == 40029:
        raise exceptions.PermissionDenied('Invalid code')
    elif errcode == 45011:
        raise exceptions.Throttled()
    return res.get('openid')
