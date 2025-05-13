from rest_framework import serializers
from .models import RemiseType, Configurer
from boutique.models import Boutique
import json
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from datetime import timedelta
import re
from rest_framework import serializers
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.urls import path
# myapp/serializers.py
from rest_framework import serializers
from users.models import User
from .models import Badge, ReferralRule, Discount, Notification
from users.models import Client


class RemiseTypeSerializer(serializers.ModelSerializer):
    type_remise_display = serializers.CharField(source='get_type_remise_display', read_only=True)
    boutique = serializers.PrimaryKeyRelatedField(queryset=Boutique.objects.all(), allow_null=True)
    
    class Meta:
        model = RemiseType
        fields = [
            'id',
            'boutique',
            'duree_plan_paiement',
            'type_remise',
            'type_remise_display',
            'nombre_tranches',
            'pourcentage_remise',
            'montant_max_remise',
            'date_creation',
        ]
    
    def validate(self, data):
        # Only enforce nombre_tranches requirement if type_remise is explicitly set to 'tranches'
        type_remise = data.get('type_remise', getattr(self.instance, 'type_remise', None) if self.instance else None)
        nombre_tranches = data.get('nombre_tranches', getattr(self.instance, 'nombre_tranches', None) if self.instance else None)
        
        if type_remise == 'tranches' and (nombre_tranches is None or nombre_tranches <= 0):
            raise serializers.ValidationError("Nombre de tranches must be a positive integer for type 'tranches'.")
        
        if not data.get('boutique') and not self.instance:
            raise serializers.ValidationError("Boutique is required for new remise types.")
        
        return data

    def update(self, instance, validated_data):
        # Prevent changing boutique during update
        validated_data.pop('boutique', None)
        return super().update(instance, validated_data)

class ConfigurerSerializer(serializers.ModelSerializer):
    boutique = serializers.PrimaryKeyRelatedField(queryset=Boutique.objects.all())
    parametre = serializers.JSONField()
    
    class Meta:
        model = Configurer
        fields = ['id', 'boutique', 'parametre', 'created_at', 'updated_at']
    
    def create(self, validated_data):
        parametre_data = validated_data.pop('parametre')
        parametre_json = json.dumps(parametre_data)
        configurer = Configurer.objects.create(parametre=parametre_json, **validated_data)
        return configurer
    
    def to_representation(self, instance):
        representation = super().to_representation(instance)
        try:
            representation['parametre'] = json.loads(instance.parametre)
        except json.JSONDecodeError:
            representation['parametre'] = {}
        return representation
from rest_framework import serializers
from cart.models import Order

