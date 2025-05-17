from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import NotificationMarchand, Order

@receiver(post_save, sender=Order)
def create_order_notification(sender, instance, created, **kwargs):
    if created:
        message = f"Nouvelle commande reçue - #{instance.order_number}"
        NotificationMarchand.objects.create(
            user=instance.merchant,
            message=message,
            order=instance
        )