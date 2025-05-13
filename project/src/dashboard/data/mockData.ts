// Types
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  image?: string;
  sold: number;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  sku?: string;
}

export interface Address {
  street: string;
  city: string;
  postalCode: string;
  country: string;
}

export interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  date: string;
  status: string;
  items: OrderItem[];
  total: number;
  shippingAddress?: Address;
  paymentMethod: string;
  lastFourDigits?: string;
  shippingMethod?: string;
  shippingCost?: number;
  tax?: number;
  trackingNumber?: string;
}

export interface BankInfo {
  bankName: string;
  accountName: string;
  iban: string;
  swift: string;
  paypalEmail?: string;
}

export interface Merchant {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  website?: string;
  storeName: string;
  storeDescription: string;
  storeCategory: string;
  storeLogo?: string;
  storeCoverImage?: string;
  merchantSince: string;
  bankInfo?: BankInfo;
}

export interface Payment {
  id: string;
  orderId: string;
  customerName: string;
  date: string;
  amount: number;
  method: string;
  status: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  date: string;
  read: boolean;
  actionLink?: string;
  actionText?: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  receiverId: string;
  receiverName: string;
  content: string;
  date: string;
  read: boolean;
}

export interface CustomerMessage {
  id: string;
  customerId: string;
  customerName: string;
  orderId: string;
  content: string;
  date: string;
  isFromMerchant: boolean;
  hasEarlyPaymentReward: boolean;
}

// Mock Data
export const mockProducts: Product[] = [
  {
    id: 'p1',
    name: 'T-shirt Premium Coton',
    description: 'T-shirt de haute qualité en coton organique, parfait pour tous les jours.',
    price: 29.99,
    stock: 45,
    category: 'Fashion',
    image: 'https://images.pexels.com/photos/5698851/pexels-photo-5698851.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    sold: 120
  },
  {
    id: 'p2',
    name: 'Sneakers Urban',
    description: 'Baskets confortables pour un look urbain et décontracté.',
    price: 89.99,
    stock: 12,
    category: 'Fashion',
    image: 'https://images.pexels.com/photos/1456706/pexels-photo-1456706.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    sold: 85
  },
  {
    id: 'p3',
    name: 'Montre Classic',
    description: 'Montre élégante avec un design intemporel.',
    price: 129.99,
    stock: 8,
    category: 'Accessories',
    image: 'https://images.pexels.com/photos/190819/pexels-photo-190819.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    sold: 32
  },
  {
    id: 'p4',
    name: 'Parfum Élégance',
    description: 'Parfum aux notes boisées pour une présence remarquée.',
    price: 75.00,
    stock: 25,
    category: 'Beauty',
    image: 'https://images.pexels.com/photos/965989/pexels-photo-965989.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    sold: 67
  },
  {
    id: 'p5',
    name: 'Écouteurs Wireless Pro',
    description: 'Écouteurs sans fil avec réduction de bruit active.',
    price: 159.99,
    stock: 0,
    category: 'Electronics',
    image: 'https://images.pexels.com/photos/3394651/pexels-photo-3394651.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    sold: 94
  },
  {
    id: 'p6',
    name: 'Sac à dos Adventure',
    description: 'Sac à dos spacieux et résistant pour toutes vos aventures.',
    price: 49.99,
    stock: 17,
    category: 'Accessories',
    image: 'https://images.pexels.com/photos/1294731/pexels-photo-1294731.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    sold: 52
  },
  {
    id: 'p7',
    name: 'Enceinte Bluetooth Mini',
    description: 'Petite enceinte portable avec un son puissant.',
    price: 39.99,
    stock: 30,
    category: 'Electronics',
    image: 'https://images.pexels.com/photos/1279107/pexels-photo-1279107.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    sold: 78
  },
  {
    id: 'p8',
    name: 'Crème Hydratante',
    description: 'Crème visage hydratante pour tous types de peau.',
    price: 24.99,
    stock: 42,
    category: 'Beauty',
    image: 'https://images.pexels.com/photos/3321416/pexels-photo-3321416.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    sold: 103
  }
];

