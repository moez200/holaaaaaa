# Generated by Django 5.2 on 2025-05-13 08:18

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('config', '0011_rename_referrals_count_referralrule_referralscount_and_more'),
    ]

    operations = [
        migrations.RenameField(
            model_name='referralrule',
            old_name='referralsCount',
            new_name='referrals_count',
        ),
    ]
