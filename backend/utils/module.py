import sys
import os


def module_name():
    _f = sys._getframe().f_back.f_globals.get('__file__', None)
    if _f is None:
        return None
    return os.path.basename(os.path.dirname(os.path.abspath(_f)))
