from django.contrib.auth import get_user_model
from django.contrib.auth.management.commands.createsuperuser import PASSWORD_FIELD
from django.core import exceptions
from django.db import utils
import os

def create(username, password, *, database=None, **kwargs):
    user_model = get_user_model()
    user_data = {user_model.USERNAME_FIELD: username, PASSWORD_FIELD: password, **kwargs}
    if database == None:
        database = utils.DEFAULT_DB_ALIAS

    def is_exist(username):
        user_model = get_user_model()
        try:
            user_model._default_manager.db_manager(database).get_by_natural_key(username)
        except user_model.DoesNotExist:
            return False
        else:
            return True
    if is_exist(username):
        return

    try:
        user_model._meta.get_field(PASSWORD_FIELD)
    except exceptions.FieldDoesNotExist:
        pass
    else:
        user_data[PASSWORD_FIELD] = None
    user_model._default_manager.db_manager(database).create_superuser(**user_data)


if __name__ == '__main__':
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', f'main.settings')
    import django
    django.setup()

    from main import constants
    create(constants.ADMIN_USERNAME, constants.ADMIN_PASSWORD, email='')
