import calendar
from datetime import datetime, timedelta, timezone
import logging
import os
import requests
from rest_framework.permissions import IsAuthenticated 
from rest_framework.decorators import api_view, permission_classes,authentication_classes
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from cart.models import Order
from cart.serializers import BoutiqueSerializerCart, ProduitSerializerCart
from users.models import Client, Marchand
from .models import Boutique, CategoryBoutique, CategoryProduit, Produit, Rating, Wishlist, WishlistItem
from .serializers import BoutiqueSerializer, BoutiqueSerializerall, CategoryBoutiqueSerializer, CategoryProduitSerializer, DashboardOverviewSerializer, MonthlySalesSerializer, OutOfStockSerializer, ProductsByCategorySerializer, ProduitSerializer, RatingSerializer, TopSellingProductSerializer, WishlistItemSerializer, WishlistSerializer
from rest_framework.permissions import AllowAny 
from django.db.models import Sum, Count
from django.utils import timezone
from datetime import timedelta

logger = logging.getLogger(__name__)

@api_view(['GET'])
@authentication_classes([])
@permission_classes([AllowAny])
def boutiques_by_category(request, pk):
    """
    Retrieve all boutiques associated with a specific CategoryBoutique.
    """
    try:
        category_boutique = get_object_or_404(CategoryBoutique, pk=pk)
        boutiques = Boutique.objects.filter(category_boutique=category_boutique)
        serializer = BoutiqueSerializer(boutiques, many=True, context={'request': request})
        response = Response(serializer.data)
        response['Cache-Control'] = 'no-cache, no-store, must-revalidate'
        return response
    except Exception as e:
        logger.error(f"Error fetching boutiques by category {pk}: {str(e)}")
        return Response({'error': 'Une erreur est survenue'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def boutique_list_createchat(request):
    if request.method == 'GET':
        boutique_id = request.query_params.get('boutique_id')
        marchand = request.query_params.get('marchand')
        
        try:
            if boutique_id:
                boutique = Boutique.objects.get(id=boutique_id)
                if request.user.role.lower() == 'client':
                    serializer = BoutiqueSerializer(boutique, context={'request': request})
                    return Response(serializer.data)
                elif request.user.role.lower() == 'marchand' and boutique.marchand.user == request.user:
                    serializer = BoutiqueSerializer(boutique, context={'request': request})
                    return Response(serializer.data)
                else:
                    return Response({'error': 'Accès non autorisé'}, status=403)
            elif marchand:
                if request.user.role.lower() == 'marchand':
                    boutiques = Boutique.objects.filter(marchand__user=request.user)
                    serializer = BoutiqueSerializer(boutiques, many=True, context={'request': request})
                    return Response(serializer.data)
                else:
                    return Response({'error': 'Accès non autorisé'}, status=403)
            else:
                if request.user.role.lower() == 'marchand':
                    boutiques = Boutique.objects.filter(marchand__user=request.user)
                    serializer = BoutiqueSerializer(boutiques, many=True, context={'request': request})
                    return Response(serializer.data)
                else:
                    return Response({'error': 'Accès non autorisé'}, status=403)
        except Boutique.DoesNotExist:
            return Response({'error': 'Boutique non trouvée'}, status=404)
        except Exception as e:
            logger.error(f"Erreur lors de la récupération des boutiques: {str(e)}")
            return Response({'error': 'Une erreur est survenue'}, status=500)

@api_view(['GET', 'POST'])
def boutique_list_create(request):
    if request.method == 'GET':
        marchand = request.query_params.get('marchand')
        if marchand:
            boutiques = Boutique.objects.filter(marchand__id=marchand, marchand__user=request.user)
        else:
            boutiques = Boutique.objects.filter(marchand__user=request.user)
        serializer = BoutiqueSerializer(boutiques, many=True, context={'request': request})
        response = Response(serializer.data)
        response['Cache-Control'] = 'no-cache, no-store, must-revalidate'
        return response

    elif request.method == 'POST':
        try:
            marchand = Marchand.objects.get(user=request.user)
            if not marchand.is_marchant:
                return Response(
                    {'error': 'User is not a merchant'},
                    status=status.HTTP_403_FORBIDDEN
                )
        except Marchand.DoesNotExist:
            return Response(
                {'error': 'Merchant profile not found'},
                status=status.HTTP_403_FORBIDDEN
            )

        logger.debug(f"POST request.data: {request.data}, request.FILES: {request.FILES}")
        serializer = BoutiqueSerializer(data=request.data, context={'request': request})

        if serializer.is_valid():
            boutique = serializer.save(marchand=marchand)
            logger.debug(f"Created Boutique: {boutique.nom}, logo: {boutique.logo}, image: {boutique.image}")
            response = Response(
                BoutiqueSerializer(boutique, context={'request': request}).data,
                status=status.HTTP_201_CREATED
            )
            response['Cache-Control'] = 'no-cache, no-store, must-revalidate'
            return response

        logger.error(f"Serializer errors: {serializer.errors}")
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def boutique_detail(request, boutique_id):
    try:
        boutique = Boutique.objects.get(id=boutique_id, marchand__user=request.user)
        serializer = BoutiqueSerializer(boutique, context={'request': request})
        response = Response(serializer.data)
        response['Cache-Control'] = 'no-cache, no-store, must-revalidate'
        return response
    except Boutique.DoesNotExist:
        return Response(
            {'error': 'Boutique not found or you do not have permission to access it'},
            status=status.HTTP_404_NOT_FOUND
        )

@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def boutique_retrieve_update_destroy(request, pk):
    boutique = get_object_or_404(Boutique, pk=pk)

    if request.method == 'GET':
        serializer = BoutiqueSerializer(boutique, context={'request': request})
        response = Response(serializer.data)
        response['Cache-Control'] = 'no-cache, no-store, must-revalidate'
        return response

    elif request.method == 'PUT':
        if boutique.marchand.user != request.user:
            return Response(
                {'error': 'You do not own this boutique'},
                status=status.HTTP_403_FORBIDDEN
            )
        data = request.data.copy()
        if 'logo' in request.FILES:
            data['logo_file'] = request.FILES['logo']
            logger.debug(f"Assigned logo_file for PUT: {data['logo_file']}")
        if 'image' in request.FILES:
            data['image_file'] = request.FILES['image']
            logger.debug(f"Assigned image_file for PUT: {data['image_file']}")
        serializer = BoutiqueSerializer(boutique, data=data, partial=True, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            response = Response(serializer.data)
            response['Cache-Control'] = 'no-cache, no-store, must-revalidate'
            return response
        logger.error(f"Serializer errors: {serializer.errors}")
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        if boutique.marchand.user != request.user:
            return Response(
                {'error': 'You do not own this boutique'},
                status=status.HTTP_403_FORBIDDEN
            )
        boutique.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def produit_list_create(request):
    try:
        marchand = Marchand.objects.get(user=request.user)
        if not marchand.is_marchant:
            return Response(
                {'error': 'User is not a merchant'},
                status=status.HTTP_403_FORBIDDEN
            )
    except Marchand.DoesNotExist:
        return Response(
            {'error': 'Merchant profile not found'},
            status=status.HTTP_403_FORBIDDEN
        )

    if request.method == 'GET':
        category_produit_id = request.query_params.get('category_produit_id')
        if category_produit_id:
            produits = Produit.objects.filter(
                category_produit_id=category_produit_id,
                boutique__marchand=marchand
            )
        else:
            produits = Produit.objects.filter(boutique__marchand=marchand)
        serializer = ProduitSerializer(produits, many=True, context={'request': request})
        response = Response(serializer.data)
        response['Cache-Control'] = 'no-cache, no-store, must-revalidate'
        return response

    elif request.method == 'POST':
        data = request.data.copy()
        logger.debug(f"POST request.data: {request.data}, request.FILES: {request.FILES}")

        # Handle images array from input data (select first image)
        images = data.get('images', [])
        if images and isinstance(images, list) and not request.FILES.get('image'):
            try:
                # Download the first image
                response = requests.get(images[0])
                if response.status_code == 200:
                    image_name = f"{data.get('name', 'produit')}.jpg"
                    data['image_file'] = ContentFile(response.content, name=image_name)
                    logger.debug(f"Converted image URL {images[0]} to image_file: {image_name}")
                else:
                    logger.error(f"Failed to download image from {images[0]}: Status {response.status_code}")
            except Exception as e:
                logger.error(f"Error downloading image from {images[0]}: {str(e)}")

        # Map input data fields to model fields
        if 'name' in data:
            data['nom'] = data.pop('name')
        if 'price' in data:
            data['prix'] = data.pop('price')
        if 'discountedPrice' in data:
            data['prix_reduit'] = data.pop('discountedPrice')
        if 'rating' in data:
            data['note'] = data.pop('rating')
        if 'inStock' in data:
            data['en_stock'] = data.pop('inStock')
            data['stock'] = 1 if data['en_stock'] else 0  # Map inStock to stock
        if 'isNew' in data:
            data['est_nouveau'] = data.pop('isNew')
        if 'isFeatured' in data:
            data['est_mis_en_avant'] = data.pop('isFeatured')
        if 'category' in data:
            # Map category string to category_produit ID
            try:
                category = CategoryProduit.objects.get(nom=data.pop('category'), boutique__marchand=marchand)
                data['category_produit'] = category.id
            except CategoryProduit.DoesNotExist:
                logger.error(f"Category {data['category']} not found for merchant")
                return Response(
                    {'error': f"Category {data['category']} not found"},
                    status=status.HTTP_400_BAD_REQUEST
                )
        if 'vendor' in data and isinstance(data['vendor'], dict):
            # Map vendor to boutique ID
            try:
                boutique = Boutique.objects.get(nom=data['vendor'].get('name'), marchand=marchand)
                data['boutique'] = boutique.id
            except Boutique.DoesNotExist:
                logger.error(f"Boutique {data['vendor'].get('name')} not found for merchant")
                return Response(
                    {'error': f"Boutique {data['vendor'].get('name')} not found"},
                    status=status.HTTP_400_BAD_REQUEST
                )

        # Handle image file from form-data
        if 'image' in request.FILES:
            data['image_file'] = request.FILES['image']
            logger.debug(f"Assigned image_file: {data['image_file']}")

        serializer = ProduitSerializer(data=data, context={'request': request})
        if serializer.is_valid():
            produit = serializer.save()
            logger.debug(f"Created Produit: {produit.nom}, image: {produit.image}")
            response = Response(
                ProduitSerializer(produit, context={'request': request}).data,
                status=status.HTTP_201_CREATED
            )
            response['Cache-Control'] = 'no-cache, no-store, must-revalidate'
            return response
        logger.error(f"Serializer errors: {serializer.errors}")
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'DELETE'])
def produit_detail(request, pk):
    produit = get_object_or_404(Produit, pk=pk)

   
 

    if request.method == 'GET':
        serializer = ProduitSerializer(produit, context={'request': request})
        response = Response(serializer.data)
        response['Cache-Control'] = 'no-cache, no-store, must-revalidate'
        return response

    elif request.method == 'PUT':
        data = request.data.copy()
        if 'image' in request.FILES:
            data['image_file'] = request.FILES['image']
            logger.debug(f"Assigned image_file for PUT: {data['image_file']}")
        serializer = ProduitSerializer(
            produit,
            data=data,
            partial=True,
            context={'request': request}
        )
        if serializer.is_valid():
            serializer.save()
            response = Response(serializer.data)
            response['Cache-Control'] = 'no-cache, no-store, must-revalidate'
            return response
        logger.error(f"Serializer errors: {serializer.errors}")
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        produit.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

@api_view(['GET', 'POST'])
@authentication_classes([])
@permission_classes([AllowAny])
def category_boutique_list_create(request):
    if request.method == 'GET':
        categories_boutique = CategoryBoutique.objects.all()
        serializer = CategoryBoutiqueSerializer(categories_boutique, many=True, context={'request': request})
        response_data = serializer.data
        logger.debug(f"GET CategoryBoutique response data: {response_data}")
        for category in categories_boutique:
            image_path = category.image.path if category.image else None
            logger.debug(f"CategoryBoutique {category.nom} (id: {category.id}): image={category.image}, file_exists={os.path.exists(image_path) if image_path else False}")
        response = Response(response_data)
        response['Cache-Control'] = 'no-cache, no-store, must-revalidate'
        return response

    elif request.method == 'POST':
        data = request.data.copy()
        logger.debug(f"POST request.data: {request.data}, request.FILES: {request.FILES}")
        if 'image' in request.FILES:
            data['image_file'] = request.FILES['image']
            logger.debug(f"Assigned image_file: {data['image_file']}")
        serializer = CategoryBoutiqueSerializer(data=data, context={'request': request})
        if serializer.is_valid():
            category_boutique = serializer.save()
            response_data = CategoryBoutiqueSerializer(category_boutique, context={'request': request}).data
            logger.debug(f"Created CategoryBoutique: {category_boutique.nom}, image: {category_boutique.image}, response: {response_data}")
            response = Response(response_data, status=status.HTTP_201_CREATED)
            response['Cache-Control'] = 'no-cache, no-store, must-revalidate'
            return response
        logger.error(f"Serializer errors: {serializer.errors}")
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'DELETE'])

