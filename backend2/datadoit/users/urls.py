# yourapp/urls.py

from django.urls import path
from .views import approve_user, get_purchase_history, login_view, refuse_user, signup, update_avatar, update_profile, user_delete_view, user_detail_view, user_list_view, user_update_view

urlpatterns = [
    path('login/', login_view, name='login'),
    path('signup/', signup, name='signup'),
    path('me/', user_detail_view, name='user_detail'),
    path('list/', user_list_view, name='user_list'),
    path('update/<int:user_id>', user_update_view, name='user_update'),
    path('delete/<int:user_id>', user_delete_view, name='user_delete'),
    path('approve/<int:user_id>', approve_user, name='user_update'),
    path('refuse/<int:user_id>',  refuse_user, name='user_delete'),
      path('updat/<int:user_id>', user_update_view, name='user_update'),
    path('delete/<int:user_id>',  user_delete_view, name='user_delete'),
  path('auth/update-profile/', update_profile, name='update-profile'),
    path('auth/update-avatar/', update_avatar, name='update-avatar'),
    path('client/purchase-history/', get_purchase_history, name='get_purchase_history'),
    
    
]
