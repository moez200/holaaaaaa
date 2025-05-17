import json
import logging
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import get_user_model
from .models import Comment
from django.core.mail import send_mail
from django.core.cache import cache
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from datadoit import settings
from users.authentication import JWTBearerAuthentication
from users.serializers import LoginSerializer, UserSerializer, SignupSerializer, UserUpdateSerializer
from users.models import Client, Comment, Marchand, User
from django.core.files.storage import default_storage
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.core.exceptions import PermissionDenied
from django.shortcuts import get_object_or_404
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from .serializers import LoginSerializer, UserSerializer
from .authentication import JWTBearerAuthentication
from django.db.models import Count, Avg
from rest_framework.permissions import IsAdminUser
logger = logging.getLogger(__name__)
@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    serializer = LoginSerializer(data=request.data, context={'request': request})
    serializer.is_valid(raise_exception=True)
    
    user = serializer.validated_data['user']
    
    # Vérification selon le rôle
    if user.role == 'marchand':
        if not user.is_approved:
            return Response({
                'detail': 'Votre compte marchand n\'est pas encore approuvé.'
            }, status=status.HTTP_403_FORBIDDEN)
    elif user.role == 'client':
        pass  # Pas besoin d'approuver
    elif user.role == 'admin':
        pass  # Si tu veux ajouter des vérifications ou actions spécifiques pour un admin
    else:
        return Response({
            'detail': 'Rôle non autorisé.'
        }, status=status.HTTP_403_FORBIDDEN)

    # Génération des tokens
    access_token, refresh_token = JWTBearerAuthentication.generate_tokens_for_user(user)

    return Response({
        'user': UserSerializer(user).data,
        'access_token': access_token,
        'refresh_token': refresh_token
    }, status=status.HTTP_200_OK)

from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from .serializers import SignupSerializer
from rest_framework.permissions import AllowAny
import logging

logger = logging.getLogger(__name__)

