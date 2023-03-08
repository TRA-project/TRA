from django.apps import AppConfig
from django.utils.module_loading import autodiscover_modules


class _AppConfig(AppConfig):
    name = 'app'

    def ready(self):
        autodiscover_modules('/AI/NLP.py')
