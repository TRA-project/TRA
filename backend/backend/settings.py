"""
Django settings for travel_backend project.

Generated by 'django-web startproject' using Django 2.2.3.

For more information on this file, see
https://docs.djangoproject.com/en/2.2/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/2.2/ref/settings/
"""

import os
import datetime

# TEMPDEBUG
tDEBUG = 1

MODULE_NAME = 'backend'  # utilities.module.module_name()

# Build paths inside the project like this: os.path.join(BASE_DIR, ...)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

MEDIA_ROOT = os.path.join(BASE_DIR, 'media')
MEDIA_URL = '/media/'

# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/2.2/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = '*##yvskb-y)$ix0r&q)t$4kw^mr-1-4@8)ctl%u=y+8lt@qn)8'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = ['*']

# Application definition

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django_nose',
    'django_filters',
    'rest_framework',
    'django_extensions',
    'sslserver',
    'drf_yasg',
    # 'django_crontab',
    'utility.apps.UtilityConfig',
    'wechat_app.apps.UserConfig',
    'web.apps.ManagerConfig'
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

TEST_RUNNER = 'django_nose.NoseTestSuiteRunner'

ROOT_URLCONF = f'{MODULE_NAME}.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [
            os.path.join(BASE_DIR, 'templates'),
        ]
        ,
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = f'{MODULE_NAME}.wsgi.application'

# Database
# https://docs.djangoproject.com/en/2.2/ref/settings/#databases

# DATABASE_DIR = os.path.dirname(BASE_DIR)
DATABASE_DIR = BASE_DIR

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': os.path.join(DATABASE_DIR, 'db.sqlite3'),
    }
}

# DATABASES = {
#     'default': {
#         'ENGINE': 'django.db.backends.mysql',  # 默认
#         'NAME': 'tra_fr_2',  # 连接的数据库
#         'HOST': '127.0.0.1',  # mysql的ip地址
#         'PORT': 3306,  # mysql的端口
#         'USER': 'root', # mysql的用户名
#         'PASSWORD': 'l553534541L.'  # mysql的密码
#     }
# }

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Password validation
# https://docs.djangoproject.com/en/2.2/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

# Internationalization
# https://docs.djangoproject.com/en/2.2/topics/i18n/

LANGUAGE_CODE = 'zh-Hans'

USE_I18N = True

USE_L10N = True

USE_TZ = True
TIME_ZONE = 'Asia/Shanghai'

# 避免时区的问题
CELERY_TIMEZONE = 'Asia/Shanghai'
CELERY_ENABLE_UTC = False
DJANGO_CELERY_BEAT_TZ_AWARE = False

# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/2.2/howto/static-files/

STATIC_URL = '/static/'

REST_FRAMEWORK = {
    'DEFAULT_FILTER_BACKENDS': ['django_filters.rest_framework.DjangoFilterBackend',
                                'rest_framework.filters.OrderingFilter'],
    #    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'DEFAULT_PAGINATION_CLASS': 'backend.paginators.DefaultPagination',
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.SessionAuthentication',
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
    'PAGE_SIZE': 20,
    'EXCEPTION_HANDLER': 'utils.response.exception_handler',
}

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': datetime.timedelta(seconds=86400),
}

SESSION_ENGINE = 'django.contrib.sessions.backends.cached_db'  # 引擎（默认）

SESSION_COOKIE_NAME = "sessionid"  # Session的cookie保存在浏览器上时的key，即：sessionid＝随机字符串（默认）
SESSION_COOKIE_PATH = "/"  # Session的cookie保存的路径（默认）
SESSION_COOKIE_DOMAIN = None  # Session的cookie保存的域名（默认）
SESSION_COOKIE_SECURE = False  # 是否Https传输cookie（默认）
SESSION_COOKIE_HTTPONLY = True  # 是否Session的cookie只支持http传输（默认）
SESSION_COOKIE_AGE = 1209600  # Session的cookie失效日期（2周）（默认）
SESSION_EXPIRE_AT_BROWSER_CLOSE = False  # 是否关闭浏览器使得Session过期（默认）
SESSION_SAVE_EVERY_REQUEST = False  # 是否每次请求都保存Session，默认修改之后才保存（默认）

from .log import *

# Custom settings

# from .scripts import *

from .constants import *

# 解决中文乱码问题
CRONTAB_COMMAND_PREFIX = 'LANG_ALL=zh_cn.UTF-8'
# 存放log的路径
CRONJOBS_DIR = "/root/SCH-FR-1/CRONJOBS/"
# Log文件名
CRONJOBS_FILE_NAME = "CRONJOBS.log"
# 添加定时任务(函数中的输出语句,是输出在.log文件中的)
CRONJOBS = (
    # 每分钟执行一次TestCrontab App中crontabFun的timedExecution函数，执行后将打印结果存储在log文件中
    #  '2>&1'每项工作执行后要做的事
    # 每小时进行一次日程通知
    ('00 */1 * * *', 'utils.timed_message.schedule_notify', '>>' + CRONJOBS_DIR + CRONJOBS_FILE_NAME + ' 2>&1'),  # 每整点执行一次
    # 每天十点进行一次航班通知
    ('00 22 * * *', 'utils.timed_message.flight_notify', '>>' + CRONJOBS_DIR + CRONJOBS_FILE_NAME + ' 2>&1'),  # 每天22点执行
    # * * * * *
    # 分钟(0-59) 小时(0-23) 每个月的哪一天(1-31) 月份(1-12) 周几(0-6)
)

CACHE_BACKEND = 'memcached://127.0.0.1:11211/'