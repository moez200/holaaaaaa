from rest_framework import serializers
from boutique.models import Boutique, CategoryProduit, Produit
from cart.models import LignePanier, Order, OrderItem, Panier
from users.models import Client, User
import logging

from django.core.files.base import ContentFile

logger = logging.getLogger(__name__)

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'nom', 'prenom', 'telephone']

class ClientSerializerCart(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = Client
        fields = ['user', 'solde_points', 'historique_achats']

class CategoryProduitSerializerCart(serializers.ModelSerializer):
    class Meta:
        model = CategoryProduit
        fields = ['id', 'nom', 'image', 'boutique', 'created_at', 'updated_at']

class BoutiqueSerializerCart(serializers.ModelSerializer):
    class Meta:
        model = Boutique
        fields = ['id', 'nom', 'description', 'logo', 'adresse', 'telephone', 'email', 'category_boutique', 'created_at', 'updated_at']

class ProduitSerializerCart(serializers.ModelSerializer):
    boutique_details = BoutiqueSerializerCart(source='boutique', read_only=True)
    category_produit_details = CategoryProduitSerializerCart(source='category_produit', read_only=True)
    image = serializers.SerializerMethodField()

    class Meta:
        model = Produit
        fields = [
            'id', 'nom', 'description', 'prix', 'prix_reduit', 'stock', 'image', 'couleur', 'taille',
            'category_produit', 'category_produit_details', 'boutique', 'boutique_details',
            'note', 'en_stock', 'est_nouveau', 'est_mis_en_avant', 'created_at', 'updated_at'
        ]

    def get_image(self, obj):
        if not obj.image:
            logger.debug(f"Produit {obj.nom} (id: {obj.id}) has no image")
            return None
        request = self.context.get('request')
        try:
            image_url = request.build_absolute_uri(obj.image.url) if request else obj.image.url
            logger.debug(f"Produit {obj.nom} (id: {obj.id}) image URL: {image_url}")
            return image_url
        except Exception as e:
            logger.error(f"Error generating image URL for Produit {obj.nom} (id: {obj.id}): {str(e)}")
            return None

class ReadProduitSerializer(serializers.ModelSerializer):
    boutique_details = BoutiqueSerializerCart(source='boutique', read_only=True)
    category_produit_details = CategoryProduitSerializerCart(source='category_produit', read_only=True)
    image = serializers.SerializerMethodField()

    class Meta:
        model = Produit
        fields = [
            'id', 'nom', 'description', 'prix', 'prix_reduit', 'stock', 'image', 'couleur', 'taille',
            'category_produit', 'category_produit_details', 'boutique', 'boutique_details',
            'note', 'en_stock', 'est_nouveau', 'est_mis_en_avant', 'created_at', 'updated_at'
        ]

    def get_image(self, obj):
        if not obj.image:
            logger.debug(f"Produit {obj.nom} (id: {obj.id}) has no image")
            return None
        request = self.context.get('request')
        try:
            image_url = request.build_absolute_uri(obj.image.url) if request else obj.image.url
            logger.debug(f"Produit {obj.nom} (id: {obj.id}) image URL: {image_url}")
            return image_url
        except Exception as e:
            logger.error(f"Error generating image URL for Produit {obj.nom} (id: {obj.id}): {str(e)}")
            return None

class LignePanierSerializer(serializers.ModelSerializer):
    produit = ProduitSerializerCart(read_only=True)
    produit_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = LignePanier
        fields = ['id', 'panier', 'produit', 'produit_id', 'quantite', 'created_at']

    def validate(self, data):
        produit_id = data.get('produit_id')
        quantite = data.get('quantite')
        try:
            produit = Produit.objects.get(id=produit_id)
            if not produit.en_stock or produit.stock < quantite:
                raise serializers.ValidationError({
                    "quantite": f"Stock insuffisant pour {produit.nom} (stock disponible: {produit.stock})"
                })
        except Produit.DoesNotExist:
            raise serializers.ValidationError({"produit_id": "Produit non trouvé"})
        return data

class PanierSerializer(serializers.ModelSerializer):
    client = ClientSerializerCart(read_only=True)
    lignes = LignePanierSerializer(many=True, read_only=True)

    class Meta:
        model = Panier
        fields = ['id', 'client', 'created_at', 'updated_at', 'lignes']

class OrderItemSerializer(serializers.ModelSerializer):
    produit = ReadProduitSerializer(read_only=True)
    produit_id = serializers.IntegerField(write_only=True)
    quantite = serializers.IntegerField(write_only=True)
    prix = serializers.DecimalField(max_digits=10, decimal_places=2, write_only=True)

    class Meta:
        model = OrderItem
        fields = ['id', 'produit', 'produit_id', 'quantite', 'prix']

    def validate(self, data):
        produit_id = data.get('produit_id')
        quantite = data.get('quantite')
        try:
            produit = Produit.objects.get(id=produit_id)
            if not produit.en_stock or produit.stock < quantite:
                raise serializers.ValidationError({
                    "quantite": f"Stock insuffisant pour {produit.nom} (stock disponible: {produit.stock})"
                })
            if data['prix'] != produit.prix:
                raise serializers.ValidationError({
                    "prix": f"Le prix indiqué ({data['prix']}) ne correspond pas au prix du produit ({produit.prix})"
                })
        except Produit.DoesNotExist:
            raise serializers.ValidationError({"produit_id": "Produit non trouvé"})
        return data

class WriteOrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, write_only=True)
    client_id = serializers.IntegerField(write_only=True)
    shipping_info = serializers.DictField(write_only=True)

    class Meta:
        model = Order
        fields = ['client_id', 'shipping_info', 'items', 'total', 'status']

    def validate(self, data):
        shipping_info = data.get('shipping_info', {})
        required_fields = ['firstName', 'lastName', 'email', 'telephone', 'adresse']
        for field in required_fields:
            if field not in shipping_info:
                raise serializers.ValidationError({field: f"Le champ {field} est requis dans shipping_info"})

        # Validate total
        items = data.get('items', [])
        calculated_total = sum(float(item['prix']) * item['quantite'] for item in items) * 1.1
        if abs(calculated_total - float(data['total'])) > 0.01:
            raise serializers.ValidationError({
                "total": f"Le total ({data['total']}) ne correspond pas au total calculé ({calculated_total})"
            })

        return data

    def create(self, validated_data):
        client_id = validated_data.pop('client_id')
        shipping_info = validated_data.pop('shipping_info')
        items_data = validated_data.pop('items')

        try:
            client = Client.objects.get(user__id=client_id)
        except Client.DoesNotExist:
            raise serializers.ValidationError({"client_id": "Client non trouvé"})

        order = Order.objects.create(
            client=client,
            first_name=shipping_info['firstName'],
            last_name=shipping_info['lastName'],
            email=shipping_info['email'],
            telephone=shipping_info['telephone'],
            adresse=shipping_info['adresse'],
            total=validated_data['total'],
            status=validated_data.get('status', 'pending')
        )

        for item_data in items_data:
            produit = Produit.objects.get(id=item_data['produit_id'])
            OrderItem.objects.create(
                order=order,
                produit=produit,
                quantite=item_data['quantite'],
                prix=item_data['prix']
            )
            produit.stock -= item_data['quantite']
            produit.save()

        return order

class OrderSerializer(serializers.ModelSerializer):
    client = ClientSerializerCart(read_only=True)
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = ['id', 'client', 'first_name', 'last_name', 'email', 'telephone', 'adresse', 'total', 'created_at', 'updated_at', 'items', 'status']