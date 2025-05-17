from django.urls import path
from . import views

urlpatterns = [
    # Boutique URLs
    path('boutiquechat/', views.boutique_list_createchat, name='boutique-list-create'),
    path('boutiques/', views.boutique_list_create, name='boutique-list-create'),
    path('boutiques/<int:pk>/', views.boutique_retrieve_update_destroy, name='boutique-retrieve-update-destroy'),
    path('boutiques/<int:boutique_id>/', views.boutique_detail, name='boutique-detail'),
    path('boutiquesall/', views.all_boutiques, name='all_boutiques'),
    path('boutiques/<int:boutique_id>/details/', views.boutique_detail_public, name='boutique-detail-public'),
    path('boutiques/<int:boutique_id>/categories/<int:category_id>/produits/', views.boutique_produits_by_category, name='boutique-produits-by-category'),
    path('approve/<int:pk>/', views.boutique_approve, name='approve_boutique'),
    path('reject/<int:pk>/', views.boutique_reject, name='reject_boutique'),
    path('boutique/<int:pk>/delete/', views.delete_boutique, name='delete_boutique'),
    
    # CategoryBoutique URLs
    path('category_boutiques/', views.category_boutique_list_create, name='category_boutique-list-create'),
    path('category_boutiques/<int:pk>/', views.category_boutique_detail, name='category_boutique-detail'),
    path('category_boutiques/<int:pk>/boutiques/', views.boutiques_by_category, name='boutiques-by-category'),
    
    # CategoryProduit URLs
    path('category-produits/', views.category_produit_list_create, name='category_produit-list-create'),
    path('category-produits/<int:pk>/', views.category_produit_retrieve_update_destroy, name='category_produit-detail'),
    
    # Produit URLs
    path('Produits/', views.produit_list_create, name='produit-list-create'),
    path('produits/<int:pk>/', views.produit_detail, name='produit-detail'),

    path('boutiques/all/', views.list_boutiques, name='list_boutiques'),

    path('boutiques/<int:boutique_id>/', views.get_boutique_details, name='get_boutique_details'),
    path('boutiques/<int:boutique_id>/products/', views.get_boutique_products, name='get_boutique_products'),
    path('boutiques/produitDetails/<int:product_id>/', views.get_product_details, name='get_product_details'),

    path('wishlist/<int:client_id>/', views.get_wishlist, name='get_wishlist'),
    path('wishlist/add/', views.add_to_wishlist, name='add_to_wishlist'),
    path('wishlist/remove/<int:produit_id>/', views.remove_from_wishlist, name='remove_from_wishlist'),
    path('wishlist/clear/', views.clear_wishlist, name='clear_wishlist'),
      path('products/popular/', views.get_popular_products, name='popular-products'),
    path('produits/<int:produit_id>/rating/', views.submit_rating, name='submit_product_rating'),
    path('produits/new/', views.get_new_products, name='get_new_products'),


    path('boutiques/<int:boutique_id>/dashboard/overview/', views.dashboard_overview, name='dashboard-overview'),
    path('boutiques/<int:boutique_id>/dashboard/monthly-sales/', views.monthly_sales, name='monthly-sales'),
    path('boutiques/<int:boutique_id>/dashboard/products-by-category/', views.products_by_category, name='products-by-category'),
    path('boutiques/<int:boutique_id>/dashboard/top-selling-products/', views.top_selling_products, name='top-selling-products'),
    path('boutiques/<int:boutique_id>/dashboard/out-of-stock-products/', views.out_of_stock_products, name='out-of-stock-products'),
]