import base64 as _b64
import hashlib as _hlib
import random

def random_str(len=16, dict='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789./'):
    return ''.join(random.choices(dict, k=len))

def random_id(len, dict='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'):
    return ''.join(random.choices(dict, k=len))

def byte_filter(s, tokens=b" \a\b\n\r\t\v\f"):
    return bytes(bytearray(s).translate(bytes.maketrans(b"", b""), bytearray(tokens)))

def str_filter(s, tokens=" \a\b\n\r\t\v\f", encoding="utf8"):
    return str(bytearray(s, encoding=encoding).translate(bytes.maketrans(b"", b""), bytearray(tokens,encoding=encoding)),encoding=encoding)

def sha256(data: (str, bytes)):
    if isinstance(data, str):
        data = data.encode('utf8')
    return _hlib.sha256(data).hexdigest()

def base64(data: (str, bytes), decode=True):
    if isinstance(data, str):
        data = data.encode('utf8')
    res = byte_filter(_b64.encodebytes(data), tokens=b"= \a\b\n\r\t\v\f")
    if decode: res = res.decode('utf8')
    return res

def base64rev(data: (str, bytes), decode='utf8'):
    if isinstance(data, str):
        data = data.encode('utf8')
    res = _b64.decodebytes(data)
    if decode is not None: res = res.decode(decode)
    return res

def sha256salt(data: (str, bytes), salt: int=15):
    if isinstance(data, str):
        data = data.encode('utf8')
    salt = random_str(salt)
    amount = random.randrange(0, 16)
    salt = hex(amount)[2:].upper() + salt
    salt = salt.encode('utf8')
    res = data + salt
    for i in range(amount):
        res = sha256(res).encode('utf8') + salt
    return res

def sha256salt_verify(value: (str, bytes), data: (str, bytes), salt: int=15):
    if isinstance(data, str):
        data = data.encode('utf8')
    if isinstance(value, str):
        value = value.encode('utf8')
    salt = data[-(salt + 1):]
    amount = int(salt[0], base=16)
    res = value + salt
    for i in range(amount):
        res = sha256(res).encode('utf8') + salt
    return res == data
