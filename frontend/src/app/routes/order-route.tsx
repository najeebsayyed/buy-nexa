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
  ShoppingBag,
  ArrowRight,
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
        setError('An unexpected error occurred while loading your order confirmation.')
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
        <Skeleton className="h-44 rounded-2xl" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    )
  }

  if (error && !order) {
    return (
      <div className="max-w-md mx-auto text-center py-16 space-y-4 animate-fade-in">
        <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-400 w-fit mx-auto">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h2 className="text-xl font-bold text-white">Order Not Found</h2>
        <p className="text-xs sm:text-sm text-slate-400">{error}</p>
        <Button
          type="button"
          variant="primary"
          size="sm"
          onClick={() => navigate('/demo-store')}
          className="mt-2 text-xs"
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
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-xs font-semibold">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Payment Verified & Confirmed</span>
          </div>
        )
      case 'PENDING_APPROVAL':
        return (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 text-xs font-semibold">
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
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/20 text-xs font-semibold">
            <AlertCircle className="h-3.5 w-3.5" />
            <span>Payment Incomplete</span>
          </div>
        )
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 py-4 animate-fade-in">
      {/* Confirmation Hero Card */}
      <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-6 sm:p-8 backdrop-blur-md text-center space-y-4 shadow-lg">
        <div className="h-12 w-12 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-sm">
          <CheckCircle2 className="h-6 w-6" />
        </div>

        <div className="space-y-1">
          <div className="flex justify-center">{getStatusBadge()}</div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-2">
            Thank You for Your Order
          </h1>
          <p className="text-xs text-slate-400">
            Order Reference: <span className="font-mono text-slate-200">{order.order_id}</span>
          </p>
        </div>

        {/* Discreet Test Payment Disclosure */}
        <p className="text-[11px] text-slate-500 pt-2 border-t border-slate-800/80">
          Test payment — no real charge will be made.
        </p>
      </div>

      {/* Digital Receipt Card */}
      <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-6 backdrop-blur-md space-y-5 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
          <div>
            <span className="text-slate-500 uppercase tracking-wider block text-[10px]">Order Date</span>
            <span className="font-semibold text-slate-200">{formatDateTime(order.created_at)}</span>
          </div>

          {order.capture_id && (
            <div className="text-right">
              <span className="text-slate-500 uppercase tracking-wider block text-[10px]">Payment ID</span>
              <span className="font-mono text-slate-200">{order.capture_id}</span>
            </div>
          )}
        </div>

        {/* Purchased Items */}
        <div className="space-y-3">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            Items Purchased
          </span>
          <div className="space-y-2.5 divide-y divide-slate-800/60">
            {order.items.map((it, idx) => (
              <div key={idx} className="pt-2.5 first:pt-0 flex items-center justify-between gap-3 text-xs">
                <div className="space-y-0.5">
                  <div className="font-bold text-slate-200">{it.title}</div>
                  <div className="text-slate-500">
                    Quantity: {it.quantity} × {formatMinorMoney(it.unit_price_minor, order.currency)}
                  </div>
                </div>
                <div className="font-bold text-white">
                  {formatMinorMoney(it.line_total_minor, order.currency)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Total Summary */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-sm">
          <span className="font-bold text-slate-300">Total Paid</span>
          <span className="text-lg font-extrabold text-indigo-400">
            {formatMinorMoney(order.total_minor, order.currency)}
          </span>
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        <Button
          type="button"
          variant="primary"
          size="md"
          onClick={() => navigate('/')}
          leftIcon={<ShoppingBag className="h-4 w-4" />}
          className="w-full sm:w-auto text-xs"
        >
          Discover More Products
        </Button>
        <Button
          type="button"
          variant="outline"
          size="md"
          onClick={() => navigate('/demo-store')}
          rightIcon={<ArrowRight className="h-4 w-4" />}
          className="w-full sm:w-auto text-xs"
        >
          Return to Store
        </Button>
      </div>
    </div>
  )
}
