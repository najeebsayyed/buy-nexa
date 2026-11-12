/**
 * Demo catalog and server-priced cart types for BuyNexa Sandbox Store.
 */

export interface DemoCatalogItem {
  sku: string
  title: string
  description: string
  price_minor: number // Integer minor units (e.g. 12999 = $129.99)
  currency: string
  image_url: string
  category: string
  features: string[]
  in_stock: boolean
}

export interface CartItem {
  sku: string
  title: string
  description: string
  quantity: number
  unit_price_minor: number
  line_total_minor: number
  currency: string
  image_url: string
}

export interface Cart {
  id: string
  session_id: string
  items: CartItem[]
  subtotal_minor: number
  total_minor: number
  currency: string
  item_count: number
  updated_at: string
}

export interface AddToCartRequest {
  sku: string
  quantity: number
}

export interface UpdateCartItemRequest {
  sku: string
  quantity: number
}
