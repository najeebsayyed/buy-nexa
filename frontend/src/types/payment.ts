/**
 * Payment and Order types for PayPal Sandbox checkout.
 */

export type OrderStatus = 'PENDING_APPROVAL' | 'APPROVED' | 'COMPLETED' | 'CANCELLED' | 'FAILED'

export interface CreatePayPalOrderRequest {
  cart_id: string
}

export interface CreatePayPalOrderResponse {
  local_order_id: string
  paypal_order_id: string
  status: string
}

export interface CapturePayPalOrderResponse {
  local_order_id: string
  paypal_order_id: string
  status: OrderStatus
  capture_id: string | null
  amount_minor: number
  currency: string
}

export interface OrderItemSummary {
  sku: string
  title: string
  quantity: number
  unit_price_minor: number
  line_total_minor: number
}

export interface OrderReceipt {
  order_id: string
  paypal_order_id: string
  status: OrderStatus
  capture_id: string | null
  items: OrderItemSummary[]
  total_minor: number
  currency: string
  created_at: string
  sandbox_disclosure: string
}