export const mockOrders: Order[] = [
  {
    id: '10045',
    customerName: 'Sophie Martin',
    customerEmail: 'sophie.martin@example.com',
    customerPhone: '+33 6 12 34 56 78',
    date: '2023-06-15T14:32:00',
    status: 'Livrée',
    items: [
      {
        productId: 'p1',
        name: 'T-shirt Premium Coton',
        price: 29.99,
        quantity: 2,
        image: 'https://images.pexels.com/photos/5698851/pexels-photo-5698851.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
      },
      {
        productId: 'p8',
        name: 'Crème Hydratante',
        price: 24.99,
        quantity: 1,
        image: 'https://images.pexels.com/photos/3321416/pexels-photo-3321416.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
      }
    ],
    total: 84.97,
    shippingAddress: {
      street: '15 Rue de la Paix',
      city: 'Paris',
      postalCode: '75002',
      country: 'France'
    },
    paymentMethod: 'Carte de crédit',
    lastFourDigits: '4242',
    shippingMethod: 'Standard',
    shippingCost: 4.99,
    tax: 14.16,
    trackingNumber: 'TRK7890123456'
  },
  {
    id: '10046',
    customerName: 'Thomas Dubois',
    customerEmail: 'thomas.dubois@example.com',
    date: '2023-06-18T09:15:00',
    status: 'Expédiée',
    items: [
      {
        productId: 'p5',
        name: 'Écouteurs Wireless Pro',
        price: 159.99,
        quantity: 1,
        image: 'https://images.pexels.com/photos/3394651/pexels-photo-3394651.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
      }
    ],
    total: 159.99,
    shippingAddress: {
      street: '8 Avenue Victor Hugo',
      city: 'Lyon',
      postalCode: '69002',
      country: 'France'
    },
    paymentMethod: 'PayPal',
    shippingMethod: 'Express',
    shippingCost: 9.99,
    tax: 28.00,
    trackingNumber: 'TRK4567890123'
  },
  {
    id: '10047',
    customerName: 'Julie Leroux',
    customerEmail: 'julie.leroux@example.com',
    customerPhone: '+33 6 87 65 43 21',
    date: '2023-06-20T16:45:00',
    status: 'En préparation',
    items: [
      {
        productId: 'p2',
        name: 'Sneakers Urban',
        price: 89.99,
        quantity: 1,
        image: 'https://images.pexels.com/photos/1456706/pexels-photo-1456706.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
      },
      {
        productId: 'p6',
        name: 'Sac à dos Adventure',
        price: 49.99,
        quantity: 1,
        image: 'https://images.pexels.com/photos/1294731/pexels-photo-1294731.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
      }
    ],
    total: 139.98,
    shippingAddress: {
      street: '25 Rue du Commerce',
      city: 'Bordeaux',
      postalCode: '33000',
      country: 'France'
    },
    paymentMethod: 'Carte de crédit',
    lastFourDigits: '1234',
    shippingMethod: 'Standard',
    shippingCost: 4.99,
    tax: 24.00
  },
  {
    id: '10048',
    customerName: 'Marc Petit',
    customerEmail: 'marc.petit@example.com',
    date: '2023-06-22T11:20:00',
    status: 'En attente',
    items: [
      {
        productId: 'p4',
        name: 'Parfum Élégance',
        price: 75.00,
        quantity: 1,
        image: 'https://images.pexels.com/photos/965989/pexels-photo-965989.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
      }
    ],
    total: 75.00,
    shippingAddress: {
      street: '5 Place de la Liberté',
      city: 'Marseille',
      postalCode: '13001',
      country: 'France'
    },
    paymentMethod: 'Virement bancaire',
    shippingMethod: 'Standard',
    shippingCost: 4.99,
    tax: 13.33
  },
  {
    id: '10049',
    customerName: 'Anne Moreau',
    customerEmail: 'anne.moreau@example.com',
    customerPhone: '+33 6 23 45 67 89',
    date: '2023-06-23T13:10:00',
    status: 'Payée',
    items: [
      {
        productId: 'p3',
        name: 'Montre Classic',
        price: 129.99,
        quantity: 1,
        image: 'https://images.pexels.com/photos/190819/pexels-photo-190819.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
      },
      {
        productId: 'p7',
        name: 'Enceinte Bluetooth Mini',
        price: 39.99,
        quantity: 2,
        image: 'https://images.pexels.com/photos/1279107/pexels-photo-1279107.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
      }
    ],
    total: 209.97,
    shippingAddress: {
      street: '42 Rue des Lilas',
      city: 'Lille',
      postalCode: '59000',
      country: 'France'
    },
    paymentMethod: 'Carte de crédit',
    lastFourDigits: '5678',
    shippingMethod: 'Express',
    shippingCost: 9.99,
    tax: 36.66
  }
];

