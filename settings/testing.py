# -*- coding: utf-8 -*-

# Do this here, so that .env get loaded while running `py.test` from shell
from dotenv import load_dotenv, find_dotenv
load_dotenv(find_dotenv())

from .development import *  # noqa F405

MEDIA_ROOT = "/tmp"

SECRET_KEY = 'top-scret!'

EMAIL_BACKEND = "django.core.mail.backends.locmem.EmailBackend"
INSTALLED_APPS += ("tests", )  # noqa: F405
