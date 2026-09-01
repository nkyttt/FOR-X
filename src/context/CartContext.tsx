import React, { createContext, useContext, useState, useEffect } from 'react';
import { ProductItem, CartItem } from '../types';

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: ProductItem, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItemsCount: number;
  subtotal: number;
  discountAmount: number;
  couponCode: string;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;
  shippingFee: number;
  totalAmount: number;
  isCartDrawerOpen: boolean;
  setIsCartDrawerOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('cyberx_cart');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    return [];
  });

  const [couponCode, setCouponCode] = useState<string>(() => {
    return localStorage.getItem('cyberx_applied_coupon') || '';
  });

  const [discountPercent, setDiscountPercent] = useState<number>(() => {
    return localStorage.getItem('cyberx_applied_coupon') === 'CYBER20' ? 20 : 0;
  });

  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState<boolean>(false);

  useEffect(() => {
    localStorage.setItem('cyberx_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product: ProductItem, quantity = 1) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });
    setIsCartDrawerOpen(true);
  };

  const removeFromCart = (productId: string) => {
    setCartItems((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
    setCouponCode('');
    setDiscountPercent(0);
    localStorage.removeItem('cyberx_cart');
    localStorage.removeItem('cyberx_applied_coupon');
  };

  const applyCoupon = (code: string): { success: boolean; message: string } => {
    const cleanCode = code.trim().toUpperCase();
    if (cleanCode === 'CYBER20') {
      setCouponCode('CYBER20');
      setDiscountPercent(20);
      localStorage.setItem('cyberx_applied_coupon', 'CYBER20');
      return { success: true, message: 'CYBER20 applied: 20% discount added!' };
    }
    if (cleanCode === 'WELCOME10') {
      setCouponCode('WELCOME10');
      setDiscountPercent(10);
      localStorage.setItem('cyberx_applied_coupon', 'WELCOME10');
      return { success: true, message: 'WELCOME10 applied: 10% discount added!' };
    }
    return { success: false, message: 'Invalid coupon code. Try CYBER20 or WELCOME10' };
  };

  const removeCoupon = () => {
    setCouponCode('');
    setDiscountPercent(0);
    localStorage.removeItem('cyberx_applied_coupon');
  };

  const totalItemsCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const discountAmount = (subtotal * discountPercent) / 100;
  const shippingFee = subtotal > 100 || cartItems.length === 0 ? 0 : 9.99;
  const totalAmount = Math.max(0, subtotal - discountAmount + shippingFee);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItemsCount,
        subtotal,
        discountAmount,
        couponCode,
        applyCoupon,
        removeCoupon,
        shippingFee,
        totalAmount,
        isCartDrawerOpen,
        setIsCartDrawerOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
