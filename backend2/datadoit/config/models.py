# config/models.py
from django.db import models
from django.utils.translation import gettext_lazy as _
from boutique.models import Boutique
import uuid
from django.utils.crypto import get_random_string

class Configurer(models.Model):
    boutique = models.ForeignKey(Boutique, on_delete=models.CASCADE, related_name='configurations', verbose_name=_("Boutique"))
    parametre = models.TextField(verbose_name=_("Paramètre"))
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Créé le"))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_("Mis à jour le"))

    class Meta:
        verbose_name = _("Configuration")
        verbose_name_plural = _("Configurations")
        db_table = 'configurations'

    def __str__(self):
        return f"Configuration pour {self.boutique.nom}"

class RemiseType(models.Model):
    TYPE_CHOICES = [
        ('tranches', _('Remise par tranches')),
        ('fin_paiement', _('Remise à la fin de paiement')),
    ]
    
    boutique = models.ForeignKey(
        Boutique, 
        on_delete=models.CASCADE, 
        related_name='remise_types', 
        verbose_name=_("Boutique"),
        null=True,
        blank=True
    )
    duree_plan_paiement = models.CharField(max_length=100, verbose_name=_("Durée du plan de paiement"), null=True)
    type_remise = models.CharField(max_length=20, choices=TYPE_CHOICES, verbose_name=_("Type de remise"))
    nombre_tranches = models.PositiveIntegerField(null=True, blank=True, verbose_name=_("Nombre de tranches déclencheur"))
    pourcentage_remise = models.DecimalField(max_digits=5, decimal_places=2, verbose_name=_("Pourcentage de remise"))
    montant_max_remise = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, verbose_name=_("Montant maximal de remise"))
    date_creation = models.DateTimeField(auto_now_add=True, verbose_name=_("Date de création"))

    class Meta:
        verbose_name = _("Type de remise")
        verbose_name_plural = _("Types de remises")
        ordering = ['-date_creation']
        db_table = 'remise_types'

    def __str__(self):
        return f"{self.duree_plan_paiement} ({self.get_type_remise_display()})"

def generate_referral_code():
    return get_random_string(length=10, allowed_chars='ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789')

class Badge(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)
    threshold = models.IntegerField()  # Points required to earn the badge
    discount = models.FloatField()     # Discount percentage (e.g., 5.0 for 5%)
    icon = models.CharField(max_length=200)  # URL or path to icon
    color = models.CharField(max_length=50)  # Hex color code (e.g., #CD7F32)

    class Meta:
        db_table = 'config_badges'  # Changed to avoid conflict
        verbose_name = _("Badge")
        verbose_name_plural = _("Badges")

    def __str__(self):
        return self.name

class ReferralRule(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    referrals_count = models.IntegerField() # Number of referrals required
    discount = models.FloatField()           # Discount percentage
    timeFrame = models.CharField(max_length=50, blank=True, null=True)  # e.g., "30 days"

    class Meta:
        db_table = 'referral_rules'
        verbose_name = _("Referral Rule")
        verbose_name_plural = _("Referral Rules")

    def __str__(self):
        return f"Referral Rule: {self.referrals_count} referrals = {self.discount}%"

class Discount(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    client = models.ForeignKey('users.Client', on_delete=models.CASCADE, related_name='applied_discounts')  # Updated reference
    name = models.CharField(max_length=100)  # e.g., "Referral Discount"
    value = models.FloatField()             # Discount percentage
    applied_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'discounts'
        verbose_name = _("Discount")
        verbose_name_plural = _("Discounts")

    def __str__(self):
        return f"{self.name} ({self.value}%) for {self.client}"

class Notification(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=200)
    message = models.TextField()
    type = models.CharField(
        max_length=20,
        choices=[('badge', 'Badge'), ('referral', 'Referral'), ('system', 'System')]
    )
    is_read = models.BooleanField(default=False)
    date = models.DateTimeField(auto_now_add=True)
    client = models.ForeignKey('users.Client', on_delete=models.CASCADE, blank=True, null=True, related_name='notifications')  # Updated reference

    class Meta:
        db_table = 'notifications'
        verbose_name = _("Notification")
        verbose_name_plural = _("Notifications")

    def __str__(self):
        return self.title