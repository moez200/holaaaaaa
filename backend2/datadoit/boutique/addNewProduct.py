# yourapp/management/commands/update_new_products.py
from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta

from boutique.models import Produit


class Command(BaseCommand):
    help = 'Met à jour le statut est_nouveau des produits'

    def handle(self, *args, **kwargs):
        threshold_date = timezone.now() - timedelta(days=2)
        old_products = Produit.objects.filter(est_nouveau=True, created_at__lt=threshold_date)
        count = old_products.update(est_nouveau=False)
        self.stdout.write(self.style.SUCCESS(f"{count} produits mis à jour."))