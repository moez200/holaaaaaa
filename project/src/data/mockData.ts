import { Product, Category, Vendor } from '../types';

export const categories: Category[] = [
  {
    id: '1',
    name: 'Parfums',
    image: 'https://images.pexels.com/photos/965989/pexels-photo-965989.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
  },
  {
    id: '2',
    name: 'Maquillage',
    image: 'https://images.pexels.com/photos/2736370/pexels-photo-2736370.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
  },
  {
    id: '3',
    name: 'Soin Visage',
    image: 'https://images.pexels.com/photos/3762879/pexels-photo-3762879.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
  },
  {
    id: '4',
    name: 'Corps & Bain',
    image: 'https://images.pexels.com/photos/3997989/pexels-photo-3997989.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
  },
  {
    id: '5',
    name: 'Cheveux',
    image: 'https://images.pexels.com/photos/3997993/pexels-photo-3997993.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
  },
  {
    id: '6',
    name: 'Nouveautés',
    image: 'https://images.pexels.com/photos/2693644/pexels-photo-2693644.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
  },
];

export const vendors: Vendor[] = [
  {
    id: '1',
    name: 'Glamour Cosmetics',
    logo: 'https://images.pexels.com/photos/2690327/pexels-photo-2690327.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    description: 'Produits de maquillage de haute qualité pour un look professionnel.',
    rating: 4.7,
    productsCount: 78,
  },
  {
    id: '2',
    name: 'Natural Beauty',
    logo: 'https://images.pexels.com/photos/3737599/pexels-photo-3737599.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    description: 'Des soins naturels et biologiques pour une peau rayonnante.',
    rating: 4.5,
    productsCount: 42,
  },
  {
    id: '3',
    name: 'Parfums de Paris',
    logo: 'https://images.pexels.com/photos/1961795/pexels-photo-1961795.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    description: 'Fragrances de luxe inspirées par l\'élégance parisienne.',
    rating: 4.8,
    productsCount: 35,
  },
  {
    id: '4',
    name: 'Hair Essentials',
    logo: 'https://images.pexels.com/photos/6001875/pexels-photo-6001875.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    description: 'Tout ce dont vous avez besoin pour des cheveux sains et brillants.',
    rating: 4.3,
    productsCount: 64,
  },
];