def category_boutique_detail(request, pk):
    category_boutique = get_object_or_404(CategoryBoutique, pk=pk)

    if request.method == 'GET':
        serializer = CategoryBoutiqueSerializer(category_boutique, context={'request': request})
        logger.debug(f"GET CategoryBoutique (id: {pk}) response data: {serializer.data}")
        image_path = category_boutique.image.path if category_boutique.image else None
        logger.debug(f"CategoryBoutique {category_boutique.nom} (id: {pk}): image={category_boutique.image}, file_exists={os.path.exists(image_path) if image_path else False}")
        response = Response(serializer.data)
        response['Cache-Control'] = 'no-cache, no-store, must-revalidate'
        return response

    elif request.method == 'PUT':
        data = request.data.copy()
        if 'image' in request.FILES:
            data['image_file'] = request.FILES['image']
            logger.debug(f"Assigned image_file for PUT: {data['image_file']}")
        serializer = CategoryBoutiqueSerializer(category_boutique, data=data, partial=True, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            response_data = CategoryBoutiqueSerializer(category_boutique, context={'request': request}).data
            logger.debug(f"Updated CategoryBoutique: {category_boutique.nom}, response: {response_data}")
            response = Response(response_data)
            response['Cache-Control'] = 'no-cache, no-store, must-revalidate'
            return response
        logger.error(f"Serializer errors: {serializer.errors}")
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        category_boutique.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
@api_view(['GET', 'POST'])
def category_produit_list_create(request):
    try:
        marchand = Marchand.objects.get(user=request.user)
        if not marchand.is_marchant:
            return Response(
                {'error': 'User is not a merchant'},
                status=status.HTTP_403_FORBIDDEN
            )
    except Marchand.DoesNotExist:
        return Response(
            {'error': 'Merchant profile not found'},
            status=status.HTTP_403_FORBIDDEN
        )

    if request.method == 'GET':
        boutique_id = request.query_params.get('boutique_id')
        if boutique_id:
            categories_produit = CategoryProduit.objects.filter(boutique__id=boutique_id, boutique__marchand=marchand)
        else:
            categories_produit = CategoryProduit.objects.filter(boutique__marchand=marchand)
        serializer = CategoryProduitSerializer(categories_produit, many=True, context={'request': request})
        logger.debug(f"GET CategoryProduit response data: {serializer.data}")
        response = Response(serializer.data)
        response['Cache-Control'] = 'no-cache, no-store, must-revalidate'
        return response

    elif request.method == 'POST':
        # ✅ Extraire ou valider l’objet boutique directement
        boutique_id = request.data.get('boutique')
        try:
            boutique = Boutique.objects.get(id=boutique_id, marchand=marchand)
        except Boutique.DoesNotExist:
            return Response({'error': 'Boutique not found or not owned by this merchant'}, status=status.HTTP_400_BAD_REQUEST)

        # ✅ Créer l’objet CategoryProduit en injectant `boutique`
        serializer = CategoryProduitSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save(boutique=boutique)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def category_produit_retrieve_update_destroy(request, pk):
    category_produit = get_object_or_404(CategoryProduit, pk=pk)

    try:
        marchand = Marchand.objects.get(user=request.user)
        if not marchand.is_marchant:
            return Response(
                {'error': 'User is not a merchant'},
                status=status.HTTP_403_FORBIDDEN
            )
    except Marchand.DoesNotExist:
        return Response(
            {'error': 'Merchant profile not found'},
            status=status.HTTP_403_FORBIDDEN
        )

    if category_produit.boutique.marchand != marchand:
        return Response(
            {'error': 'You do not own this category'},
            status=status.HTTP_403_FORBIDDEN
        )

    if request.method == 'GET':
        serializer = CategoryProduitSerializer(category_produit, context={'request': request})
        logger.debug(f"GET CategoryProduit (id: {pk}) response data: {serializer.data}")
        response = Response(serializer.data)
        response['Cache-Control'] = 'no-cache, no-store, must-revalidate'
        return response

    elif request.method == 'PUT':
        data = request.data.copy()
        if 'image' in request.FILES:
            data['image_file'] = request.FILES['image']
            logger.debug(f"Assigned image_file for PUT: {data['image_file']}")
        serializer = CategoryProduitSerializer(
            category_produit,
            data=data,
            partial=True,
            context={'request': request}
        )
        if serializer.is_valid():
            serializer.save()
            response_data = CategoryProduitSerializer(category_produit, context={'request': request}).data
            logger.debug(f"Updated CategoryProduit: {category_produit.nom}, response: {response_data}")
            response = Response(response_data)
            response['Cache-Control'] = 'no-cache, no-store, must-revalidate'
            return response
        logger.error(f"Serializer errors: {serializer.errors}")
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        category_produit.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

@api_view(['GET'])
@permission_classes([AllowAny])
def boutique_categories_produits(request, boutique_id):
    try:
        boutique = get_object_or_404(Boutique, pk=boutique_id)
        categories = CategoryProduit.objects.filter(boutique=boutique)
        categories_serializer = CategoryProduitSerializer(categories, many=True, context={'request': request})
        produits = Produit.objects.filter(boutique=boutique)
        produits_serializer = ProduitSerializer(produits, many=True, context={'request': request})
        
        response_data = {
            'boutique': BoutiqueSerializer(boutique, context={'request': request}).data,
            'categories': categories_serializer.data,
            'produits': produits_serializer.data
        }
        
        return Response(response_data)
    except Exception as e:
        logger.error(f"Error fetching boutique details: {str(e)}")
        return Response({'error': 'Une erreur est survenue'}, status=500)

@api_view(['GET'])
def boutique_produits_by_category(request, boutique_id, category_id):
    try:
        boutique = get_object_or_404(Boutique, pk=boutique_id)
        category = get_object_or_404(CategoryProduit, pk=category_id, boutique=boutique)
        produits = Produit.objects.filter(boutique=boutique, category_produit=category)
        serializer = ProduitSerializer(produits, many=True, context={'request': request})
        return Response(serializer.data)
    except Exception as e:
        logger.error(f"Error filtering products by category: {str(e)}")
        return Response({'error': 'Une erreur est survenue'}, status=500)

@api_view(['GET'])
@authentication_classes([])
@permission_classes([AllowAny])
def boutique_detail_public(request, boutique_id):
    try:
        boutique = get_object_or_404(Boutique, pk=boutique_id)
        categories = CategoryProduit.objects.filter(boutique=boutique)
        categories_serializer = CategoryProduitSerializer(categories, many=True, context={'request': request})
        products = Produit.objects.filter(boutique=boutique)
        products_serializer = ProduitSerializer(products, many=True, context={'request': request})
        
        response_data = {
            'boutique': BoutiqueSerializer(boutique, context={'request': request}).data,
            'categories': categories_serializer.data,
            'products': products_serializer.data
        }
        
        return Response(response_data)
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['GET'])
def all_boutiques(request):
    try:
        page = int(request.query_params.get('page', 1))
        page_size = int(request.query_params.get('page_size', 10))
        
        boutiques = Boutique.objects.filter(status='approved').select_related('marchand', 'category_boutique')
        
        # Pagination
        total_count = boutiques.count()
        total_pages = (total_count + page_size - 1) // page_size
        start_index = (page - 1) * page_size
        end_index = start_index + page_size
        paginated_boutiques = boutiques[start_index:end_index]
        
        serializer = BoutiqueSerializer(paginated_boutiques, many=True, context={'request': request})
        
        return Response({
            "success": True,
            "count": total_count,
            "total_pages": total_pages,
            "current_page": page,
            "boutiques": serializer.data
        })
    except Exception as e:
        logger.error(f"Error fetching all boutiques: {str(e)}")
        return Response(
            {"success": False, "error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

# ✅ Approuver une boutique
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def boutique_approve(request, pk):
    boutique = get_object_or_404(Boutique, pk=pk)
    if boutique.is_approved is not False:
        return Response({'error': 'Boutique est deja approuvé'}, status=status.HTTP_400_BAD_REQUEST)
    boutique.is_approved = True
    boutique.save()
    serializer = BoutiqueSerializer(boutique)
    return Response(serializer.data, status=status.HTTP_200_OK)

# ✅ Rejeter une boutique
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def boutique_reject(request, pk):
    boutique = get_object_or_404(Boutique, pk=pk)
    if boutique.is_approved is not True:
        return Response({'error': 'Boutique est deja rejeté'}, status=status.HTTP_400_BAD_REQUEST)
    boutique.is_approved = False
    boutique.save()
    serializer = BoutiqueSerializer(boutique)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_boutique(request, pk):
    try:
        boutique = get_object_or_404(Boutique, pk=pk)
        boutique_name = boutique.nom
        boutique.delete()
        
        logger.info(f"Boutique {boutique_name} (ID: {pk}) deleted by user {request.user.username}")
        response = Response({
            'message': f'Boutique {boutique_name} has been deleted'
        })
        response['Cache-Control'] = 'no-cache, no-store, must-revalidate'
        return response
    except Exception as e:
        logger.error(f"Error deleting boutique {pk}: {str(e)}")
        return Response({'error': 'An error occurred while deleting the boutique'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_boutiques(request):
  
    try:
        boutiques = Boutique.objects.all()
        serializer = BoutiqueSerializerall(boutiques, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Exception as e:
        return Response(
            {"detail": f"Error retrieving boutiques: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    
@api_view(['GET'])
def get_boutique_details(request, boutique_id):
    try:
        boutique = Boutique.objects.get(id=boutique_id)
        serializer = BoutiqueSerializerCart(boutique)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Boutique.DoesNotExist:
        logger.error(f"Boutique {boutique_id} not found")
        return Response({"error": "Boutique not found"}, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
def get_boutique_products(request, boutique_id):
    try:
        produits = Produit.objects.filter(boutique_id=boutique_id)
        serializer = ProduitSerializerCart(produits, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Boutique.DoesNotExist:
        logger.error(f"Boutique {boutique_id} not found")
        return Response({"error": "Boutique not found"}, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
def get_product_details(request, product_id):
    try:
        logger.info(f"Fetching product details for product_id={product_id}")
        produit = Produit.objects.get(id=product_id)
        serializer = ProduitSerializerCart(produit)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Produit.DoesNotExist:
        logger.error(f"Produit {product_id} not found")
        return Response({"error": "Produit not found"}, status=status.HTTP_404_NOT_FOUND)
    except ValueError:
        logger.error(f"Invalid product_id: {product_id}")
        return Response({"error": "Invalid product ID"}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_wishlist(request, client_id):
    try:
        client = Client.objects.get(user_id=client_id, user=request.user)
        wishlist, _ = Wishlist.objects.get_or_create(client=client)
        serializer = WishlistSerializer(wishlist, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Client.DoesNotExist:
        logger.error(f"Client not found for client_id: {client_id}, user: {request.user}")
        return Response(
            {"error": "Client not found or unauthorized"},
            status=status.HTTP_404_NOT_FOUND
        )

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_to_wishlist(request):
    data = request.data
    client_id = data.get('clientId')
    produit_id = data.get('produitId')

    if not client_id or not produit_id:
        return Response(
            {"error": "clientId and produitId are required"},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        client = Client.objects.get(user_id=client_id, user=request.user)
    except Client.DoesNotExist:
        logger.error(f"Client not found for client_id: {client_id}, user: {request.user}")
        return Response(
            {"error": "Client not found or unauthorized"},
            status=status.HTTP_404_NOT_FOUND
        )

    try:
        produit_id = int(produit_id)
        produit = Produit.objects.get(id=produit_id)
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

    wishlist, _ = Wishlist.objects.get_or_create(client=client)
    if WishlistItem.objects.filter(wishlist=wishlist, produit=produit).exists():
        return Response(
            {"message": "Produit already in wishlist"},
            status=status.HTTP_200_OK
        )

    wishlist_item = WishlistItem.objects.create(wishlist=wishlist, produit=produit)
    serializer = WishlistItemSerializer(wishlist_item, context={'request': request})
    return Response(serializer.data, status=status.HTTP_201_CREATED)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def remove_from_wishlist(request, produit_id):
    try:
        produit_id = int(produit_id)
        wishlist = Wishlist.objects.get(client__user=request.user)
        wishlist_item = WishlistItem.objects.get(wishlist=wishlist, produit__id=produit_id)
        wishlist_item.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    except ValueError:
        logger.error(f"Invalid produit_id: {produit_id}")
        return Response(
            {"error": "Invalid produit_id, must be a number"},
            status=status.HTTP_400_BAD_REQUEST
        )
    except Wishlist.DoesNotExist:
        logger.error(f"Wishlist not found for user: {request.user}")
        return Response(
            {"error": "Wishlist not found"},
            status=status.HTTP_404_NOT_FOUND
        )
    except WishlistItem.DoesNotExist:
        logger.error(f"WishlistItem not found for produit_id: {produit_id}")
        return Response(
            {"error": "Produit not found in wishlist"},
            status=status.HTTP_404_NOT_FOUND
        )

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def clear_wishlist(request):
    try:
        wishlist = Wishlist.objects.get(client__user=request.user)
        wishlist.items.all().delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    except Wishlist.DoesNotExist:
        logger.error(f"Wishlist not found for user: {request.user}")
        return Response(
            {"error": "Wishlist not found"},
            status=status.HTTP_404_NOT_FOUND
        )
@api_view(['POST'])
def submit_rating(request, produit_id):
    try:
        # Ensure produit exists
        produit = Produit.objects.get(id=produit_id)
    except Produit.DoesNotExist:
        logger.error(f"Produit avec id {produit_id} non trouvé")
        return Response(
            {'error': 'Produit non trouvé'},
            status=status.HTTP_404_NOT_FOUND
        )

    serializer = RatingSerializer(
        data=request.data,
        context={'request': request, 'produit_id': produit_id}
    )
    try:
        if serializer.is_valid():
            rating = serializer.save()
            logger.info(f"Note soumise avec succès: produit_id={produit_id}, user={request.user.nom}, value={rating.value}")
            return Response(
                {
                    'success': True,
                    'rating': produit.average_rating  # Return updated average
                },
                status=status.HTTP_201_CREATED
            )
        logger.error(f"Erreurs de validation pour la notation: {serializer.errors}")
        return Response(
            {'errors': serializer.errors},
            status=status.HTTP_400_BAD_REQUEST
        )
    except Exception as e:
        logger.error(f"Erreur serveur lors de la soumission de la note pour produit_id={produit_id}: {str(e)}", exc_info=True)
        return Response(
            {'error': 'Erreur serveur interne'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Produit
from .serializers import ProduitSerializer  # 👈 Assure-toi que c'est importé
from django.db.models import Avg, Count, F, ExpressionWrapper, FloatField

@api_view(['GET'])
def get_popular_products(request):
    products = Produit.objects.annotate(
        avg_rating=Avg('ratings__value'),
        sales_count=Count('order_items')
    ).filter(en_stock=True).annotate(
        popularity_score=ExpressionWrapper(
            0.6 * F('avg_rating') + 0.4 * F('sales_count'),
            output_field=FloatField()
        )
    ).order_by('-popularity_score')[:8]

    serializer = ProduitSerializer(products, many=True , context={'request': request})
    return Response(serializer.data)

@api_view(['GET'])
def get_new_products(request):
    try:
        # Option 1 : Filtrer par est_nouveau
        new_products = Produit.objects.filter(est_nouveau=True)

        # Option 2 : Filtrer dynamiquement par created_at (moins de 30 jours)
        # new_products = Produit.objects.filter(created_at__gte=timezone.now() - timedelta(days=30))

        serializer = ProduitSerializer(new_products, many=True , context={'request': request} )
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Exception as e:
        return Response(
            {"error": f"Erreur lors de la récupération des nouveaux produits : {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    


@api_view(['GET'])
def dashboard_overview(request, boutique_id):
    try:
        boutique = Boutique.objects.get(id=boutique_id)
        # Filter orders where at least one item belongs to the boutique
        orders = Order.objects.filter(items__produit__boutique=boutique).distinct()
        
        total_sales = orders.aggregate(total=Sum('total'))['total'] or 0
        total_orders = orders.count()
        total_products = Produit.objects.filter(boutique=boutique).count()
        active_customers = orders.values('client').distinct().count()

        data = {
            'total_sales': total_sales,
            'total_orders': total_orders,
            'total_products': total_products,
            'active_customers': active_customers
        }
        serializer = DashboardOverviewSerializer(data)
        return Response(serializer.data)
    except Boutique.DoesNotExist:
        return Response({"error": "Boutique not found."}, status=status.HTTP_404_NOT_FOUND)
@api_view(['GET'])
def monthly_sales(request, boutique_id):
    try:
        boutique = Boutique.objects.get(id=boutique_id)
        end_date = timezone.now()
        start_date = end_date - timedelta(days=365)

        sales_data = []
        current_date = start_date.replace(day=1)
        while current_date <= end_date:
            year = current_date.year
            month = current_date.month
            # Get the last day of the month
            last_day = calendar.monthrange(year, month)[1]
            month_start = datetime(year, month, 1, tzinfo=timezone.get_current_timezone())
            month_end = datetime(year, month, last_day, 23, 59, 59, tzinfo=timezone.get_current_timezone())
            
            sales = Order.objects.filter(
                items__produit__boutique=boutique,
                created_at__range=[month_start, month_end]
            ).aggregate(total=Sum('total'))['total'] or 0
            sales_data.append({
                'month': month_start.strftime('%b %Y'),
                'sales': sales
            })
            
            # Increment to the first day of the next month
            month += 1
            if month > 12:
                month = 1
                year += 1
            current_date = datetime(year, month, 1, tzinfo=timezone.get_current_timezone())

        serializer = MonthlySalesSerializer(sales_data, many=True)
        return Response(serializer.data)
    except Boutique.DoesNotExist:
        return Response({"error": "Boutique not found."}, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
def products_by_category(request, boutique_id):
    try:
        boutique = Boutique.objects.get(id=boutique_id)
        categories = CategoryProduit.objects.filter(boutique=boutique).annotate(
            product_count=Count('produits')
        ).values('nom', 'product_count')

        serializer = ProductsByCategorySerializer(categories, many=True)
        return Response(serializer.data)
    except Boutique.DoesNotExist:
        return Response({"error": "Boutique not found."}, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
def top_selling_products(request, boutique_id):
    try:
        boutique = Boutique.objects.get(id=boutique_id)
        top_products = Produit.objects.filter(
            boutique=boutique
        ).annotate(
            total_sold=Sum('order_items__quantite')
        ).order_by('-total_sold')[:5]

        serializer = TopSellingProductSerializer(top_products, many=True)
        return Response(serializer.data)
    except Boutique.DoesNotExist:
        return Response({"error": "Boutique not found."}, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
def out_of_stock_products(request, boutique_id):
    try:
        boutique = Boutique.objects.get(id=boutique_id)
        out_of_stock_count = Produit.objects.filter(
            boutique=boutique,
            stock=0
        ).count()

        serializer = OutOfStockSerializer({'out_of_stock_count': out_of_stock_count})
        return Response(serializer.data)
    except Boutique.DoesNotExist:
        return Response({"error": "Boutique not found."}, status=status.HTTP_404_NOT_FOUND)