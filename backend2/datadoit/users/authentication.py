# users/authentication.py
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
import rest_framework_simplejwt
from rest_framework_simplejwt.tokens import AccessToken
import jwt
from users.models import User
import logging

logger = logging.getLogger(__name__)

class JWTBearerAuthentication(BaseAuthentication):
    def authenticate(self, request):
        auth_header = request.headers.get('Authorization')
        
        if not auth_header or not auth_header.startswith('Bearer '):
            return None
        
        try:
            access_token = auth_header.split(' ')[1]
            if not access_token:
                logger.warning("Empty token provided in Authorization header")
                raise AuthenticationFailed('No token provided')
            
            # Basic JWT format check
            if len(access_token.split('.')) != 3:
                logger.warning(f"Malformed token: {access_token[:10]}... (truncated)")
                raise AuthenticationFailed('Invalid token format')
            
            payload = AccessToken(access_token)
            user_id = payload['user_id']
            
            try:
                user = User.objects.get(id=user_id, is_active=True)
            except User.DoesNotExist:
                logger.warning(f"User not found or inactive: user_id={user_id}")
                raise AuthenticationFailed('User not found or inactive')
                
            return (user, access_token)
        except jwt.ExpiredSignatureError:
            logger.warning("Expired access token")
            raise AuthenticationFailed('Access token expired')
        except (jwt.InvalidTokenError, rest_framework_simplejwt.exceptions.TokenError) as e:
            logger.warning(f"Invalid token: {str(e)}")
            raise AuthenticationFailed('Invalid access token')
        except IndexError:
            logger.warning("Malformed Authorization header")
            raise AuthenticationFailed('Malformed Authorization header')
        
    def authenticate_header(self, request):
        return 'Bearer'
    
    @staticmethod
    def generate_tokens_for_user(user):
        from rest_framework_simplejwt.tokens import RefreshToken
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)
        refresh_token = str(refresh)
        return access_token, refresh_token