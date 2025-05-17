import datetime
from decimal import Decimal
import logging
from rest_framework.decorators import api_view, permission_classes,authentication_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.core.exceptions import ObjectDoesNotExist
from django.core.paginator import Paginator
from users.authentication import JWTBearerAuthentication
from boutique.models import  Produit
from cart.models import  LignePanier, Order, OrderItem, Panier
from users.models import Client, User
from .serializers import NotificationSerializer, OrderSerializer, PanierSerializer, LignePanierSerializer, RevenueOverviewSerializer, StatsSerializer, UserGrowthSerializer, UserSerializer, WriteOrderSerializer
from django.db.models import Q
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated,AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.core.exceptions import ObjectDoesNotExist
from boutique.models import Produit
from cart.models import Panier, LignePanier
from users.models import Client
import logging

logger = logging.getLogger(__name__)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_to_cart(request):
    data = request.data
    client_id = data.get('client_id')
    produit_id = data.get('produit_id')
    quantite = int(data.get('quantite', 1))

    # Validate required fields
    if not client_id or not produit_id:
        return Response(
            {"error": "client_id and produit_id are required"},
            status=status.HTTP_400_BAD_REQUEST
        )

    if quantite <= 0:
        return Response(
            {"error": "Quantity must be positive"},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Validate client
    try:
        client = Client.objects.get(user_id=client_id, user=request.user)
    except Client.DoesNotExist:
        logger.error(f"Client not found for client_id: {client_id}, user: {request.user}")
        return Response(
            {"error": "Client not found or unauthorized"},
            status=status.HTTP_404_NOT_FOUND
        )

    # Validate produit
    try:
        produit_id = int(produit_id)  # Ensure produit_id is an integer
        produit = Produit.objects.get(id=produit_id)
        if not produit.en_stock or produit.stock < quantite:
            return Response(
                {
                    "error": f"Stock insuffisant pour {produit.nom} (stock disponible: {produit.stock})"
                },
                status=status.HTTP_400_BAD_REQUEST
            )
    except ValueError:
        logger.error(f"Invalid produit_id: {produit_id}")
        return Response(
            {"error": "Invalid produit_id, must be a number"},
            status=status.HTTP_400_BAD_REQUEST
        )
    except Produit.DoesNotExist:
        logger.error(f"Produit not found for produit_id: {produit_id}")
        return Response(
            {"error": "Produit not found"},
            status=status.HTTP_404_NOT_FOUND
        )

    # Get or create Panier
    try:
        panier, _ = Panier.objects.get_or_create(client=client)
    except Panier.MultipleObjectsReturned:
        logger.warning(f"Multiple Paniers found for client_id: {client_id}, using first")
        panier = Panier.objects.filter(client=client).first()

    # Update or create LignePanier
    try:
        ligne_panier = LignePanier.objects.get(panier=panier, produit=produit)
        ligne_panier.quantite += quantite
        ligne_panier.save()
        logger.debug(f"Updated LignePanier for produit: {produit.nom}, quantite: {ligne_panier.quantite}")
    except LignePanier.DoesNotExist:
        ligne_panier = LignePanier.objects.create(
            panier=panier,
            produit=produit,
            quantite=quantite
        )
        logger.debug(f"Created LignePanier for produit: {produit.nom}, quantite: {quantite}")

    serializer = LignePanierSerializer(ligne_panier, context={'request': request})
    panier_serializer = PanierSerializer(panier, context={'request': request})
    return Response(
        {
            "ligne_panier": serializer.data,
            "panier": panier_serializer.data
        },
        status=status.HTTP_201_CREATED
    )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_cart(request, client_id):
    logger.info(f"Authenticated user: {request.user}, client_id: {client_id}")
    try:
        client = Client.objects.get(user_id=client_id, user=request.user)
        try:
            panier = Panier.objects.get(client=client)
        except Panier.DoesNotExist:
            panier = Panier.objects.create(client=client)
        serializer = PanierSerializer(panier)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Client.DoesNotExist:
        logger.error(f"Client not found for user_id: {client_id}")
        return Response({"error": "Client not found"}, status=status.HTTP_404_NOT_FOUND)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def remove_from_cart(request, ligne_panier_id):
    try:
        ligne_panier = LignePanier.objects.get(pk=ligne_panier_id, panier__client__user=request.user)
        ligne_panier.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    except LignePanier.DoesNotExist:
        return Response({"error": "Ligne de panier not found"}, status=status.HTTP_404_NOT_FOUND)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_cart_quantity(request,  ligne_panier_id):
    try:
        ligne_panier = LignePanier.objects.get(pk= ligne_panier_id, panier__client__user=request.user)
        quantite = request.data.get('quantite')
        if quantite is None or int(quantite) <= 0:
            return Response({"error": "Quantité invalide"}, status=status.HTTP_400_BAD_REQUEST)
        ligne_panier.quantite = int(quantite)
        ligne_panier.save()
        serializer = LignePanierSerializer(ligne_panier)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except LignePanier.DoesNotExist:
        return Response({"error": "Ligne de panier not found"}, status=status.HTTP_404_NOT_FOUND)
logger = logging.getLogger(__name__)
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import NotificationMarchand, Order, Client, Produit, OrderItem
from decimal import Decimal
import logging

logger = logging.getLogger(__name__)

@api_view(['POST'])
@permission_classes([IsAuthenticated]) 
def checkout(request):
    try:
        user = request.user
        data = request.data
        logger.debug(f"Checkout request by user: {user.nom}, user_id: {user.id}")

        # Fetch the Client instance for the user
        try:
            client = Client.objects.get(user=user)
        except Client.DoesNotExist:
            logger.warning(f"No Client instance found for user: {user.id}")
            return Response(
                {"detail": "No Client profile associated with this user"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Validate payload
        required_fields = ['shipping_info', 'items', 'total']
        if not all(field in data for field in required_fields):
            logger.warning("Missing required fields in payload")
            return Response(
                {"detail": "Missing required fields"},
                status=status.HTTP_400_BAD_REQUEST
            )

        shipping_info = data['shipping_info']
        required_shipping_fields = ['firstName', 'lastName', 'email', 'telephone', 'adresse']
        if not all(field in shipping_info for field in required_shipping_fields):
            logger.warning("Missing required shipping fields")
            return Response(
                {"detail": "Missing required shipping fields"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Create order with Client instance
        order = Order.objects.create(
            client=client,  # Use Client instance
            total=Decimal(data['total']),
            first_name=shipping_info['firstName'],
            last_name=shipping_info['lastName'],
            email=shipping_info['email'],
            telephone=shipping_info['telephone'],
            adresse=shipping_info['adresse'],
        )

        # Create order items
        for item in data['items']:
            product = Produit.objects.get(id=item['produit_id'])
            OrderItem.objects.create(
                order=order,
                produit=product,  # Use 'produit' instead of 'product'
                quantite=item['quantite'],  # Use 'quantite' instead of 'quantity'
                prix=Decimal(item['prix']),
            )

        logger.info(f"Order created: {order.id} for user: {user.nom}")
       # Clear the user's cart
        Panier.objects.filter(client=client).delete()  # Or delete LignePanier entries
        logger.info(f"Cart cleared for client: {client.user_id}")

        logger.info(f"Order created: {order.id} for user: {user.nom}")
        return Response(
            {
                "id": str(order.id),
                "client_id": str(client.user_id),  # Return client.id
                "total": str(order.total),
                "status": order.status,
                "shipping_info": shipping_info,
                "items": data['items'],
            },
            status=status.HTTP_201_CREATED
        )
    except Produit.DoesNotExist:
        logger.warning("Invalid product ID in order items")
        return Response(
            {"detail": "Invalid product ID"},
            status=status.HTTP_400_BAD_REQUEST
        )
    except Client.DoesNotExist:
        logger.warning(f"No Client instance found for user: {user.id}")
        return Response(
            {"detail": "No Client profile associated with this user"},
            status=status.HTTP_400_BAD_REQUEST
        )
    except Exception as e:
        logger.error(f"Checkout error: {str(e)}")
        return Response(
            {"detail": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
def list_orders(request):
    search = request.query_params.get('search', '')
    page = int(request.query_params.get('page', 1))
    search = request.query_params.get('search', '')
    status = request.query_params.get('status', '')
    date_start = request.query_params.get('date_start', '')
    date_end = request.query_params.get('date_end', '')
    amount_min = request.query_params.get('amount_min', '')
    amount_max = request.query_params.get('amount_max', '')
    boutique_id = request.query_params.get('boutique_id', '')
    sort_by = request.query_params.get('sort_by', 'created_at')
    sort_order = request.query_params.get('sort_order', 'desc')

    # Build query
    queryset = Order.objects.all()
    
    # Filter by boutique_id
    if boutique_id:
        queryset = queryset.filter(items__produit__boutique_id=boutique_id).distinct()
    
    # Search by ID or client name
    if search:
        queryset = queryset.filter(
            Q(id__icontains=search) |
            Q(client__user__first_name__icontains=search) |
            Q(client__user__last_name__icontains=search)
        )
    
    # Filter by status
    if status:
        queryset = queryset.filter(status=status)
    
    # Filter by date range
    if date_start:
        queryset = queryset.filter(created_at__gte=datetime.strptime(date_start, '%Y-%m-%d'))
    if date_end:
        queryset = queryset.filter(created_at__lte=datetime.strptime(date_end, '%Y-%m-%d'))
    
    # Filter by amount range
    if amount_min:
        queryset = queryset.filter(total__gte=float(amount_min))
    if amount_max:
        queryset = queryset.filter(total__lte=float(amount_max))
    
    # Sort
    sort_field = sort_by if sort_by in ['created_at', 'total'] else 'created_at'
    sort_prefix = '-' if sort_order == 'desc' else ''
    queryset = queryset.order_by(f'{sort_prefix}{sort_field}')

    # Pagination
    paginator = Paginator(queryset, 10)  # 10 orders per page
    page_obj = paginator.get_page(page)
    
    serializer = OrderSerializer(page_obj, many=True)
    return Response({
        'count': paginator.count,
        'results': serializer.data,
    })

@api_view(['PATCH'])
def update_order_status(request, order_id):
    try:
        order = Order.objects.get(id=order_id)
    except Order.DoesNotExist:
        return Response({'error': 'Commande non trouvée'}, status=status.HTTP_404_NOT_FOUND)
    
    new_status = request.data.get('status')
    if new_status not in ['pending', 'processing', 'shipped', 'delivered', 'cancelled']:
        return Response({'error': 'Statut invalide'}, status=status.HTTP_400_BAD_REQUEST)
    
    order.status = new_status
    order.save()
    serializer = OrderSerializer(order)
    return Response(serializer.data)
from django.db.models import Count, Sum
from django.utils import timezone
from datetime import timedelta
from django.db.models import Count, Sum
@api_view(['GET'])
def dashboard_stats(request):
    try:
        total_users = User.objects.filter(role='client', is_active=True).count()
        active_merchants = User.objects.filter(role='marchand', is_active=True, is_approved=True).count()
        total_revenue = Order.objects.filter(status='payée').aggregate(total=Sum('total'))['total'] or 0
        tickets_open = Order.objects.filter(status='pending').count()

        stats = {
            'total_users': str(total_users),
            'active_merchants': str(active_merchants),
            'total_revenue': f"${total_revenue:,.2f}",
            'tickets_open': str(tickets_open),
        }
        serializer = StatsSerializer(stats)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Exception as e:
        logger.error(f"Error fetching stats: {str(e)}")
        return Response(
            {
                'total_users': '0',
                'active_merchants': '0',
                'total_revenue': '$0.00',
                'tickets_open': '0',
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
def recent_users(request):
    try:
        users = User.objects.filter(
            role='client',
            is_active=True
        ).select_related().order_by('-created_at')[:5]
        users_data = [
            {
                'id': user.id,
                'name': f"{user.prenom} {user.nom}",
                'email': user.email,
                'date': user.created_at.isoformat(),
                'status': 'active' if user.is_active else 'inactive'
            } for user in users
        ]
        serializer = UserSerializer(users_data, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Exception as e:
        logger.error(f"Error fetching recent users: {str(e)}")
        return Response([], status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
def recent_orders(request):
    try:
        orders = Order.objects.select_related('client__user').order_by('-created_at')[:5]
        orders_data = [
            {
                'id': order.id,
                'order': f'#ORD-{order.id}',
                'amount': f"${order.total:,.2f}",
                'date': order.created_at.isoformat(),
                'status': order.status
            } for order in orders
        ]
        serializer = OrderSerializer(orders_data, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Exception as e:
        logger.error(f"Error fetching recent orders: {str(e)}")
        return Response([], status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
def revenue_overview(request):
    try:
        current_year = timezone.now().year
        logger.debug(f"Fetching revenue for year: {current_year}")
        revenue_data = (
            Order.objects.filter(
                status='payée',
                created_at__year=current_year
            )
            .values('created_at__month')
            .annotate(total=Sum('total'))
            .order_by('created_at__month')
        )
        logger.debug(f"Raw revenue data: {list(revenue_data)}")
        
        months = [{'month': i, 'total': 0.0} for i in range(1, 13)]
        for data in revenue_data:
            month = int(data['created_at__month'])
            total = data['total']
            if isinstance(total, (int, float)) and 1 <= month <= 12:
                months[month - 1]['total'] = float(total)
            else:
                logger.warning(f"Invalid data for month {month}: total={total}")
        
        serializer = RevenueOverviewSerializer(months, many=True)
        logger.debug(f"Serialized data: {serializer.data}")
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Exception as e:
        logger.error(f"Error fetching revenue overview: {str(e)}", exc_info=True)
        return Response(
            [{'month': i, 'total': 0.0} for i in range(1, 13)],
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
def user_growth(request):
    try:
        end_date = timezone.now().date()
        start_date = end_date - timedelta(weeks=12)
        user_data = (
            User.objects.filter(
                role='client',
                created_at__date__gte=start_date,
                created_at__date__lte=end_date
            )
            .extra(
                select={'week': "EXTRACT(week FROM created_at)"}
            )
            .values('week')
            .annotate(count=Count('id'))
            .order_by('week')
        )
        weeks = [
            {'week': i, 'count': 0}
            for i in range(int(start_date.isocalendar()[1]), int(end_date.isocalendar()[1]) + 1)
        ]
        for data in user_data:
            week_index = int(data['week']) - int(start_date.isocalendar()[1])
            if 0 <= week_index < len(weeks):
                weeks[week_index]['count'] = data['count']
        serializer = UserGrowthSerializer(weeks, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Exception as e:
        logger.error(f"Error fetching user growth: {str(e)}", exc_info=True)
        return Response(
            [{'week': i, 'count': 0} for i in range(int(start_date.isocalendar()[1]), int(end_date.isocalendar()[1]) + 1)],
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def notification_list_view(request):
    notifications = NotificationMarchand.objects.filter(user=request.user)
    serializer = NotificationSerializer(notifications, many=True)
    return Response(serializer.data)   