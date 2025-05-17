from datetime import timedelta
from django.utils import timezone
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.db.models.signals import post_save
from django.dispatch import receiver
import logging
import uuid
from django.db.models import Avg

from django.db import models
from django.contrib.auth.models import User
from config.models import Badge, Discount, Notification, ReferralRule, generate_referral_code


logger = logging.getLogger(__name__)

class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email must be set')
        email = self.normalize_email(email)
        logger.debug(f"Creating user with email={email}, extra_fields={extra_fields}")
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        logger.debug(f"User created: id={user.id}, role={user.role}")
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', 'admin')

        if extra_fields.get('is_staff') is not True:
            ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self.create_user(email, password, **extra_fields)

class User(AbstractBaseUser, PermissionsMixin):
    ROLE_CHOICES = [
        ('client', 'Client'),
        ('marchand', 'Marchand'),
        ('admin', 'Admin'),
    ]

    email = models.EmailField(unique=True)
    nom = models.CharField(max_length=255)
    prenom = models.CharField(max_length=255)
    avatar = models.ImageField(
        upload_to='avatars/',           # dossier dans MEDIA_ROOT
        default='avatars/moezjj.jpg',  # image par défaut
        blank=True                      # champ facultatif
    )
    telephone = models.CharField(max_length=20)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='client')
    adresse = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_approved = models.BooleanField(default=False)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['nom', 'prenom', 'telephone']

    def save(self, *args, **kwargs):
        """S'assure que le rôle est correctement sauvegardé"""
        if not self.role:  # Si aucun rôle n'est défini
            self.role = 'client'
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.prenom} {self.nom} ({self.email})"


# users/models.py
import uuid
import json
from django.db import models
from django.contrib.auth import get_user_model
from config.models import Badge, ReferralRule, Discount, Notification

User = get_user_model()

def generate_referral_code():
    return str(uuid.uuid4())[:10].upper()
import json
import uuid
import logging
from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver

logger = logging.getLogger(__name__)
import json
import uuid
import logging
from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver

logger = logging.getLogger(__name__)

class Client(models.Model):
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        primary_key=True,
        related_name='client_profile'
    )
    solde_points = models.IntegerField(default=0, null=True)
    historique_achats = models.TextField(blank=True, default='{"orders": []}', null=True)
    referral_code = models.CharField(max_length=10, unique=True, blank=True, null=True, default=generate_referral_code)
    nombre_clients_parraines = models.IntegerField(default=0)
    current_badge = models.ForeignKey('config.Badge', on_delete=models.SET_NULL, blank=True, null=True, related_name='clients')
    orders = models.IntegerField(default=0)

    class Meta:
        db_table = 'clients'

    def __str__(self):
        return f"Client: {self.user.first_name} {self.user.last_name}"

    @property
    def orders_count(self):
        return self.orders

    def update_purchase_history(self, order):
        try:
            history = json.loads(self.historique_achats or '{"orders": []}')
            if not isinstance(history, dict) or 'orders' not in history:
                history = {'orders': []}
        except json.JSONDecodeError:
            history = {'orders': []}

        order_items = order.items.select_related('produit').all()
        order_data = {
            'order_id': str(order.id),
            'created_at': order.created_at.isoformat(),
            'items': [
                {
                    'produit_id': str(item.produit.id),
                    'produit_nom': item.produit.nom,
                    'prix': float(item.prix),
                    'quantite': item.quantite,
                    'total': float(item.prix * item.quantite)
                }
                for item in order_items
            ],
            'total_montant': float(sum(item.prix * item.quantite for item in order_items))
        }

        history['orders'].append(order_data)
        self.historique_achats = json.dumps(history, ensure_ascii=False)
        self.orders += 1
        self.save()

    def assign_badge(self):
        from config.models import Badge
        from .models import Discount, Notification
        eligible_badge = Badge.objects.filter(threshold__lte=self.orders).order_by('-threshold').first()
        if eligible_badge and eligible_badge != self.current_badge:
            logger.info(f"Nouveau badge attribué pour client {self.user_id}: {eligible_badge.name}")
            self.current_badge = eligible_badge
            super().save(update_fields=['current_badge'])  # Éviter d'appeler assign_badge récursivement

            # Créer une réduction pour le badge
            discount_name = f"Badge Discount ({eligible_badge.name})"
            if not Discount.objects.filter(client=self, name=discount_name).exists():
                discount = Discount.objects.create(
                    client=self,
                    name=discount_name,
                    value=eligible_badge.discount
                )
                logger.info(f"Réduction de badge créée: {discount.name} ({discount.value}%) pour client {self.user_id}")
                Notification.objects.create(
                    client=self,
                    title=f"New Badge Earned: {eligible_badge.name}",
                    message=f"Congratulations! You've earned the {eligible_badge.name} badge with a {eligible_badge.discount}% discount.",
                    type='badge'
                )
            else:
                logger.info(f"Réduction de badge {discount_name} déjà appliquée pour client {self.user_id}")

    def apply_referral_discount(self, referral_rule):
        from .models import Discount, Notification
        # Utiliser referralsCount si la base de données n'a pas été migrée, sinon referrals_count
        referrals_count = referral_rule.referralsCount if hasattr(referral_rule, 'referralsCount') else referral_rule.referrals_count
        logger.info(f"Appel de apply_referral_discount pour client {self.user_id}, referral_rule: {referrals_count} referrals, nombre_clients_parraines: {self.nombre_clients_parraines}")
        try:
            if self.nombre_clients_parraines >= referrals_count:
                discount_name = f"Referral Discount ({referrals_count} referrals)"
                if not Discount.objects.filter(client=self, name=discount_name).exists():
                    discount = Discount.objects.create(
                        client=self,
                        name=discount_name,
                        value=referral_rule.discount
                    )
                    logger.info(f"Réduction créée: {discount.name} ({discount.value}%) pour client {self.user_id}")
                    Notification.objects.create(
                        client=self,
                        title="Referral Discount Applied",
                        message=f"You've earned a {referral_rule.discount}% discount for referring {referrals_count} clients!",
                        type='referral'
                    )
                else:
                    logger.info(f"Réduction {discount_name} déjà appliquée pour client {self.user_id}")
            else:
                logger.info(f"Nombre de parrainages insuffisant: {self.nombre_clients_parraines} < {referrals_count}")
        except Exception as e:
            logger.error(f"Erreur dans apply_referral_discount pour client {self.user_id}: {str(e)}", exc_info=True)
            raise

    def save(self, *args, **kwargs):
        if not self.referral_code:
            code = self.user.first_name.upper()[:5] + str(uuid.uuid4())[:5].upper()
            while Client.objects.filter(referral_code=code).exists():
                code = self.user.first_name.upper()[:5] + str(uuid.uuid4())[:5].upper()
            self.referral_code = code
        super().save(*args, **kwargs)
        self.assign_badge()
