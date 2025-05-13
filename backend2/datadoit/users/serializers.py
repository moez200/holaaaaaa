from rest_framework import serializers
from boutique.models import Boutique
from users.models import Admin, User, Client, Marchand
from django.contrib.auth import authenticate
from django.db import IntegrityError, transaction

from django.contrib.auth import get_user_model



User = get_user_model()





class UserSerializer(serializers.ModelSerializer):
    solde_points = serializers.IntegerField(source='client_profile.solde_points', read_only=True, required=False)
    historique_achats = serializers.CharField(source='client_profile.historique_achats', read_only=True, required=False)
    referral_code = serializers.CharField(source='client_profile.referral_code', read_only=True, required=False)
    nombre_clients_parraines = serializers.IntegerField(source='client_profile.nombre_clients_parraines', read_only=True, required=False)
    has_boutique = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = User
        fields = [
            'id', 'email', 'nom', 'prenom','avatar' ,'telephone', 'adresse','role',
            'is_active', 'is_approved', 'is_staff', 'created_at', 'updated_at',
            'solde_points', 'historique_achats', 'referral_code', 'nombre_clients_parraines',
            'has_boutique'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'is_staff', 'is_approved']

    def get_has_boutique(self, obj):
        if obj.role.lower() == 'marchand' and hasattr(obj, 'marchand_profile'):
            return Boutique.objects.filter(marchand=obj.marchand_profile).exists()
        return False

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        if instance.role.lower() != 'client':
            representation.pop('solde_points', None)
            representation.pop('historique_achats', None)
            representation.pop('referral_code', None)
            representation.pop('nombre_clients_parraines', None)
        if instance.role.lower() != 'marchand':
            representation.pop('has_boutique', None)
        return representation

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        user = authenticate(email=data['email'], password=data['password'])
        if user and user.is_active:
            return {'user': user}
        raise serializers.ValidationError('Invalid credentials')
from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Client, Marchand, Admin
import logging

logger = logging.getLogger(__name__)
User = get_user_model()

class ClientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Client
        fields = ['solde_points', 'historique_achats', 'referral_code', 'nombre_clients_parraines']
        extra_kwargs = {
            'solde_points': {'default': 0, 'allow_null': True, 'required': False},
            'historique_achats': {'allow_blank': True, 'allow_null': True, 'required': False},
            'referral_code': {'read_only': True},
            'nombre_clients_parraines': {'read_only': True},
        }

class MarchandSerializer(serializers.ModelSerializer):
    is_marchant = serializers.BooleanField(default=True, write_only=True)
    
    class Meta:
        model = Marchand
        fields = ['is_marchant']
        extra_kwargs = {
            'is_marchant': {'required': False}
        }

class AdminSerializer(serializers.ModelSerializer):
    class Meta:
        model = Admin
        fields = []
class SignupSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True)
    referral_code = serializers.CharField(required=False, allow_blank=True, allow_null=True)

    class Meta:
        model = User
        fields = [
            'email', 'nom', 'prenom', 'telephone', 'adresse', 'role',
            'password', 'confirm_password', 'referral_code'
        ]

    def validate(self, data):
        if data['password'] != data['confirm_password']:
            raise serializers.ValidationError({"confirm_password": "Les mots de passe ne correspondent pas."})

        if User.objects.filter(email=data['email'].lower()).exists():
            raise serializers.ValidationError({"email": "Cet email est déjà utilisé."})

        referral_code = data.get('referral_code')
        if referral_code:
            try:
                Client.objects.get(referral_code=referral_code)
            except Client.DoesNotExist:
                raise serializers.ValidationError({"referral_code": "Code de parrainage invalide."})

        return data

    @transaction.atomic
    def create(self, validated_data):
        try:
            logger.info(f"Données validées pour création: {validated_data}")
            role = validated_data.pop('role', 'client')
            validated_data.pop('confirm_password')
            referral_code = validated_data.pop('referral_code', None)
            validated_data['email'] = validated_data['email'].lower()
            validated_data['role'] = role

            # Vérification des champs requis
            required_fields = ['email', 'nom', 'prenom', 'telephone']
            for field in required_fields:
                if not validated_data.get(field):
                    raise serializers.ValidationError({field: f"Le champ {field} est requis."})

            # Création de l'utilisateur
            user = User.objects.create_user(**validated_data)
            logger.info(f"Utilisateur créé: {user.email}, role: {role}")

            # Gestion du code de parrainage
            if role == 'client' and referral_code:
                logger.info(f"Traitement du referral_code: {referral_code}")
                try:
                    with transaction.atomic():
                        referrer = Client.objects.select_for_update().get(referral_code=referral_code)
                        logger.info(f"Référent trouvé: {referrer.user_id}, nombre_clients_parraines avant: {referrer.nombre_clients_parraines}")
                        referrer.nombre_clients_parraines += 1
                        referrer.save()
                        logger.info(f"Référent sauvegardé, nombre_clients_parraines après: {referrer.nombre_clients_parraines}")
                        # Appliquer les réductions pour toutes les règles de parrainage
                        from .models import ReferralRule
                        for rule in ReferralRule.objects.all():
                            logger.info(f"Vérification de la règle: {rule.referrals_count} referrals")
                            referrer.apply_referral_discount(rule)
                except Client.DoesNotExist:
                    logger.error(f"Code de parrainage invalide: {referral_code}")
                    raise serializers.ValidationError({"referral_code": "Code de parrainage invalide."})

            user.refresh_from_db()
            return user

        except IntegrityError as e:
            logger.error(f"IntegrityError lors de la création: {str(e)}")
            raise serializers.ValidationError({
                'error': 'Erreur lors de la création du compte. Vérifiez les données fournies.'
            })
        except Exception as e:
            logger.error(f"Erreur inattendue lors de la création: {str(e)}", exc_info=True)
            raise serializers.ValidationError({
                'error': f'Une erreur inattendue est survenue: {str(e)}'
            })
class UserUpdateSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(required=False)
    password = serializers.CharField(write_only=True, required=False, min_length=8)
    solde_points = serializers.IntegerField(required=False)
    historique_achats = serializers.CharField(allow_blank=True, allow_null=True, required=False)
   
    description = serializers.CharField(required=False)

    class Meta:
        model = User
        fields = [
            'email', 'nom', 'prenom', 'telephone', 'password',
            'solde_points', 'historique_achats', 'description'
        ]
        read_only_fields = ['role']

    def validate(self, data):
        if self.instance.role == 'Client':
            if  'description' in data:
                raise serializers.ValidationError({"non_field_errors": "Client cannot update marchand-specific fields."})
        elif self.instance.role == 'Marchand':
            if 'solde_points' in data or 'historique_achats' in data:
                raise serializers.ValidationError({"non_field_errors": "Marchand cannot update client-specific fields."})
        elif self.instance.role == 'Admin':
            if any(key in data for key in ['solde_points', 'historique_achats',  'description']):
                raise serializers.ValidationError({"non_field_errors": "Admin cannot update client or marchand-specific fields."})
        return data

    def validate_email(self, value):
        if User.objects.filter(email=value).exclude(id=self.instance.id).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        
        if instance.role == 'Client':
            client = instance.client
            client.solde_points = validated_data.pop('solde_points', client.solde_points)
            client.historique_achats = validated_data.pop('historique_achats', client.historique_achats)
            client.save()
        elif instance.role == 'Marchand':
            marchand = instance.marchand
           
            marchand.description = validated_data.pop('description', marchand.description)
            marchand.save()

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()
        return instance
    
    