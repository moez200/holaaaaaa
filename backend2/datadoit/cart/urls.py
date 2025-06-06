from socket import create_server
from django.urls import path
from . import views

urlpatterns = [
     path('paniers/add/', views.add_to_cart, name='add_to_cart'),
   path('panier/checkout/', views.checkout, name='create_order'),
    path('orders/', views.list_orders, name='list_orders'),
    path('orders/<str:order_id>/', views.update_order_status, name='update_order_status'),
   
    path('paniers/<int:client_id>/', views.get_cart, name='get_cart'),
    path('paniers/ligne/<int:ligne_panier_id>/', views.update_cart_quantity, name='update_cart_quantity'),
    path('panier/ligne/<int:ligne_panier_id>/delete/', views.remove_from_cart, name='remove_from_cart'),
  
  path('dashboard-stats/', views.dashboard_stats, name='dashboard-stats'),
    path('recent-users/', views.recent_users, name='recent-users'),
    path('recent-orders/', views.recent_orders, name='recent-orders'),
    path('revenue-overview/', views.revenue_overview, name='revenue-overview'),
    path('user-growth/', views.user_growth, name='user-growth'),
     path('notifications/', views.notification_list_view, name='notification-list'),
]