export const featuredProducts: Product[] = [
  {
    id: '1',
    name: 'Eau de Parfum Irrésistible',
    description: 'Une fragrance florale et fruitée qui évoque la féminité et la joie de vivre. Notes de tête: poire et amande. Notes de cœur: rose et pivoine. Notes de fond: patchouli et vanille.',
    price: 85.00,
    discountedPrice: 68.00,
    images: [
      'https://images.pexels.com/photos/4210341/pexels-photo-4210341.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      'https://images.pexels.com/photos/4210343/pexels-photo-4210343.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    ],
    category: 'Parfums',
    vendor: {
      id: '3',
      name: 'Parfums de Paris',
    },
    rating: 4.6,
    inStock: true,
    isNew: true,
    isFeatured: true,
  },
  {
    id: '2',
    name: 'Rouge à Lèvres Hydratant',
    description: 'Rouge à lèvres hydratant longue tenue avec une finition semi-mate. Enrichi en huiles nourrissantes et en vitamine E pour des lèvres douces et protégées.',
    price: 29.50,
    images: [
      'https://images.pexels.com/photos/3373734/pexels-photo-3373734.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      'https://images.pexels.com/photos/8516391/pexels-photo-8516391.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    ],
    category: 'Maquillage',
    vendor: {
      id: '1',
      name: 'Glamour Cosmetics',
    },
    rating: 4.4,
    inStock: true,
    isFeatured: true,
  },
  {
    id: '3',
    name: 'Sérum Visage Anti-Âge',
    description: 'Sérum concentré qui combat les signes visibles de l\'âge. Sa formule enrichie en acide hyaluronique et peptides redonne fermeté et élasticité à la peau.',
    price: 65.00,
    discountedPrice: 52.00,
    images: [
      'https://images.pexels.com/photos/4465124/pexels-photo-4465124.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      'https://images.pexels.com/photos/4465121/pexels-photo-4465121.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    ],
    category: 'Soin Visage',
    vendor: {
      id: '2',
      name: 'Natural Beauty',
    },
    rating: 4.9,
    inStock: true,
    isFeatured: true,
  },
  {
    id: '4',
    name: 'Shampoing Réparateur',
    description: 'Shampoing nourrissant pour cheveux secs et abîmés. Sa formule enrichie en kératine et huile d\'argan répare les cheveux en profondeur et leur redonne brillance et vitalité.',
    price: 18.90,
    images: [
      'https://images.pexels.com/photos/6621462/pexels-photo-6621462.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      'https://images.pexels.com/photos/6621463/pexels-photo-6621463.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    ],
    category: 'Cheveux',
    vendor: {
      id: '4',
      name: 'Hair Essentials',
    },
    rating: 4.3,
    inStock: true,
    isFeatured: true,
  },
  {
    id: '5',
    name: 'Crème Hydratante Corps',
    description: 'Crème corps onctueuse qui nourrit intensément la peau. Enrichie en beurre de karité et huile d\'amande douce, elle laisse la peau douce, souple et délicatement parfumée.',
    price: 24.00,
    images: [
      'https://images.pexels.com/photos/5232429/pexels-photo-5232429.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      'https://images.pexels.com/photos/5232426/pexels-photo-5232426.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    ],
    category: 'Corps & Bain',
    vendor: {
      id: '2',
      name: 'Natural Beauty',
    },
    rating: 4.5,
    inStock: true,
    isFeatured: true,
  },
  {
    id: '6',
    name: 'Palette Fards à Paupières',
    description: 'Palette de 12 fards à paupières aux textures variées : mates, satinées et métalliques. Des teintes complémentaires pour créer une multitude de looks, du plus naturel au plus sophistiqué.',
    price: 45.00,
    discountedPrice: 36.00,
    images: [
      'https://images.pexels.com/photos/2533266/pexels-photo-2533266.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      'https://images.pexels.com/photos/3059609/pexels-photo-3059609.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    ],
    category: 'Maquillage',
    vendor: {
      id: '1',
      name: 'Glamour Cosmetics',
    },
    rating: 4.7,
    inStock: true,
    isNew: true,
    isFeatured: true,
  },
  {
    id: '7',
    name: 'Huile Cheveux Nourrissante',
    description: 'Huile capillaire multi-usages qui nourrit, protège et sublime les cheveux. Sa formule légère non grasse pénètre rapidement et ne laisse pas de film gras.',
    price: 32.50,
    images: [
      'https://images.pexels.com/photos/4202327/pexels-photo-4202327.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      'https://images.pexels.com/photos/4202326/pexels-photo-4202326.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    ],
    category: 'Cheveux',
    vendor: {
      id: '4',
      name: 'Hair Essentials',
    },
    rating: 4.6,
    inStock: true,
    isFeatured: true,
  },
  {
    id: '8',
    name: 'Eau de Toilette Aquatique',
    description: 'Une fragrance fraîche et énergisante aux notes aquatiques. Parfaite pour l\'été, elle évoque la fraîcheur de l\'océan et la légèreté d\'une brise marine.',
    price: 70.00,
    images: [
      'https://images.pexels.com/photos/965990/pexels-photo-965990.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      'https://images.pexels.com/photos/965989/pexels-photo-965989.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    ],
    category: 'Parfums',
    vendor: {
      id: '3',
      name: 'Parfums de Paris',
    },
    rating: 4.3,
    inStock: true,
    isNew: true,
    isFeatured: true,
  },
];

export const newProducts: Product[] = [
  {
    id: '9',
    name: 'Masque Visage Hydratant',
    description: 'Masque tissu ultra-hydratant enrichi en acide hyaluronique et extraits de concombre. En 15 minutes, la peau est repulpée, rafraîchie et éclatante.',
    price: 8.90,
    images: [
      'https://images.pexels.com/photos/3762873/pexels-photo-3762873.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      'https://images.pexels.com/photos/3762879/pexels-photo-3762879.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    ],
    category: 'Soin Visage',
    vendor: {
      id: '2',
      name: 'Natural Beauty',
    },
    rating: 4.2,
    inStock: true,
    isNew: true,
  },
  {
    id: '10',
    name: 'Fond de Teint Lumineux',
    description: 'Fond de teint fluide à la couvrance modulable et au fini lumineux. Enrichi en actifs hydratants, il unifie le teint tout en apportant de l\'éclat à la peau.',
    price: 39.00,
    images: [
      'https://images.pexels.com/photos/2312369/pexels-photo-2312369.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      'https://images.pexels.com/photos/7206266/pexels-photo-7206266.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    ],
    category: 'Maquillage',
    vendor: {
      id: '1',
      name: 'Glamour Cosmetics',
    },
    rating: 4.5,
    inStock: true,
    isNew: true,
  },
  {
    id: '11',
    name: 'Gommage Corps Exfoliant',
    description: 'Gommage corps aux cristaux de sucre et huiles essentielles qui élimine les cellules mortes et affine le grain de peau. La peau est douce, lisse et prête à recevoir les soins hydratants.',
    price: 28.50,
    discountedPrice: 22.80,
    images: [
      'https://images.pexels.com/photos/7796594/pexels-photo-7796594.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      'https://images.pexels.com/photos/7796583/pexels-photo-7796583.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    ],
    category: 'Corps & Bain',
    vendor: {
      id: '2',
      name: 'Natural Beauty',
    },
    rating: 4.3,
    inStock: true,
    isNew: true,
  },
  {
    id: '12',
    name: 'Parfum Intense Oriental',
    description: 'Une fragrance orientale et sensuelle aux notes de vanille, ambre et bois précieux. Un parfum enveloppant et chaleureux, idéal pour les soirées.',
    price: 95.00,
    images: [
      'https://images.pexels.com/photos/755992/pexels-photo-755992.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      'https://images.pexels.com/photos/965989/pexels-photo-965989.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    ],
    category: 'Parfums',
    vendor: {
      id: '3',
      name: 'Parfums de Paris',
    },
    rating: 4.8,
    inStock: true,
    isNew: true,
  },
];

export const getProductById = (id: string): Product | undefined => {
  return [...featuredProducts, ...newProducts].find(product => product.id === id);
};

export const getVendorById = (id: string): Vendor | undefined => {
  return vendors.find(vendor => vendor.id === id);
};

export const getProductsByVendor = (vendorId: string): Product[] => {
  return [...featuredProducts, ...newProducts].filter(product => product.vendor.id === vendorId);
};

export const getProductsByCategory = (categoryName: string): Product[] => {
  return [...featuredProducts, ...newProducts].filter(product => product.category === categoryName);
};