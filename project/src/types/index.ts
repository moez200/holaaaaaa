export interface UserSignupData {
  email: string;
  nom: string;
  prenom: string;
  telephone: string;
  adresse: string;
  role: string;
  password: string;
  confirm_password: string;
  referral_code?: string;
}

export interface UserLoginData {
  email: string;
  password: string;
}

export interface User {
  id: number;
  email: string;
  nom: string;
  prenom: string;
  role: 'Client' | 'Marchand' | 'Admin';
  boutiqueId: number | null;
  referral_code?: string;
  nombre_clients_parraines?: number;
  telephone: string;
  avatar:string;
  adresse: string | null;

  is_active: boolean;
  is_staff: boolean;
  is_approved: boolean;
  created_at: string;
  updated_at: string;
}

export interface Client {
  id: number; // Maps to user.id
  user: User;
  solde_points: number | null;
  historique_achats: string | null;
}

export interface Marchand {
  id: number; // Maps to user.id
  user: User;
  boutique_nom: string | null;
  description: string | null;
  is_marchand: boolean;
}

export interface Admin {
  id: number; // Maps to user.id
  user: User;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  user: User;
}

export interface CategoryBoutique {
  id: number;
  nom: string;
  image?: string | null;
}

export interface Product {

  id: number;
  name: string; // Maps to nom
  description?: string;
  prix: number; // Maps to prix
  discountedPrice?: number; // Maps to prix_reduit
  stock: number;
  image: string[]; // Backend returns single image URL, wrapped in array
  couleur?: string;
  taille?: string;
  category: string; // Maps to category_produit.nom
  vendor: { id: number; name: string }; // Maps to boutique, id as number
  rating?: number; // Maps to note
  inStock: boolean; // Maps to en_stock
  isNew: boolean; // Maps to est_nouveau
  isFeatured: boolean; // Maps to est_mis_en_avant
}

export interface Vendor {
  id: number;
  name: string;
  logo: string;
  description: string;
  rating: number;
  productsCount: number;
}

export interface Boutique {
  id: number;
  nom: string;
  description?: string;
  logo?: string;
  adresse?: string;
  telephone?: string;
  email?: string;
  image?: string;
  category_boutique: CategoryBoutique;
  marchand: Marchand;
  is_approved: boolean | null;

  created_at: string;
  updated_at: string;
}

export interface CategoryProduit {
  id: number;
  nom: string;
  image: string | File | null;
  boutique: string; // Boutique ID
  boutique_details: Boutique;
  created_at: string;
  updated_at: string;
}

export interface ProduitCreatePayload {
  nom: string;
  description: string;
  prix: string;
  stock: string;
  couleur: string;
  taille: string;
  image: File | null;
  category_produit: string;
  boutique: string;
}

export interface ProduitUpdatePayload {
  nom?: string;
  description?: string;
  prix?: string;
  stock?: string;
  couleur?: string;
  taille?: string;
  image?: File | null;
  category_produit?: string;
  boutique?: string;
}

export interface CategoryProduitCreatePayload {
  nom: string;
  image?: File | null;
  boutique: string;
}

export interface CategoryProduitUpdatePayload {
  nom?: string;
  image?: File | null;
  boutique?: string;
}

export interface BoutiqueUpdatePayload {
  nom?: string;
  description?: string;
  logo?: string;
  adresse?: string;
  telephone?: string;
  email?: string;
  image?: string | null;
  category_boutique?: string;
}


export interface LignePanier {
  id: number;
  panier: number;
  produit: Product;
  quantite: number;
  created_at: string;
}

export interface Order {
  date: string | number | Date;
  customerName: any;
  id: number;
  client: Client;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  total: number;
  status:string;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
}

export interface OrderItem {
  id: number;
  order: number;
  produit: Product;
  quantite: number;
  prix: string;

}

export interface OrderCreatePayload {
  id?: string;
  client_id: number;
  shipping_info: {
    firstName: string;
    lastName: string;
    email: string;
    telephone: string;
    adresse: string;
  
  };
  items: { produit_id: number; quantite: number ;prix:number}[];
  total: number;
}

export interface AuthContextType {
  user: User | null;
  client: Client | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export interface ApiError {
  error?: string;
  [key: string]: any;
}
export interface RemiseType {
  id: number;
  boutique: number | null;
  duree_plan_paiement: string;
  type_remise: string;
  type_remise_display: string;
  nombre_tranches: number | null;
  pourcentage_remise: number;
  montant_max_remise: number | null;
  date_creation: string;
}

export interface RemiseTypeCreatePayload {
  duree_plan_paiement_number: string;
  duree_plan_paiement_unit: string;
  type_remise: string;
  nombre_tranches: string | number | null;
  pourcentage_remise: string | number;
  montant_max_remise: string | number | null;
  boutique: string | number | null;
}
// Interface for a Cart Line Item (LignePanier)

// Interface for a Cart (Panier)
export interface Panier {
  id: number;
  client: { user: { id: number; email: string; nom?: string; prenom?: string; telephone?: string }; solde_points: number; historique_achats: string[] };
  created_at: string;
  updated_at: string;
  lignes: LignePanier[];
}

// Interface for an Order (Echange)
export interface Order {
  id: number;
  boutique: string;
  montant: number;
  created_at: string;
}

// Interface for Shipping Information
export interface ShippingInfo {
  firstName: string;
  lastName: string;
  email: string;
  telephone: string;
  adresse: string;
 
}

// Interface for Order Creation Payload (for future extensibility)
export interface OrderCreatePayload {
  shippingInfo?: ShippingInfo;
  panierId?: number;
}

export type UserRole = 'client' | 'marchand' | 'admin';
export interface Badge {
  id: string;
  name: string;
  threshold: number;
  discount: number;
  icon: string;
  color: string;
}

export interface ReferralRule {
  id: string;
  referrals_count: number;
  discount: number;
  time_frame?: string;
}

export interface Discount {
  id: string;
  name: string;
  value: number;
  appliedAt: string;
}

export interface Customer {
  id: string;
  nom: string;
  email: string;
  orders: number;
  referrals: number;
  currentBadge: Badge | null;
  appliedDiscounts: Discount[];
}


export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'badge' | 'referral' | 'system';
  isRead: boolean;
  date: string;
  customerId?: string;
}
