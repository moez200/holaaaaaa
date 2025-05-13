from django.contrib import admin
from .models import Admin, Client, Marchand, User
from django.contrib.auth.models import Permission
# Personnalisation de l'interface Admin pour le modèle User
class UserAdmin(admin.ModelAdmin):
    list_display = ('email', 'nom', 'prenom', 'telephone', 'role', 'is_active', 'is_staff')
    list_filter = ('is_active', 'is_staff', 'role')
    search_fields = ('email', 'nom', 'prenom')
    ordering = ('email',)

# Enregistrer le modèle User dans l'admin
admin.site.register(User, UserAdmin)


admin.site.register(Client)
admin.site.register(Marchand)
admin.site.register(Admin)
admin.site.register(Permission)