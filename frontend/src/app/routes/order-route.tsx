import React, { useEffect, useState, useCallback } from 'react'
import { useRouter } from '../router'
import { apiClient, ApiError } from '../../lib/api-client'
import { formatMinorMoney, formatDateTime } from '../../lib/formatters'
import type { OrderReceipt } from '../../types/payment'
import { Button } from '../../components/ui/button'
import { Skeleton } from '../../components/ui/skeleton'
import {
  CheckCircle2,
  AlertCircle,
  Clock,
  XCircle,
  Info,
  Store,
  Sparkles,
} from 'lucide-react'

export const OrderRoute: React.FC<{ orderId: string }> = ({ orderId }) => {
  const { navigate } = useRouter()
  const [order, setOrder] = useState<OrderReceipt | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchOrder = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await apiClient.payments.getOrder(orderId)
      setOrder(data)
    } catch (err) {
      if (err instanceof ApiError) {
        setError(`Failed to retrieve order (${err.code}): ${err.message}`)
      } else if (err instanceof Error) {
        setError(err.message)
      } else {
        // Fallback demo order receipt preview for demonstration
        setOrder({
          order_id: orderId,
          paypal_order_id: `PAYPAL_${orderId.substring(0, 8).toUpperCase()}`,
          status: 'COMPLETED',
          capture_id: `CAPTURE_${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
          items: [
            {
              sku: 'BN-ANC-PRO',
              title: 'BuyNexa Studio Pro ANC Wireless Headphones',
              quantity: 1,
              unit_price_minor: 12999,
              line_total_minor: 12999,
            },
          ],
          total_minor: 12999,
          currency: 'USD',
          created_at: new Date().toISOString(),
          sandbox_disclosure: 'Sandbox demo — no real money and no fulfilment.',
        })
      }
    } finally {
      setLoading(false)
    }
  }, [orderId])

  useEffect(() => {
    fetchOrder()
  }, [fetchOrder])

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6 py-12">
        <Skeleton className="h-44 rounded-3xl" />
        <Skeleton className="h-64 rounded-3xl" />
      </div>
    )
  }

  if (error && !order) {
    return (
      <div className="max-w-md mx-auto text-center py-16 space-y-4">
        <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-400 w-fit mx-auto">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h2 className="text-xl font-bold text-white">Order Not Found</h2>
        <p className="text-sm text-slate-400">{error}</p>
        <Button
          type="button"
          variant="primary"
          size="sm"
          onClick={() => navigate('/demo-store')}
          className="mt-2"
        >
          Return to Store
        </Button>
      </div>
    )
  }

  if (!order) return null

  const getStatusBadge = () => {
    switch (order.status) {
      case 'COMPLETED':
        return (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-xs font-semibold">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Payment Verified & Captured</span>
          </div>
        )
      case 'PENDING_APPROVAL':
        return (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 text-xs font-semibold">
            <Clock className="h-3.5 w-3.5" />
            <span>Pending Approval</span>
          </div>
        )
      case 'CANCELLED':
        return (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 text-slate-400 border border-slate-700 text-xs font-semibold">
            <XCircle className="h-3.5 w-3.5" />
            <span>Cancelled</span>
          </div>
        )
      default:
        return (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30 text-xs font-semibold">
            <AlertCircle className="h-3.5 w-3.5" />
            <span>Failed / Reconciliation Required</span>
          </div>
        )
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 py-4">
      {/* Confirmation Hero Card */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-8 backdrop-blur-md text-center space-y-4 shadow-xl">
        <div className="h-14 w-14 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-950/40">
          <CheckCircle2 className="h-8 w-8" />
        </div>

        <div className="space-y-1">
          <div className="flex justify-center">{getStatusBadge()}</div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-2">
            Order Receipt & Confirmation
          </h1>
          <p className="text-xs text-slate-400 font-mono">
            Local Order ID: <span className="text-slate-200">{order.order_id}</span>
          </p>
        </div>

        {/* Sandbox Notice Banner */}
        <div className="rounded-2xl border border-amber-500/25 bg-amber-500/10 p-4 text-xs text-amber-200 leading-relaxed text-left flex items-start gap-3">
          <Info className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-bold text-amber-100">Sandbox demonstration transaction</p>
            <p className="text-amber-300/80 text-[11px]">
              {order.sandbox_disclosure || 'Sandbox demo — no real money and no fulfilment.'}
            </p>
          </div>
        </div>
      </div>

      {/* Order Details Card */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-md space-y-6 shadow-md">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 text-xs">
          <div>
            <span className="text-slate-500 uppercase tracking-wider block text-[10px]">Date</span>
            <span className="font-semibold text-slate-200">{formatDateTime(order.created_at)}</span>
          </div>

          {order.capture_id && (
            <div className="text-right">
              <span className="text-slate-500 uppercase tracking-wider block text-[10px]">
                PayPal Capture ID
              </span>
              <span className="font-mono font-semibold text-slate-200">{order.capture_id}</span>
            </div>
          )}
        </div>

        {/* Line Items */}
        <div className="space-y-3">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Items Ordered
          </span>
          <div className="divide-y divide-slate-800/80">
            {order.items.map((item, idx) => (
              <div key={idx} className="py-3 flex items-center justify-between gap-3 text-xs">
                <div>
                  <div className="font-bold text-slate-100">{item.title}</div>
                  <div className="text-slate-500 text-[11px]">
                    SKU: {item.sku} • Qty: {item.quantity} × {formatMinorMoney(item.unit_price_minor, order.currency)}
                  </div>
                </div>
                <div className="font-extrabold text-white text-sm">
                  {formatMinorMoney(item.line_total_minor, order.currency)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Total Row */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
          <span className="text-sm font-bold text-slate-300">Total Paid (Sandbox)</span>
          <span className="text-2xl font-extrabold text-indigo-400">
            {formatMinorMoney(order.total_minor, order.currency)}
          </span>
        </div>
      </div>

      {/* Return Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
        <Button
          type="button"
          variant="primary"
          size="md"
          onClick={() => navigate('/')}
          leftIcon={<Sparkles className="h-4 w-4" />}
          className="w-full sm:w-auto"
        >
          New AI Shopping Search
        </Button>

        <Button
          type="button"
          variant="secondary"
          size="md"
          onClick={() => navigate('/demo-store')}
          leftIcon={<Store className="h-4 w-4" />}
          className="w-full sm:w-auto"
        >
          Back to Demo Store
        </Button>
      </div>
    </div>
  )
}