class PaymentScheduleSerializer(serializers.Serializer):
    """
    Serializer pour les échéances de paiement, aligné avec l'interface PaymentData du frontend.
    Valide et formate les données des tranches sans dépendre d'un modèle Payment.
    """
    id = serializers.CharField(max_length=50)  # ex: "123-1" pour order_item_id-tranche
    order_id = serializers.IntegerField()
    order_item_id = serializers.IntegerField()
    remise_type_id = serializers.IntegerField()
    tranche = serializers.IntegerField(min_value=1)
    montant = serializers.CharField(max_length=20)  # ex: "250.00"
    montant_initial = serializers.CharField(max_length=20)  # ex: "250.00"
    date_ordre = serializers.CharField(max_length=50)  # Format ISO, ex: "2025-05-07T12:00:00Z"
    date_echeance = serializers.CharField(max_length=50)  # Format ISO pour la date d'échéance
    statut = serializers.CharField(max_length=20)  # ex: "payée", "en attente"
    statut_display = serializers.CharField(max_length=20)  # ex: "Payée", "En attente"
    type_remise = serializers.CharField(max_length=50)  # ex: "remise_par_tranches"
    type_remise_display = serializers.CharField(max_length=50)  # ex: "Remise par tranches"
    remise_appliquee = serializers.CharField(max_length=20)  # ex: "25.00"
    pourcentage_remise = serializers.CharField(max_length=20)  # ex: "10.00"
    montant_apres_remise = serializers.CharField(max_length=20)  # ex: "225.00"
    montant_paye = serializers.FloatField(min_value=0, allow_null=True)  # ex: 225.00 ou 0
    duree_plan_paiement = serializers.CharField(max_length=100, allow_blank=True)  # ex: "4 mois"

    def validate(self, data):
        """
        Valide les données de l'échéance pour garantir la cohérence.
        """
        try:
            montant = float(data['montant'])
            remise_appliquee = float(data['remise_appliquee'])
            montant_apres_remise = float(data['montant_apres_remise'])
            montant_paye = data['montant_paye'] or 0
            pourcentage_remise = float(data['pourcentage_remise'])
        except (ValueError, TypeError):
            raise serializers.ValidationError("Valeurs numériques invalides dans les données de paiement")

        # Vérifie que montant_apres_remise = montant - remise_appliquee
        if abs(montant - remise_appliquee - montant_apres_remise) > 0.01:
            raise serializers.ValidationError(
                "montant_apres_remise doit être égal à montant - remise_appliquee"
            )

        # Vérifie le pourcentage de remise
        expected_pourcentage = (remise_appliquee / montant * 100) if montant > 0 else 0
        if abs(pourcentage_remise - expected_pourcentage) > 0.01:
            raise serializers.ValidationError(
                "pourcentage_remise ne correspond pas à remise_appliquee / montant"
            )

        # Vérifie la cohérence de montant_paye avec le statut
        if data['statut'] == 'payée' and montant_paye <= 0:
            raise serializers.ValidationError(
                "montant_paye doit être supérieur à 0 pour le statut 'payée'"
            )
        if data['statut'] != 'payée' and montant_paye > 0:
            raise serializers.ValidationError(
                "montant_paye doit être 0 pour un statut autre que 'payée'"
            )

        return data

class OrderSerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = Order
        fields = ['id', 'status', 'status_display', 'total']


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'nom', 'prenom', 'email']

class BadgeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Badge
        fields = ['id', 'name', 'threshold', 'discount', 'icon', 'color']

    def validate_color(self, value):
        # Validate hex color code (e.g., #CD7F32)
        if not re.match(r'^#[0-9A-Fa-f]{6}$', value):
            raise serializers.ValidationError("Color must be a hex code (e.g., #CD7F32).")
        return value

    def validate_discount(self, value):
        # Ensure discount is a positive float
        value = float(value)  # Cast to float
        if value < 0:
            raise serializers.ValidationError("Discount must be non-negative.")
        return value

    
class ReferralRuleSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReferralRule
        fields = ['id', 'referrals_count', 'discount', 'timeFrame']

class DiscountSerializer(serializers.ModelSerializer):
    applied_at = serializers.DateTimeField(format='%Y-%m-%dT%H:%M:%S%z')

    class Meta:
        model = Discount
        fields = ['id', 'name', 'value', 'applied_at']

class NotificationSerializer(serializers.ModelSerializer):
    date = serializers.DateTimeField(format='%Y-%m-%dT%H:%M:%S%z')
    customer_id = serializers.CharField(source='client.user.id', allow_null=True)

    class Meta:
        model = Notification
        fields = ['id', 'title', 'message', 'type', 'is_read', 'date', 'customer_id']





class BadgeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Badge
        fields = ['id', 'name', 'discount', 'color', 'threshold']

class DiscountSerializer(serializers.ModelSerializer):
    appliedAt = serializers.DateTimeField(source='applied_at', format='%Y-%m-%dT%H:%M:%S%z')  # Mappage à appliedAt

    class Meta:
        model = Discount
        fields = ['id', 'name', 'value', 'appliedAt']

class ClientSerializer(serializers.ModelSerializer):
    nom = serializers.CharField(source='user.nom')
    email = serializers.EmailField(source='user.email')
    orders = serializers.IntegerField()
    referrals = serializers.IntegerField(source='nombre_clients_parraines')
    current_badge = BadgeSerializer(read_only=True, allow_null=True)
    id = serializers.CharField(source='user.id', read_only=True)
    appliedDiscounts = DiscountSerializer(many=True, read_only=True, source='applied_discounts')  # Utilisation de appliedDiscounts pour le frontend

    class Meta:
        model = Client
        fields = ['id', 'nom', 'email', 'orders', 'referrals', 'current_badge', 'appliedDiscounts']