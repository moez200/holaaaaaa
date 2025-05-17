from venv import logger
from django.db import models

from django.utils.translation import gettext_lazy as _
from config.models import RemiseType
from users.models import Client, User
from boutique.models import Produit
from django.db import models
from django.utils.translation import gettext_lazy as _
from django.utils import timezone
from datetime import timedelta
import re
from rest_framework import serializers
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.urls import path
from django.db.models import JSONField


class Panier(models.Model):
    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name='paniers')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Créé le"))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_("Mis à jour le"))

    class Meta:
        verbose_name = _("Panier")
        verbose_name_plural = _("Paniers")
        db_table = 'paniers'

    def __str__(self):
        return f"Panier de {self.client.user.prenom} {self.client.user.nom}"

class LignePanier(models.Model):
    panier = models.ForeignKey(Panier, on_delete=models.CASCADE, related_name='lignes')
    produit = models.ForeignKey(Produit, on_delete=models.CASCADE, related_name='lignes_panier')
    quantite = models.PositiveIntegerField(default=1, verbose_name=_("Quantité"))
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Créé le"))

    class Meta:
        verbose_name = _("Ligne de Panier")
        verbose_name_plural = _("Lignes de Panier")
        db_table = 'lignes_paniers'

    def __str__(self):
        return f"{self.quantite} x {self.produit.nom} (Panier ID: {self.panier.id})"
class Order(models.Model):
    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name='orders_Client')
    first_name = models.CharField(max_length=100, verbose_name=_("Prénom"))
    last_name = models.CharField(max_length=100, verbose_name=_("Nom"))
    email = models.EmailField(verbose_name=_("Email"))
    telephone = models.CharField(max_length=20, verbose_name=_("Téléphone"))
    adresse = models.TextField(verbose_name=_("Adresse"))
    total = models.DecimalField(max_digits=10, decimal_places=2, verbose_name=_("Total"))
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Créé le"))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_("Mis à jour le"))
    status = models.CharField(
        max_length=20,
        choices=[
            ('pending', 'En attente'),
            ('processing', 'En traitement'),
            ('shipped', 'Expédiée'),
            ('payée', 'Payée'),
            ('cancelled', 'Annulée'),
        ],
        default='pending',
        verbose_name=_("Statut")
    )
    paid_tranches = JSONField(default=dict, blank=True)  # Ex: {"123-1": "payée", "123-2": "en_attente"}

    class Meta:
        verbose_name = _("Commande")
        verbose_name_plural = _("Commandes")
        db_table = 'orders'

    def __str__(self):
        return f"Commande {self.id} de {self.client.user.prenom} {self.client.user.nom}"

    def initialize_paid_tranches(self):
        """
        Initialise paid_tranches avec toutes les tranches possibles en statut 'en_attente'.
        """
        paid_tranches = {}
        order_items = self.items.select_related('produit__boutique').all()
        if not order_items.exists():
            logger.warning(f"No order items found for order {self.id} during paid_tranches initialization")
            return

        for order_item in order_items:
            boutique_id = order_item.produit.boutique_id
            remise_type = RemiseType.objects.filter(boutique_id=boutique_id).first()
            nombre_tranches = remise_type.nombre_tranches or 1 if remise_type else 1
            for i in range(1, nombre_tranches + 1):
                tranche_key = f"{order_item.id}-{i}"
                paid_tranches[tranche_key] = 'en_attente'
        self.paid_tranches = paid_tranches
        logger.info(f"Initialized paid_tranches for order {self.id}: {paid_tranches}")
        self.save()

    def update_status_based_on_payments(self):
        """
        Met à jour le statut de la commande en fonction des tranches payées.
        """
        logger.info(f"Updating status for order {self.id}, paid_tranches={self.paid_tranches}")
        order_items = self.items.select_related('produit__boutique').all()
        total_tranches = 0
        paid_tranches = 0
        inconsistent_tranches = []

        for order_item in order_items:
            boutique_id = order_item.produit.boutique_id
            remise_type = RemiseType.objects.filter(boutique_id=boutique_id).first()
            nombre_tranches = remise_type.nombre_tranches or 1 if remise_type else 1
            total_tranches += nombre_tranches
            for i in range(1, nombre_tranches + 1):
                tranche_key = f"{order_item.id}-{i}"
                status = self.paid_tranches.get(tranche_key)
                if status not in ['payée', 'en_attente', None]:
                    inconsistent_tranches.append(tranche_key)
                if status == 'payée':
                    paid_tranches += 1

        if inconsistent_tranches:
            logger.error(f"Inconsistent tranche statuses in order {self.id}: {inconsistent_tranches}")
            # Optionnel : Réinitialiser paid_tranches en cas d'incohérence
            self.initialize_paid_tranches()
            paid_tranches = 0
            total_tranches = sum(
                (RemiseType.objects.filter(boutique_id=oi.produit.boutique_id).first().nombre_tranches or 1)
                if RemiseType.objects.filter(boutique_id=oi.produit.boutique_id).exists() else 1
                for oi in order_items
            )

        if total_tranches == 0:
            self.status = 'pending'
            logger.info(f"Order {self.id} status set to 'pending' (no tranches)")
        elif paid_tranches == total_tranches and total_tranches > 0:
            self.status = 'payée'
            logger.info(f"Order {self.id} status set to 'payée' (all {total_tranches} tranches paid)")
        elif paid_tranches > 0:
            self.status = 'processing'
            logger.info(f"Order {self.id} status set to 'processing' ({paid_tranches}/{total_tranches} tranches paid)")
        else:
            self.status = 'pending'
            logger.info(f"Order {self.id} status set to 'pending' (no tranches paid)")
        self.save()
class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    produit = models.ForeignKey(Produit, on_delete=models.CASCADE, related_name='order_items')
    quantite = models.PositiveIntegerField(verbose_name=_("Quantité"))
    prix = models.DecimalField(max_digits=10, decimal_places=2, verbose_name=_("Prix"))

    class Meta:
        verbose_name = _("Article de Commande")
        verbose_name_plural = _("Articles de Commande")
        db_table = 'order_items'

    def __str__(self):
        return f"{self.quantite} x {self.produit.nom} (Commande ID: {self.order.id})"

class NotificationMarchand(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='cart_notifications')
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    order = models.ForeignKey(Order, on_delete=models.CASCADE, null=True)

    def __str__(self):
        return f"Notification for {self.user}: {self.message}"

    class Meta:
        ordering = ['-created_at']    