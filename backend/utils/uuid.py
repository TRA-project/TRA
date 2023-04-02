import uuid as _uuid
import time, os
from django.utils.deconstruct import deconstructible

from django.conf import settings


def time_hex(len=16):
    return f'%0{len}x' % int(time.time() * 1000000)


def _str_uuid(namespace, name):
    res = str(_uuid.uuid3(_uuid.UUID(namespace), name))
    return res[:8] + res[9:13] + res[14:18] + res[19:23] + res[24:]


def uuid(name=None, prefix=time_hex, namespace=settings.DEFAULT_NAMESPACE):
    if name is not None:
        name = str(name)
    else:
        name = ''
    if callable(prefix):
        prefix = prefix()
    else:
        prefix = str(prefix)
    return _str_uuid(namespace, prefix + name)


def file_rename(name, namespace=settings.DEFAULT_NAMESPACE):
    return uuid(namespace=namespace) + str(name)


@deconstructible
class on_upload_rename:
    def __init__(self, path):
        self.path = path

    def __call__(self, instance, name):
        return self.path + os.sep + file_rename(name)
