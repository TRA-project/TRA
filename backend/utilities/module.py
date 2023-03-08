import sys as _sys
import os as _os

def module_name():
    _f = _sys._getframe().f_back.f_globals.get('__file__', None)
    if _f is None: return None
    return _os.path.basename(_os.path.dirname(_os.path.abspath(_f)))
