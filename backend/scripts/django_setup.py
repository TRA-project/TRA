import os as _os
import sys as _sys
import django as _django

_os.environ.setdefault('DJANGO_SETTINGS_MODULE', f'main.settings')
_sys.path.append(_os.path.dirname(_os.path.dirname(_os.path.abspath(__file__))))
_django.setup()