class Marchand(models.Model):
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        primary_key=True,
        related_name='marchand_profile',
        verbose_name=("Utilisateur")
    )
    is_marchant = models.BooleanField(default=True, verbose_name=("Est marchand"))
    average_rating = models.FloatField(default=0.0, verbose_name=("Note moyenne"))
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=("Créé le"))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=("Mis à jour le"))

    class Meta:
        db_table = 'marchands'
        verbose_name = ("Marchand")
        verbose_name_plural = ("Marchands")

    def __str__(self):
        return f"Marchand: {self.user.prenom} {self.user.nom}"

    @property
    def marchand_name(self):
        """Retourne le nom complet du marchand."""
        return f"{self.user.prenom} {self.user.nom}"

    @property
    def products_count(self):
        """Calcule le nombre de produits associés au marchand."""
        return self.produits.count()

    @property
    def est_nouveau(self):
        """Vérifie si le marchand est nouveau (moins de 30 jours)."""
        return timezone.now() < self.created_at + timedelta(days=30)

    def calculate_average_rating(self):
        """Calcule la note moyenne basée sur les produits du marchand."""
        ratings = self.produits.aggregate(avg_rating=Avg('average_rating'))
        avg_rating = ratings['avg_rating'] or 0.0
        self.average_rating = round(avg_rating, 1)
        self.save(update_fields=['average_rating'])
        return self.average_rating

class Admin(models.Model):
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        primary_key=True,
        related_name='admin_profile'
    )

    class Meta:
        db_table = 'admins'

    def __str__(self):
        return f"Admin: {self.user.prenom} {self.user.nom}"

@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        if instance.role == 'client':
            Client.objects.create(user=instance)
            logger.debug(f"Created Client profile for user: {instance.email}")
        elif instance.role == 'marchand':
            Marchand.objects.create(user=instance)
            logger.debug(f"Created Marchand profile for user: {instance.email}")
        elif instance.role == 'admin':
            Admin.objects.create(user=instance)
            logger.debug(f"Created Admin profile for user: {instance.email}")
@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        if instance.role == 'client':
            if not hasattr(instance, 'client_profile'):
                Client.objects.create(user=instance)
                logger.debug(f"Created Client profile for user: {instance.email}")
        elif instance.role == 'marchand':
            if not hasattr(instance, 'marchand_profile'):
                Marchand.objects.create(user=instance)
                logger.debug(f"Created Marchand profile for user: {instance.email}")
        elif instance.role == 'admin':
            if not hasattr(instance, 'admin_profile'):
                Admin.objects.create(user=instance)
                logger.debug(f"Created Admin profile for user: {instance.email}")


class Comment(models.Model):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='comments',
        verbose_name=("Utilisateur")
    )
    content = models.TextField(verbose_name=("Contenu"))
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=("Créé le"))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=("Mis à jour le"))

    class Meta:
        db_table = 'comments'
        verbose_name = ("Commentaire")
        verbose_name_plural = ("Commentaires")
        ordering = ['-created_at']

    def __str__(self):
        return f"Commentaire de {self.user.prenom} {self.user.nom}"