@api_view(['POST'])
@permission_classes([AllowAny])
def signup(request):
    try:
        serializer = SignupSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({
                'success': True,
                'message': 'Inscription réussie',
                'user': {
                    'email': user.email,
                    'role': user.role
                }
            }, status=status.HTTP_201_CREATED)
        
        return Response({
            'success': False,
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
        
    except Exception as e:
        logger.error(f"Signup error: {str(e)}")
        return Response({
            'success': False,
            'error': "Une erreur est survenue lors de l'inscription"
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_detail_view(request):
    user = request.user
    serializer = UserSerializer(user)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_list_view(request):
    if request.user.role != 'admin':
        raise PermissionDenied("Only admins can list all users.")
    users = User.objects.all()
    serializer = UserSerializer(users, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])

def user_update_view(request, user_id):
    if request.user.role != 'admin':
        raise PermissionDenied("Only admins can update other users.")
    
    user = get_object_or_404(User, id=user_id)
    serializer = UserUpdateSerializer(user, data=request.data, partial=True)
    serializer.is_valid(raise_exception=True)
    updated_user = serializer.save()
    return Response(UserSerializer(updated_user).data, status=status.HTTP_200_OK)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])

def user_delete_view(request, user_id):
    if request.user.role != 'admin':
        raise PermissionDenied("Only admins can delete other users.")
    
    user = get_object_or_404(User, id=user_id)
    if user.role == 'admin':
        raise PermissionDenied("Cannot delete admin accounts.")
    user.delete()
    return Response({"message": "User deleted successfully."}, status=status.HTTP_204_NO_CONTENT)
@api_view(['POST'])
def approve_user(request, user_id):
    user = get_object_or_404(User, id=user_id)
    
    if user.is_approved:
        return Response({'detail': 'Utilisateur déjà approuvé.'}, status=status.HTTP_400_BAD_REQUEST)
    
    user.is_approved = True
    user.save()
    
    # Send approval email
    subject = 'Votre compte a été approuvé'
    message = f'Bonjour  {user.nom},\n\nVotre compte a été approuvé avec succès. Vous pouvez maintenant accéder à toutes les fonctionnalités de notre plateforme.\n\nCordialement,\nL\'équipe'
    from_email = 'moezhchaichai2728@gmail.com'  # Should match DEFAULT_FROM_EMAIL
    recipient_list = [user.email]
    
    try:
        send_mail(
            subject,
            message,
            from_email,
            recipient_list,
            fail_silently=False,
        )
    except Exception as e:
        return Response({'detail': f'Erreur lors de l\'envoi de l\'email: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    return Response({'detail': 'Utilisateur approuvé avec succès.'}, status=status.HTTP_200_OK)

@api_view(['POST'])
def refuse_user(request, user_id):
    user = get_object_or_404(User, id=user_id)
    
    if not user.is_approved:
        return Response({'detail': 'Utilisateur déjà refusé ou non approuvé.'}, status=status.HTTP_400_BAD_REQUEST)
    
    user.is_approved = False
    user.save()
    
    # Send rejection email
    subject = 'Mise à jour du statut de votre compte'
    message = f'Bonjour {user.nom},\n\nNous sommes désolés de vous informer que votre demande d\'approbation a été refusée. Pour plus d\'informations, veuillez nous contacter.\n\nCordialement,\nL\'équipe'
    from_email = 'moezhchaichai2728@gmail.com'  # Should match DEFAULT_FROM_EMAIL
    recipient_list = [user.email]
    
    try:
        send_mail(
            subject,
            message,
            from_email,
            recipient_list,
            fail_silently=False,
        )
    except Exception as e:
        return Response({'detail': f'Erreur lors de l\'envoi de l\'email: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    return Response({'detail': 'Utilisateur refusé avec succès.'}, status=status.HTTP_200_OK)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_profile(request):
    user = request.user
    data = request.data

    # Mettre à jour les champs
    user.nom = data.get('nom', user.nom)
    user.prenom = data.get('prenom', user.prenom)
    user.email = data.get('email', user.email)
    user.telephone = data.get('telephone', user.telephone)

    try:
        user.save()
        return Response({
            'id': user.id,
            'nom': user.nom,
            'prenom': user.prenom,
            'email': user.email,
            'telephone': user.telephone,
            'role': user.role if hasattr(user, 'role') else 'client',
            'avatar': user.avatar.url if user.avatar else None,
        }, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'message': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_avatar(request):
    user = request.user
    if 'avatar' not in request.FILES:
        return Response({'message': 'Aucune image fournie'}, status=status.HTTP_400_BAD_REQUEST)

    avatar = request.FILES['avatar']
    # Vérifier le type de fichier
    if not avatar.content_type.startswith('image/'):
        return Response({'message': 'Fichier non valide. Veuillez uploader une image.'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Vérifier la taille (5 Mo max)
    if avatar.size > 5 * 1024 * 1024:
        return Response({'message': 'L\'image ne doit pas dépasser 5 Mo.'}, status=status.HTTP_400_BAD_REQUEST)

    # Sauvegarder l'image
    file_path = f"avatars/{user.id}_{avatar.name}"
    default_storage.save(file_path, avatar)
    user.avatar = file_path
    user.save()

    return Response({
        'avatar_url': f"{settings.MEDIA_URL}{file_path}"
    }, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_purchase_history(request):
    try:
        client = Client.objects.get(user=request.user)
        history = json.loads(client.historique_achats or '{"orders": []}')
        if not isinstance(history, dict) or 'orders' not in history:
            history = {'orders': []}
        return Response(history, status=status.HTTP_200_OK)
    except Client.DoesNotExist:
        return Response({'message': 'Profil client non trouvé.'}, status=status.HTTP_404_NOT_FOUND)
    except json.JSONDecodeError:
        return Response({'message': 'Erreur de format dans l\'historique des achats.'}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({'message': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Count, Avg
from django.conf import settings
from users.models import Marchand

@api_view(['GET'])
def top_marchand(request):
    try:
        # Annoter chaque marchand avec nb de produits et moyenne des notes
        marchands = Marchand.objects.annotate(
            product_count=Count('produits'),
            avg_rating=Avg('produits__average_rating')
        ).filter(product_count__gt=0)  # Ignorer ceux sans produits

        if not marchands.exists():
            return Response({'message': 'Aucun marchand avec des produits trouvé'}, status=status.HTTP_404_NOT_FOUND)

        # Choisir le marchand avec le plus de produits et la meilleure note
        top_marchand = max(
            marchands,
            key=lambda m: (m.product_count, m.avg_rating or 0.0)
        )

        # Récupérer la première boutique associée
        boutique = top_marchand.boutiques.first()
        if not boutique:
            return Response({'message': 'Aucune boutique associée au marchand'}, status=status.HTTP_404_NOT_FOUND)

        # Construire la réponse
        data = {
            'id': str(top_marchand.user_id),
            'name': top_marchand.marchand_name,
            'logo': request.build_absolute_uri(boutique.logo.url) if boutique.logo else None,
            'description': boutique.description or '',
            'average_rating': top_marchand.avg_rating,
            'products_count': top_marchand.product_count,
            'est_nouveau': top_marchand.est_nouveau,
        }

        return Response(data, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)




@api_view(['GET', 'POST'])
def comment_list(request):
    if request.method == 'GET':
        try:
            user_id = request.query_params.get('user_id')
            comments = Comment.objects.select_related('user')

            if user_id:
                # Si user_id est fourni, retourner les commentaires de cet utilisateur
                comments = comments.filter(user_id=user_id)
                data = [{
                    'id': str(comment.id),
                    'user_id': str(comment.user_id),
                    'user_name': f"{comment.user.prenom} {comment.user.nom}",
                    'avatar': request.build_absolute_uri(comment.user.avatar.url) if comment.user.avatar else 'https://via.placeholder.com/150',
                    'content': comment.content,
                    'created_at': comment.created_at.isoformat(),
                } for comment in comments]
                return Response(data, status=status.HTTP_200_OK)

            # Si pas de user_id, retourner les 4 commentaires les plus récents
            comments = comments.order_by('-created_at')[:4]
            data = [{
                'id': str(comment.id),
                'user_id': str(comment.user_id),
                'user_name': f"{comment.user.prenom} {comment.user.nom}",
                'avatar': request.build_absolute_uri(comment.user.avatar.url) if comment.user.avatar else 'https://via.placeholder.com/150',
                'content': comment.content,
                'created_at': comment.created_at.isoformat(),
            } for comment in comments]
            return Response(data, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
