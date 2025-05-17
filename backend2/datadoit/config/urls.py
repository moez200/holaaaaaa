from django.urls import path


from .views import   badge_detail, badge_list_create, client_detail, client_list, mark_all_notifications_as_read, mark_notification_as_read, notification_detail, notification_list_create, pay_total, pay_tranche, payment_list, referral_detail, referral_list_create, remise_type_list_create, remise_type_detail

urlpatterns = [
    path('admin/remises-types/', remise_type_list_create, name='remise-type-list-create'),
    path('admin/remises-types/<int:pk>/', remise_type_detail, name='remise-type-detail'),
    path('clients/<int:client_id>/orders/<int:order_id>/payments/', payment_list, name='payment-list'),
    path('clients/<int:client_id>/orders/<int:order_id>/pay-tranche/', pay_tranche, name='pay_tranche'),
    path('clients/<int:client_id>/orders/<int:order_id>/pay-total/', pay_total, name='pay_total'),
        # Badges
    path('badges/', badge_list_create, name='badge-list-create'),
    path('badges/<uuid:pk>/', badge_detail, name='badge-detail'),

    # Referral Rules
    path('referral-rules/', referral_list_create, name='referral-list-create'),
    path('referral-rules/<uuid:pk>/', referral_detail, name='referral-detail'),

    # Clients (read-only)
    path('clients/', client_list, name='client-list'),
    path('clients/<int:pk>/', client_detail, name='client-detail'),

    # Notifications
    path('notifications/', notification_list_create, name='notification-list-create'),
   path('notifications/<uuid:pk>/', notification_detail, name='notification-detail'),
path('notifications/<uuid:pk>/read/', mark_notification_as_read, name='notification-mark-read'),

    path('notifications/read-all/', mark_all_notifications_as_read, name='notification-mark-all-read'),
]