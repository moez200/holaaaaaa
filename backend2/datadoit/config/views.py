from datetime import datetime, timedelta, timezone
from decimal import Decimal
import re
from venv import logger

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from cart.models import Order, OrderItem
from .models import RemiseType
from .serializers import PaymentScheduleSerializer, RemiseTypeSerializer
from boutique.models import Boutique

from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from datetime import timedelta
import re

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.urls import path


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def remise_type_list_create(request):
    try:
        # Get the associated boutique
        boutique_id = None
        if hasattr(request.user, 'boutique'):
            boutique_id = request.user.boutique.id
        elif hasattr(request.user, 'marchand') and hasattr(request.user.marchand, 'boutique'):
            boutique_id = request.user.marchand.boutique.id
        else:
            boutique_id = request.query_params.get('boutique_id') or request.data.get('boutique')
        
        if not boutique_id:
            return Response(
                {'error': 'No boutique specified and user is not associated with any boutique'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            boutique = Boutique.objects.get(id=boutique_id)
            # Check if user has permission for this boutique
            if hasattr(request.user, 'marchand') and boutique.marchand != request.user.marchand:
                return Response(
                    {'error': 'You do not have permission for this boutique'},
                    status=status.HTTP_403_FORBIDDEN
                )
        except Boutique.DoesNotExist:
            return Response(
                {'error': 'Boutique not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        if request.method == 'GET':
            remise_types = RemiseType.objects.filter(boutique=boutique)
            serializer = RemiseTypeSerializer(remise_types, many=True)
            return Response(serializer.data)
        
        elif request.method == 'POST':
            data = request.data.copy()
            data['boutique'] = boutique_id
            serializer = RemiseTypeSerializer(data=data)
            if serializer.is_valid():
                remise_type = serializer.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def remise_type_detail(request, pk):
    try:
        remise_type = RemiseType.objects.get(pk=pk)
        
        # Get boutique from request or user
        boutique_id = request.data.get('boutique') or request.query_params.get('boutique_id')
        user_boutique = None
        
        # Case 1: User is a boutique
        if hasattr(request.user, 'boutique'):
            user_boutique = request.user.boutique
        # Case 2: User is a marchand with a boutique
        elif hasattr(request.user, 'marchand') and hasattr(request.user.marchand, 'boutique'):
            user_boutique = request.user.marchand.boutique
        # Case 3: Use provided boutique_id
        elif boutique_id:
            try:
                user_boutique = Boutique.objects.get(id=boutique_id)
            except Boutique.DoesNotExist:
                return Response(
                    {'error': 'Specified boutique not found'},
                    status=status.HTTP_404_NOT_FOUND
                )
        
        if not user_boutique:
            return Response(
                {'error': 'User is not associated with any boutique and no valid boutique ID provided'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Allow null boutique during transition period, but ensure permission
        if remise_type.boutique and remise_type.boutique != user_boutique:
            return Response(
                {'error': 'You do not have permission for this remise type'},
                status=status.HTTP_403_FORBIDDEN
            )

        if request.method == 'GET':
            serializer = RemiseTypeSerializer(remise_type)
            return Response(serializer.data)
        
        elif request.method == 'PUT':
            # Prevent modifying boutique
            data = request.data.copy()
            if 'boutique' in data:
                del data['boutique']
                
            serializer = RemiseTypeSerializer(remise_type, data=data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        elif request.method == 'DELETE':
            remise_type.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
            
    except RemiseType.DoesNotExist:
        return Response(
            {'error': 'Remise type not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from decimal import Decimal
from datetime import timedelta
from cart.models import  Order, OrderItem
from users.models import Client
from config.models import RemiseType
from .serializers import PaymentScheduleSerializer
import re

from django.shortcuts import get_object_or_404

from .serializers import PaymentScheduleSerializer, OrderSerializer
from decimal import Decimal
from datetime import timedelta

import re



def parse_duration(duration_str):
    """Parse duration string (e.g., '12 mois') into days."""
    if not duration_str:
        return 0
    match = re.match(r'(\d+)\s*(jour|mois|année)s?', duration_str.lower())
    if not match:
        return 0
    value, unit = int(match.group(1)), match.group(2)
    if unit == 'mois':
        return value * 30  # 1 month = 30 days
    elif unit == 'année':
        return value * 360  # 1 year = 360 days
    elif unit == 'jour':
        return value * 1  # 1 day = 1 day
    return 0





@api_view(['GET'])
@permission_classes([IsAuthenticated])
def payment_list(request, client_id, order_id):
    """
    Récupère dynamiquement les échéances de paiement pour une commande.
    Divise le montant total de la commande par le nombre de tranches.
    Divise la durée totale (duree_plan_paiement) par le nombre de tranches.
    Pour la 1ère tranche: date_echeance = now()
    Pour les tranches suivantes: date_echeance = now() + (tranche - 1) * (duration_days / nombre_tranches)
    Retourne les paiements, les totaux, et le statut de la commande.
    """
    try:
        user_id = request.user.id
        client = get_object_or_404(Client, user_id=client_id)
        if client.user_id != user_id:
            return Response(
                {'error': 'Unauthorized: You do not have access to this client’s data'},
                status=status.HTTP_403_FORBIDDEN
            )
        order = get_object_or_404(Order, id=order_id, client_id=client_id)
        order_items = OrderItem.objects.filter(order_id=order_id).select_related('produit__boutique')

        if not order_items.exists():
            return Response(
                {'error': 'No order items found for the specified order'},
                status=status.HTTP_404_NOT_FOUND
            )

        payments = []
        total_montant_initial = Decimal('0')
        total_remise = Decimal('0')
        total_apres_remise = Decimal('0')
        total_paye = Decimal('0')

        # Calculate total order amount
        for order_item in order_items:
            montant = Decimal(str(order_item.prix * order_item.quantite))
            total_montant_initial += montant

        # Get remise_type from the first order item's boutique (assuming single boutique)
        boutique_id = order_items.first().produit.boutique_id
        remise_type = RemiseType.objects.filter(boutique_id=boutique_id).first()
        if not remise_type:
            return Response(
                {'error': 'No discount type found for the boutique'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Calculate total discount
        pourcentage_remise = Decimal(str(remise_type.pourcentage_remise))
        remise_totale = (total_montant_initial * pourcentage_remise) / Decimal('100')
        if remise_type.montant_max_remise and remise_totale > Decimal(str(remise_type.montant_max_remise)):
            remise_totale = Decimal(str(remise_type.montant_max_remise))

        # Calculate amount after discount
        total_apres_remise = total_montant_initial - remise_totale

        # Divide into tranches
        nombre_tranches = remise_type.nombre_tranches or 1
        montant_par_tranche = total_apres_remise / Decimal(str(nombre_tranches))
        remise_par_tranche = remise_totale / Decimal(str(nombre_tranches))
        pourcentage_remise_tranche = (
            (remise_par_tranche / (montant_par_tranche + remise_par_tranche) * Decimal('100'))
            if (montant_par_tranche + remise_par_tranche) > 0 else Decimal('0')
        )

        # Calculate duration per tranche in days
        total_duration_days = parse_duration(remise_type.duree_plan_paiement)
        duration_per_tranche = total_duration_days / nombre_tranches if nombre_tranches > 1 else 0

        # Generate payment data for each tranche
        for i in range(1, nombre_tranches + 1):
            tranche_key = f"order-{order_id}-{i}"
            statut = order.paid_tranches.get(tranche_key, 'en_attente')
            montant_paye = float(montant_par_tranche) if statut == 'payée' else 0

            # Calculate date_echeance: now() + (tranche - 1) * (duration / nombre_tranches)
            date_echeance = datetime.now() + timedelta(days=(i - 1) * duration_per_tranche)

            payment_data = {
                'id': f"order-{order_id}-{i}",
                'order_id': order.id,
                'tranche': i,
                'montant': f"{montant_par_tranche:.2f}",
                'montant_initial': f"{(montant_par_tranche + remise_par_tranche):.2f}",
                'date_ordre': order.created_at.isoformat(),
                'date_echeance': date_echeance.isoformat(),
                'statut': statut,
                'statut_display': 'Payée' if statut == 'payée' else 'En attente',
                'type_remise': remise_type.type_remise,
                'type_remise_display': remise_type.get_type_remise_display(),
                'remise_appliquee': f"{remise_par_tranche:.2f}",
                'pourcentage_remise': f"{pourcentage_remise_tranche:.2f}",
                'montant_apres_remise': f"{montant_par_tranche:.2f}",
                'montant_paye': montant_paye,
                'duree_plan_paiement': remise_type.duree_plan_paiement or '',
            }
            payments.append(payment_data)
            total_remise += remise_par_tranche
            if statut == 'payée':
                total_paye += montant_par_tranche

        totals = {
            'total_montant_initial': f"{total_montant_initial:.2f}",
            'total_remise': f"{total_remise:.2f}",
            'total_apres_remise': f"{total_apres_remise:.2f}",
            'total_paye': f"{total_paye:.2f}",
        }

        return Response({
            'payments': payments,
            'totals': totals,
            'order_status': order.status,
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response(
            {'error': f'Erreur lors de la récupération des paiements: {str(e)}'},
            status=status.HTTP_400_BAD_REQUEST
        )

def parse_duration(duration_str):
    """Parse duration string (e.g., '3 months') to days."""
    if not duration_str:
        return 0
    try:
        value, unit = duration_str.split()
        value = int(value)
        if 'month' in unit.lower():
            return value * 30  # Approximate
        elif 'day' in unit.lower():
            return value
        return 0
    except (ValueError, AttributeError):
        return 0

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def pay_tranche(request, client_id, order_id):
    try:
        user_id = request.user.id
        client = get_object_or_404(Client, user_id=client_id)
        if client.user_id != user_id:
            return Response(
                {'error': 'Unauthorized: You do not have access to this client’s data'},
                status=status.HTTP_403_FORBIDDEN
            )
        order = get_object_or_404(Order, id=order_id, client_id=client_id)
        tranche = request.data.get('tranche')

        if not tranche or not isinstance(tranche, int) or tranche < 1:
            return Response(
                {'error': 'Invalid tranche number'},
                status=status.HTTP_400_BAD_REQUEST
            )

        order_items = OrderItem.objects.filter(order_id=order_id).select_related('produit__boutique')
        if not order_items.exists():
            return Response(
                {'error': 'No order items found for the specified order'},
                status=status.HTTP_404_NOT_FOUND
            )
        boutique_id = order_items.first().produit.boutique_id
        remise_type = RemiseType.objects.filter(boutique_id=boutique_id).first()
        if not remise_type:
            return Response(
                {'error': 'No discount type found for the boutique'},
                status=status.HTTP_400_BAD_REQUEST
            )

        nombre_tranches = remise_type.nombre_tranches or 1
        if tranche > nombre_tranches:
            return Response(
                {'error': f'Tranche {tranche} exceeds maximum tranches ({nombre_tranches})'},
                status=status.HTTP_400_BAD_REQUEST
            )

        tranche_key = f"order-{order_id}-{tranche}"
        if order.paid_tranches.get(tranche_key) == 'payée':
            return Response(
                {'error': 'Tranche already paid'},
                status=status.HTTP_409_CONFLICT
            )

        # Mark tranche as paid
        order.paid_tranches[tranche_key] = 'payée'
        order.save()

        # Recalculate totals
        total_montant_initial = Decimal('0')
        for order_item in order_items:
            montant = Decimal(str(order_item.prix * order_item.quantite))
            total_montant_initial += montant

        pourcentage_remise = Decimal(str(remise_type.pourcentage_remise))
        remise_totale = (total_montant_initial * pourcentage_remise) / Decimal('100')
        if remise_type.montant_max_remise and remise_totale > Decimal(str(remise_type.montant_max_remise)):
            remise_totale = Decimal(str(remise_type.montant_max_remise))

        total_apres_remise = total_montant_initial - remise_totale
        montant_par_tranche = total_apres_remise / Decimal(str(nombre_tranches))
        remise_par_tranche = remise_totale / Decimal(str(nombre_tranches))
        pourcentage_remise_tranche = (
            (remise_par_tranche / (montant_par_tranche + remise_par_tranche) * Decimal('100'))
            if (montant_par_tranche + remise_par_tranche) > 0 else Decimal('0')
        )

        total_duration_days = parse_duration(remise_type.duree_plan_paiement)
        duration_per_tranche = total_duration_days / nombre_tranches if nombre_tranches > 1 else 0
        date_echeance = datetime.now() + timedelta(days=(tranche - 1) * duration_per_tranche)

        payment_data = {
            'id': tranche_key,
            'order_id': order.id,
            'tranche': tranche,
            'montant': f"{montant_par_tranche:.2f}",
            'montant_initial': f"{(montant_par_tranche + remise_par_tranche):.2f}",
            'date_ordre': order.created_at.isoformat(),
            'date_echeance': date_echeance.isoformat(),
            'statut': 'payée',
            'statut_display': 'Payée',
            'type_remise': remise_type.type_remise,
            'type_remise_display': remise_type.get_type_remise_display(),
            'remise_appliquee': f"{remise_par_tranche:.2f}",
            'pourcentage_remise': f"{pourcentage_remise_tranche:.2f}",
            'montant_apres_remise': f"{montant_par_tranche:.2f}",
            'montant_paye': float(montant_par_tranche),
            'duree_plan_paiement': remise_type.duree_plan_paiement or '',
        }

        # Check if all tranches are paid
        all_paid = all(
            order.paid_tranches.get(f"order-{order_id}-{i}", 'en_attente') == 'payée'
            for i in range(1, nombre_tranches + 1)
        )
        if all_paid:
            order.status = 'payée'
            order.save()
            # Update Client orders and historique_achats
            client.orders += 1
            client.update_purchase_history(order)
            client.save()

        return Response(payment_data, status=status.HTTP_200_OK)

    except Exception as e:
        return Response(
            {'error': f'Erreur lors du paiement de la tranche: {str(e)}'},
            status=status.HTTP_400_BAD_REQUEST
        )

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def pay_total(request, client_id, order_id):
    try:
        user_id = request.user.id
        client = get_object_or_404(Client, user_id=client_id)
        if client.user_id != user_id:
            return Response(
                {'error': 'Unauthorized: You do not have access to this client’s data'},
                status=status.HTTP_403_FORBIDDEN
            )
        order = get_object_or_404(Order, id=order_id, client_id=client_id)
        order_items = OrderItem.objects.filter(order_id=order_id).select_related('produit__boutique')

        if not order_items.exists():
            return Response(
                {'error': 'No order items found for the specified order'},
                status=status.HTTP_404_NOT_FOUND
            )

        boutique_id = order_items.first().produit.boutique_id
        remise_type = RemiseType.objects.filter(boutique_id=boutique_id).first()
        if not remise_type:
            return Response(
                {'error': 'No discount type found for the boutique'},
                status=status.HTTP_400_BAD_REQUEST
            )

        nombre_tranches = remise_type.nombre_tranches or 1
        all_paid = all(
            order.paid_tranches.get(f"order-{order_id}-{i}", 'en_attente') == 'payée'
            for i in range(1, nombre_tranches + 1)
        )
        if all_paid:
            return Response(
                {'error': 'Order already fully paid'},
                status=status.HTTP_409_CONFLICT
            )

        # Mark all tranches as paid
        for i in range(1, nombre_tranches + 1):
            tranche_key = f"order-{order_id}-{i}"
            order.paid_tranches[tranche_key] = 'payée'

        order.status = 'payée'
        order.save()

        # Update Client orders and historique_achats
        client.orders += 1
        client.update_purchase_history(order)
        client.save()

        return Response({'message': 'All tranches paid successfully'}, status=status.HTTP_200_OK)

    except Exception as e:
        return Response(
            {'error': f'Erreur lors du paiement total: {str(e)}'},
            status=status.HTTP_400_BAD_REQUEST
        )
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from config.models import Badge, ReferralRule, Notification  # Import models
from users.models import Client  # Import Client (adjust if in another app)
from .serializers import ClientSerializer, BadgeSerializer, ReferralRuleSerializer, NotificationSerializer

# --- Badge API ---

@api_view(['GET', 'POST'])
def badge_list_create(request):
    if request.method == 'GET':
        badges = Badge.objects.all()  # Use model class
        serializer = BadgeSerializer(badges, many=True)
        return Response(serializer.data)
    elif request.method == 'POST':
        serializer = BadgeSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'DELETE'])
def badge_detail(request, pk):
    try:
        badge = Badge.objects.get(pk=pk)
    except Badge.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = BadgeSerializer(badge)
        return Response(serializer.data)
    elif request.method == 'PUT':
        serializer = BadgeSerializer(badge, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    elif request.method == 'DELETE':
        badge.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

# --- Referral Rule API ---

@api_view(['GET', 'POST'])
def referral_list_create(request):
    if request.method == 'GET':
        referrals = ReferralRule.objects.all()
        serializer = ReferralRuleSerializer(referrals, many=True)
        return Response(serializer.data)
    elif request.method == 'POST':
        serializer = ReferralRuleSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'DELETE'])
def referral_detail(request, pk):
    try:
        referral = ReferralRule.objects.get(pk=pk)
    except ReferralRule.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = ReferralRuleSerializer(referral)
        return Response(serializer.data)
    elif request.method == 'PUT':
        serializer = ReferralRuleSerializer(referral, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    elif request.method == 'DELETE':
        referral.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

# --- Client API (read-only) ---

@api_view(['GET'])
def client_list(request):
    clients = Client.objects.all()
    serializer = ClientSerializer(clients, many=True)
    print('serilizers',serializer.data)
    return Response(serializer.data)

@api_view(['GET'])
def client_detail(request, pk):
    try:
        client = Client.objects.get(pk=pk)
    except Client.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    serializer = ClientSerializer(client)
    return Response(serializer.data)

# --- Notification API ---

@api_view(['GET', 'POST'])
def notification_list_create(request):
    if request.method == 'GET':
        notifications = Notification.objects.all()
        serializer = NotificationSerializer(notifications, many=True)
        return Response(serializer.data)
    elif request.method == 'POST':
        serializer = NotificationSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'DELETE'])
def notification_detail(request, pk):
    try:
        notification = Notification.objects.get(pk=pk)
    except Notification.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = NotificationSerializer(notification)
        return Response(serializer.data)
    elif request.method == 'PUT':
        serializer = NotificationSerializer(notification, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    elif request.method == 'DELETE':
        notification.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

@api_view(['PATCH'])
def mark_notification_as_read(request, pk):
    try:
        notification = Notification.objects.get(pk=pk)
    except Notification.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    notification.is_read = True
    notification.save()
    return Response(status=status.HTTP_204_NO_CONTENT)

@api_view(['PATCH'])
def mark_all_notifications_as_read(request):
    Notification.objects.all().update(is_read=True)
    return Response(status=status.HTTP_204_NO_CONTENT)