# datadoit/settings.py
from datetime import timedelta
import os
from pathlib import Path
from decouple import config  # Add this import

BASE_DIR = Path(__file__).resolve().parent.parent

# Sécurité
SECRET_KEY = config('SECRET_KEY')  # Load from .env
DEBUG = config('DEBUG', default=False, cast=bool)  # Load DEBUG with boolean cast
ALLOWED_HOSTS = ['localhost', '127.0.0.1']

# Applications
INSTALLED_APPS = [
    'users',
    'boutique', 
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework_simplejwt.token_blacklist',
    'corsheaders',
    'rest_framework',
    'django_ratelimit',
    'channels',
    'chat',
    'config',
    'cart'
]

# Middleware
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'datadoit.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

ASGI_APPLICATION = 'datadoit.asgi.application'

# Base de données
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': config('DB_NAME'),
        'USER': config('DB_USER'),
        'PASSWORD': config('DB_PASSWORD'),
        'HOST': config('DB_HOST'),
        'PORT': config('DB_PORT'),
    }
}

# Auth
AUTH_USER_MODEL = 'users.User'

# REST Framework
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'users.authentication.JWTBearerAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.AllowAny',
    ),
}

# JWT
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(days=7),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'ALGORITHM': 'HS256',
    'SIGNING_KEY': config('JWT_SECRET_KEY'),  # Load from .env
    'AUTH_HEADER_TYPES': ('Bearer',),
}

# Internationalisation
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# Statics & Media
STATIC_URL = '/static/'
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

# CORS
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
 
    "http://localhost:5174",
  
]
CORS_ALLOW_CREDENTIALS = True
# Django settings.py
CSRF_COOKIE_SAMESITE = 'None'
CSRF_COOKIE_SECURE = True
SESSION_COOKIE_SAMESITE = 'None'
SESSION_COOKIE_SECURE = True
CORS_ALLOW_METHODS = [
    'GET',
    'POST',
    'PUT',
    'PATCH',
    'DELETE',
    'OPTIONS',
]
CORS_ALLOW_HEADERS = [
    'content-type',
    'authorization',
    'cache-control',
]

# Channel layers (WebSockets)
CHANNEL_LAYERS = {
    "default": {
        "BACKEND": "channels_redis.core.RedisChannelLayer",
        "CONFIG": {
            "hosts": [("127.0.0.1", 6379)],  # Redis server address
        },
    },
}

# Caches (Redis)
CACHES = {
    'default': {
        'BACKEND': 'django_redis.cache.RedisCache',
        'LOCATION': 'redis://127.0.0.1:6379/1',
        'OPTIONS': {
            'CLIENT_CLASS': 'django_redis.client.DefaultClient',
        }
    }
}

# Validation des mots de passe
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

# Champ ID par défaut
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Logging for debugging
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
            'formatter': 'verbose',
        },
    },
    'loggers': {
        '': {
            'handlers': ['console'],
            'level': 'DEBUG' if DEBUG else 'INFO',
            'propagate': True,
        },
    },
}
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = 'moezhchaichi2728@gmail.com'  # Your email address
EMAIL_HOST_PASSWORD = 'faqa uxtz vegm forg'  # App-specific password (not your regular password)
DEFAULT_FROM_EMAIL = 'moezhchaichi76@gmail.com'
