import jwt as _jwt
import time

from django.conf import settings

class JwtError(_jwt.PyJWTError): pass

class InvalidKeyError(JwtError): pass
class InvalidPayloadError(JwtError): pass
class ExpiredTokenError(JwtError): pass

def jwt_token(key, payload=None, expire=settings.JWT_EXPIRE_SECONDS):
    if payload is None:
        payload = {}
    t = int(time.time())
    payload = {
        **payload,
        'iat': t,
        'exp': t + expire,
    }
    return _jwt.encode(payload, key, 'HS256')

def jwt_verify(token, key):
    try:
        claims = _jwt.decode(token, key=key)
    except _jwt.ExpiredSignatureError:
        raise ExpiredTokenError
    except _jwt.InvalidSignatureError:
        raise InvalidKeyError
    except _jwt.PyJWTError:
        raise InvalidPayloadError
    return claims
