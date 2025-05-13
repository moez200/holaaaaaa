import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product } from '../types';

interface WishlistContextType {
  items: Product[];
  addToWishlist: (Product: Product) => void;
  removeFromWishlist: (ProductId: number) => void;
  isInWishlist: (ProductId: number) => boolean;
  clearWishlist: () => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}

interface WishlistProviderProps {
  children: ReactNode;
}

export function WishlistProvider({ children }: WishlistProviderProps) {
  const [items, setItems] = useState<Product[]>([]);

  useEffect(() => {
    const savedWishlist = localStorage.getItem('wishlist');
    if (savedWishlist) {
      try {
        const parsed = JSON.parse(savedWishlist);
        const validItems = parsed.filter(
          (item: any) => item && typeof item.id === 'number' && item.nom && item.prix
        );
        setItems(validItems);
      } catch (err) {
        console.error('Error parsing wishlist from localStorage:', err);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('wishlist', JSON.stringify(items));
  }, [items]);

  const addToWishlist = (Product: Product) => {
    setItems((prevItems) => {
      const exists = prevItems.some((item) => item.id === Product.id);
      if (exists) return prevItems;
      return [...prevItems, Product];
    });
  };

  const removeFromWishlist = (ProductId: number) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== ProductId));
  };

  const isInWishlist = (ProductId: number) => {
    return items.some((item) => item.id === ProductId);
  };

  const clearWishlist = () => {
    setItems([]);
  };

  const value = {
    items,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    clearWishlist,
  };

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}