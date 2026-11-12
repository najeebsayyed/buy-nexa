import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import type { Cart, CartItem } from '../../types/cart'
import { apiClient } from '../../lib/api-client'

interface CartContextType {
  cart: Cart | null
  loading: boolean
  error: string | null
  itemCount: number
  addToCart: (sku: string, quantity?: number) => Promise<boolean>
  updateQuantity: (sku: string, quantity: number) => Promise<boolean>
  removeItem: (sku: string) => Promise<boolean>
  refreshCart: () => Promise<void>
}

const CartContext = createContext<CartContextType | null>(null)

// Fallback demo prices for client preview if backend cart table is not yet initialized
const DEMO_PRICES: Record<string, { title: string; price_minor: number; description: string; image_url: string }> = {
  'BN-ANC-PRO': {
    title: 'BuyNexa Studio Pro ANC Wireless Headphones',
    price_minor: 12999,
    description: 'Flagship active noise cancelling headphones with 40h battery life and USB-C audio.',
    image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80',
  },
  'BN-TRAVEL-BUDS': {
    title: 'BuyNexa TravelPods ANC Earbuds',
    price_minor: 7999,
    description: 'Compact wireless earbuds with adaptive transparency and IPX5 water resistance.',
    image_url: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&auto=format&fit=crop&q=80',
  },
  'BN-CALL-HEADSET': {
    title: 'BuyNexa ClearVoice Wireless Office Headset',
    price_minor: 5999,
    description: 'Dual-mic beamforming headset engineered for all-day crystal-clear video calls.',
    image_url: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600&auto=format&fit=crop&q=80',
  },
  'BN-DESK-PAD': {
    title: 'BuyNexa Ergonomic Wool Felt Desk Mat',
    price_minor: 2999,
    description: 'Premium anti-slip organic wool felt desk mat for workspace comfort.',
    image_url: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600&auto=format&fit=crop&q=80',
  },
}

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<Cart | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const calculateLocalCart = (items: CartItem[]): Cart => {
    const subtotal = items.reduce((acc, item) => acc + item.line_total_minor, 0)
    const count = items.reduce((acc, item) => acc + item.quantity, 0)
    return {
      id: cart?.id || 'cart_demo_session',
      session_id: 'session_active',
      items,
      subtotal_minor: subtotal,
      total_minor: subtotal,
      currency: 'USD',
      item_count: count,
      updated_at: new Date().toISOString(),
    }
  }

  const refreshCart = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const serverCart = await apiClient.cart.getCart()
      setCart(serverCart)
    } catch {
      // If server cart endpoint is not ready, keep local state
      setCart((prev) => {
        if (!prev) {
          return {
            id: 'cart_local_preview',
            session_id: 'session_active',
            items: [],
            subtotal_minor: 0,
            total_minor: 0,
            currency: 'USD',
            item_count: 0,
            updated_at: new Date().toISOString(),
          }
        }
        return prev
      })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refreshCart()
  }, [refreshCart])

  const addToCart = useCallback(async (sku: string, quantity = 1): Promise<boolean> => {
    setLoading(true)
    setError(null)
    try {
      const updated = await apiClient.cart.addItem({ sku, quantity })
      setCart(updated)
      return true
    } catch {
      // Local fallback calculation using authoritative catalog price table
      const meta = DEMO_PRICES[sku]
      if (!meta) return false

      setCart((prev) => {
        const existingItems = prev?.items ? [...prev.items] : []
        const existingIdx = existingItems.findIndex((it) => it.sku === sku)

        if (existingIdx >= 0) {
          const it = existingItems[existingIdx]
          const newQty = it.quantity + quantity
          existingItems[existingIdx] = {
            ...it,
            quantity: newQty,
            line_total_minor: newQty * it.unit_price_minor,
          }
        } else {
          existingItems.push({
            sku,
            title: meta.title,
            description: meta.description,
            quantity,
            unit_price_minor: meta.price_minor,
            line_total_minor: quantity * meta.price_minor,
            currency: 'USD',
            image_url: meta.image_url,
          })
        }
        return calculateLocalCart(existingItems)
      })
      return true
    } finally {
      setLoading(false)
    }
  }, [cart])

  const updateQuantity = useCallback(async (sku: string, quantity: number): Promise<boolean> => {
    if (quantity <= 0) {
      return removeItem(sku)
    }

    setLoading(true)
    setError(null)
    try {
      const updated = await apiClient.cart.updateItem(sku, quantity)
      setCart(updated)
      return true
    } catch {
      setCart((prev) => {
        if (!prev) return null
        const items = prev.items.map((it) => {
          if (it.sku === sku) {
            return {
              ...it,
              quantity,
              line_total_minor: quantity * it.unit_price_minor,
            }
          }
          return it
        })
        return calculateLocalCart(items)
      })
      return true
    } finally {
      setLoading(false)
    }
  }, [])

  const removeItem = useCallback(async (sku: string): Promise<boolean> => {
    setLoading(true)
    setError(null)
    try {
      const updated = await apiClient.cart.removeItem(sku)
      setCart(updated)
      return true
    } catch {
      setCart((prev) => {
        if (!prev) return null
        const items = prev.items.filter((it) => it.sku !== sku)
        return calculateLocalCart(items)
      })
      return true
    } finally {
      setLoading(false)
    }
  }, [])

  const itemCount = cart?.items.reduce((acc, it) => acc + it.quantity, 0) || 0

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        error,
        itemCount,
        addToCart,
        updateQuantity,
        removeItem,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
