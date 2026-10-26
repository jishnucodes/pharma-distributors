"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { Product, InquiryItem } from "@/types";

interface InquiryContextType {
  items: InquiryItem[];
  addItem: (product: Product, quantity?: string) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: string) => void;
  clearTray: () => void;
  isInTray: (productId: string) => boolean;
  isOpen: boolean;
  openInquiry: (initialProduct?: Product | null) => void;
  closeInquiry: () => void;
  activeProduct: Product | null;
  totalCount: number;
}

const InquiryContext = createContext<InquiryContextType | undefined>(undefined);

interface InquiryProviderProps {
  children: React.ReactNode;
  companySlug: string;
}

export function InquiryProvider({ children, companySlug }: InquiryProviderProps) {
  const [items, setItems] = useState<InquiryItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const storageKey = `lk_inquiry_tray_${companySlug}`;

  // Hydrate from localStorage on client load
  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setItems(parsed);
        }
      }
    } catch (e) {
      console.error("Failed to load inquiry tray:", e);
    } finally {
      setIsLoaded(true);
    }
  }, [storageKey]);

  // Persist to localStorage on change
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify(items));
    } catch (e) {
      console.error("Failed to persist inquiry tray:", e);
    }
  }, [items, isLoaded, storageKey]);

  const isInTray = useCallback(
    (productId: string) => {
      return items.some((item) => item.product.id === productId);
    },
    [items]
  );

  const addItem = useCallback(
    (product: Product, quantity?: string) => {
      setItems((prev) => {
        const existingIdx = prev.findIndex((i) => i.product.id === product.id);
        if (existingIdx >= 0) {
          // If already in tray, update quantity if provided
          if (quantity !== undefined) {
            const updated = [...prev];
            updated[existingIdx] = { ...updated[existingIdx], quantity };
            return updated;
          }
          return prev;
        }
        return [...prev, { product, quantity: quantity || "" }];
      });
    },
    []
  );

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => prev.filter((i) => i.product.id !== productId));
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: string) => {
    setItems((prev) =>
      prev.map((i) =>
        i.product.id === productId ? { ...i, quantity } : i
      )
    );
  }, []);

  const clearTray = useCallback(() => {
    setItems([]);
  }, []);

  const openInquiry = useCallback((initialProduct: Product | null = null) => {
    if (initialProduct) {
      // If user opened with a specific product, also ensure it's in the tray
      addItem(initialProduct);
      setActiveProduct(initialProduct);
    } else {
      setActiveProduct(null);
    }
    setIsOpen(true);
  }, [addItem]);

  const closeInquiry = useCallback(() => {
    setIsOpen(false);
    setActiveProduct(null);
  }, []);

  return (
    <InquiryContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearTray,
        isInTray,
        isOpen,
        openInquiry,
        closeInquiry,
        activeProduct,
        totalCount: items.length,
      }}
    >
      {children}
    </InquiryContext.Provider>
  );
}

const defaultInquiryContext: InquiryContextType = {
  items: [],
  addItem: () => {},
  removeItem: () => {},
  updateQuantity: () => {},
  clearTray: () => {},
  isInTray: () => false,
  isOpen: false,
  openInquiry: () => {},
  closeInquiry: () => {},
  activeProduct: null,
  totalCount: 0,
};

export function useInquiry() {
  const context = useContext(InquiryContext);
  return context || defaultInquiryContext;
}
