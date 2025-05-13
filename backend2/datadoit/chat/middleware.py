import jwt
from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.models import AnonymousUser
from channels.db import database_sync_to_async
from urllib.parse import parse_qs
import logging

logger = logging.getLogger(__name__)
User = get_user_model()

@database_sync_to_async
def get_user_from_jwt(token):
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        logger.debug(f"JWT payload: {payload}")
        user = User.objects.get(id=payload["user_id"])
        logger.info(f"User found: {user.email}")
        return user
    except jwt.ExpiredSignatureError:
        logger.error("Token has expired")
        return None
    except jwt.DecodeError as e:
        logger.error(f"Token decode error: {e}")
        return None
    except User.DoesNotExist:
        logger.error(f"User with id {payload.get('user_id')} does not exist")
        return None
    except Exception as e:
        logger.error(f"Unexpected error in get_user_from_jwt: {e}")
        return None

class JWTAuthMiddleware:
    def __init__(self, inner):
        self.inner = inner

    async def __call__(self, scope, receive, send):
        token = None
        headers = dict(scope.get("headers", []))
        
        # Extract token from Authorization header
        if b"authorization" in headers:
            auth_header = headers[b"authorization"].decode("utf-8")
            if auth_header.startswith("Bearer "):
                token = auth_header.split(" ")[1]
                logger.info(f"Token extracted from header: {token}")
        
        # Extract token from query parameters
        if not token:
            query_string = scope.get("query_string", b"").decode()
            query_params = parse_qs(query_string)
            token = query_params.get("token", [None])[0]
            logger.info(f"Token extracted from query params: {token}")

        # Authenticate user
        if token:
            scope["user"] = await get_user_from_jwt(token)
            logger.info(f"User authenticated: {scope['user']}")
        else:
            scope["user"] = AnonymousUser()
            logger.warning("No token provided, using AnonymousUser")

        return await self.inner(scope, receive, send)