export const mockMerchant: Merchant = {
  id: 'm1',
  name: 'Jean Durand',
  email: 'jean.durand@example.com',
  phone: '+33 6 12 34 56 78',
  address: '25 Rue du Commerce, 75015 Paris, France',
  website: 'www.boutiquemode.fr',
  storeName: 'Boutique Mode Paris',
  storeDescription: 'Boutique spécialisée dans les vêtements et accessoires de mode haut de gamme. Nous proposons une sélection soignée des meilleurs créateurs français et internationaux.',
  storeCategory: 'Fashion',
  storeLogo: 'https://images.pexels.com/photos/5698851/pexels-photo-5698851.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
  storeCoverImage: 'https://images.pexels.com/photos/3965545/pexels-photo-3965545.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
  merchantSince: 'Juin 2022',
  bankInfo: {
    bankName: 'Banque de France',
    accountName: 'Jean Durand',
    iban: 'FR76 1234 5678 9012 3456 7890 123',
    swift: 'ABCDEFGH',
    paypalEmail: 'payments@boutiquemode.fr'
  }
};

export const mockPayments: Payment[] = [
  {
    id: 'pmt10045',
    orderId: '10045',
    customerName: 'Sophie Martin',
    date: '2023-06-15T14:32:00',
    amount: 84.97,
    method: 'Carte de crédit',
    status: 'Completed'
  },
  {
    id: 'pmt10046',
    orderId: '10046',
    customerName: 'Thomas Dubois',
    date: '2023-06-18T09:15:00',
    amount: 159.99,
    method: 'PayPal',
    status: 'Completed'
  },
  {
    id: 'pmt10047',
    orderId: '10047',
    customerName: 'Julie Leroux',
    date: '2023-06-20T16:45:00',
    amount: 139.98,
    method: 'Carte de crédit',
    status: 'Completed'
  },
  {
    id: 'pmt10048',
    orderId: '10048',
    customerName: 'Marc Petit',
    date: '2023-06-22T11:20:00',
    amount: 75.00,
    method: 'Virement bancaire',
    status: 'Pending'
  },
  {
    id: 'pmt10049',
    orderId: '10049',
    customerName: 'Anne Moreau',
    date: '2023-06-23T13:10:00',
    amount: 209.97,
    method: 'Carte de crédit',
    status: 'Completed'
  },
  {
    id: 'pmt10050',
    orderId: '10050',
    customerName: 'Pierre Lambert',
    date: '2023-06-25T10:05:00',
    amount: 124.50,
    method: 'Carte de crédit',
    status: 'Pending'
  },
  {
    id: 'pmt10051',
    orderId: '10051',
    customerName: 'Claire Bernard',
    date: '2023-06-27T15:30:00',
    amount: 45.98,
    method: 'PayPal',
    status: 'Failed'
  },
  {
    id: 'pmt10052',
    orderId: '10052',
    customerName: 'Luc Girard',
    date: '2023-06-28T09:45:00',
    amount: 89.99,
    method: 'Carte de crédit',
    status: 'Refunded'
  }
];

export const mockMessages: Message[] = [
  {
    id: 'm1',
    conversationId: 'admin',
    senderId: 'admin',
    senderName: 'Support',
    senderRole: 'admin',
    receiverId: 'm1',
    receiverName: 'Jean Durand',
    content: 'Bonjour Jean, comment puis-je vous aider aujourd\'hui ?',
    date: '2023-06-25T10:30:00',
    read: true
  },
  {
    id: 'm2',
    conversationId: 'admin',
    senderId: 'm1',
    senderName: 'Jean Durand',
    senderRole: 'merchant',
    receiverId: 'admin',
    receiverName: 'Support',
    content: 'Bonjour, j\'aurais besoin d\'assistance concernant les options de livraison pour les commandes internationales.',
    date: '2023-06-25T10:32:00',
    read: true
  },
  {
    id: 'm3',
    conversationId: 'admin',
    senderId: 'admin',
    senderName: 'Support',
    senderRole: 'admin',
    receiverId: 'm1',
    receiverName: 'Jean Durand',
    content: 'Bien sûr, nous proposons plusieurs options de livraison internationale. Pouvez-vous me préciser les pays vers lesquels vous souhaitez expédier ?',
    date: '2023-06-25T10:35:00',
    read: true
  },
  {
    id: 'm4',
    conversationId: 'admin',
    senderId: 'm1',
    senderName: 'Jean Durand',
    senderRole: 'merchant',
    receiverId: 'admin',
    receiverName: 'Support',
    content: 'Principalement l\'Allemagne, l\'Italie et l\'Espagne pour le moment.',
    date: '2023-06-25T10:37:00',
    read: true
  },
  {
    id: 'm5',
    conversationId: 'admin',
    senderId: 'admin',
    senderName: 'Support',
    senderRole: 'admin',
    receiverId: 'm1',
    receiverName: 'Jean Durand',
    content: 'Parfait! Pour ces pays européens, nous avons des partenariats avec DHL et Chronopost. Les délais varient de 2 à 5 jours ouvrés selon l\'option choisie. Je vais vous envoyer un document détaillant les tarifs et conditions.',
    date: '2023-06-25T10:40:00',
    read: true
  }
];

export const mockCustomerMessages: CustomerMessage[] = [
  {
    id: 'cm1',
    customerId: 'c1',
    customerName: 'Sophie Martin',
    orderId: '10045',
    content: "Bonjour, je voudrais savoir quand ma commande sera expédiée ?",
    date: '2023-06-25T10:30:00',
    isFromMerchant: false,
    hasEarlyPaymentReward: false
  },
  {
    id: 'cm2',
    customerId: 'c1',
    customerName: 'Sophie Martin',
    orderId: '10045',
    content: "Votre commande sera expédiée demain. Merci pour votre paiement rapide !",
    date: '2023-06-25T10:35:00',
    isFromMerchant: true,
    hasEarlyPaymentReward: true
  },
  {
    id: 'cm3',
    customerId: 'c2',
    customerName: 'Thomas Dubois',
    orderId: '10046',
    content: "Est-ce possible de modifier l'adresse de livraison ?",
    date: '2023-06-26T14:20:00',
    isFromMerchant: false,
    hasEarlyPaymentReward: false
  },
  {
    id: 'cm4',
    customerId: 'c3',
    customerName: 'Julie Leroux',
    orderId: '10047',
    content: "J'ai un problème avec ma commande",
    date: '2023-06-27T09:15:00',
    isFromMerchant: false,
    hasEarlyPaymentReward: false
  }
];
// Add this to your existing mockData.ts file
export const mockNotifications: Notification[] = [
  {
    id: 'n1',
    title: 'Nouvelle commande reçue',
    message: 'Vous avez reçu une nouvelle commande #10045 de Sophie Martin',
    type: 'order',
    date: '2023-06-15T14:35:00',
    read: false,
    actionLink: '/orders/10045',
    actionText: 'Voir la commande'
  },
  {
    id: 'n2',
    title: 'Paiement confirmé',
    message: 'Le paiement pour la commande #10046 a été confirmé',
    type: 'order',
    date: '2023-06-18T09:20:00',
    read: true,
    actionLink: '/orders/10046'
  },
  {
    id: 'n3',
    title: 'Stock faible',
    message: 'Le produit "Montre Classic" est presque épuisé (8 restants)',
    type: 'product',
    date: '2023-06-19T11:15:00',
    read: false,
    actionLink: '/products/p3'
  },
  {
    id: 'n4',
    title: 'Expédition réussie',
    message: 'La commande #10045 a été expédiée avec succès',
    type: 'order',
    date: '2023-06-16T08:45:00',
    read: true,
    actionLink: '/orders/10045'
  },
  {
    id: 'n5',
    title: 'Mise à jour du système',
    message: 'Une nouvelle version de la plateforme est disponible',
    type: 'info',
    date: '2023-06-20T16:30:00',
    read: false,
    actionLink: '/settings'
  },
  {
    id: 'n6',
    title: 'Produit en rupture de stock',
    message: 'Le produit "Écouteurs Wireless Pro" est maintenant en rupture de stock',
    type: 'alert',
    date: '2023-06-21T10:20:00',
    read: false,
    actionLink: '/products/p5'
  },
  {
    id: 'n7',
    title: 'Avis client',
    message: 'Sophie Martin a laissé un avis sur votre boutique',
    type: 'info',
    date: '2023-06-22T14:10:00',
    read: true,
    actionLink: '/reviews'
  },
  {
    id: 'n8',
    title: 'Nouveau message',
    message: 'Vous avez reçu un nouveau message de Thomas Dubois',
    type: 'info',
    date: '2023-06-23T09:05:00',
    read: false,
    actionLink: '/messages'
  }
];