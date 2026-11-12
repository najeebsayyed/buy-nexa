import React from 'react'
import { useRouter, Link } from '../router'
import { useCart } from '../../features/cart/cart-context'
import { formatMinorMoney } from '../../lib/formatters'
import { Button } from '../../components/ui/button'
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShieldCheck,
  Info,
  ArrowLeft,
} from 'lucide-react'

export const CartRoute: React.FC = () => {
  const { navigate } = useRouter()
  const { cart, loading, updateQuantity, removeItem } = useCart()

  if (!cart || cart.items.length === 0) {
    return (
      <div className="max-w-md mx-auto text-center py-20 space-y-5">
        <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 text-slate-500 w-fit mx-auto shadow-lg">
          <ShoppingBag className="h-8 w-8" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-white">Your Cart is Empty</h1>
          <p className="text-sm text-slate-400 leading-relaxed">
            The BuyNexa cart holds items from our companion Sandbox Store. Add items to test server-side PayPal Sandbox order creation and capture.
          </p>
        </div>
        <Button
          type="button"
          variant="primary"
          size="md"
          onClick={() => navigate('/demo-store')}
          leftIcon={<ArrowLeft className="h-4 w-4" />}
          className="mt-2"
        >
          Explore Sandbox Store
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-2">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-mono text-indigo-400 uppercase tracking-wider font-semibold">
            Server-Authoritative Cart
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            Shopping Cart ({cart.item_count} items)
          </h1>
        </div>

        <Link
          to="/demo-store"
          className="text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Continue Shopping
        </Link>
      </div>

      {/* Main Grid: Cart Items & Order Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items List */}
        <div className="lg:col-span-2 space-y-4">
          {cart.items.map((item) => (
            <div
              key={item.sku}
              className="rounded-3xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm hover:border-slate-700/80 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="h-20 w-20 rounded-2xl bg-slate-950 border border-slate-800 p-2 overflow-hidden shrink-0 flex items-center justify-center">
                  <img
                    src={item.image_url}
                    alt={item.title}
                    className="h-full w-full object-contain"
                  />
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-slate-500 uppercase">
                    {item.sku}
                  </span>
                  <h3 className="text-sm font-bold text-white line-clamp-1">{item.title}</h3>
                  <div className="text-xs text-indigo-400 font-semibold">
                    {formatMinorMoney(item.unit_price_minor, item.currency)} each
                  </div>
                </div>
              </div>

              {/* Quantity Controls & Line Total */}
              <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-800/80">
                <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl p-1">
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.sku, item.quantity - 1)}
                    disabled={loading}
                    className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-50 transition-colors"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>

                  <span className="text-xs font-bold text-white w-6 text-center">
                    {item.quantity}
                  </span>

                  <button
                    type="button"
                    onClick={() => updateQuantity(item.sku, item.quantity + 1)}
                    disabled={loading}
                    className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-50 transition-colors"
                    aria-label="Increase quantity"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="text-sm font-extrabold text-white min-w-[70px] text-right">
                  {formatMinorMoney(item.line_total_minor, item.currency)}
                </div>

                <button
                  type="button"
                  onClick={() => removeItem(item.sku)}
                  disabled={loading}
                  className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-slate-800/60 transition-colors"
                  aria-label="Remove item from cart"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary & Checkout Card */}
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 backdrop-blur-md shadow-xl space-y-6">
            <h2 className="text-base font-bold text-white pb-3 border-b border-slate-800">
              Order Summary
            </h2>

            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between text-slate-400">
                <span>Subtotal ({cart.item_count} items)</span>
                <span className="font-semibold text-slate-200">
                  {formatMinorMoney(cart.subtotal_minor, cart.currency)}
                </span>
              </div>

              <div className="flex items-center justify-between text-slate-400">
                <span>Estimated Shipping</span>
                <span className="text-emerald-400 font-medium">Free (Sandbox)</span>
              </div>

              <div className="flex items-center justify-between text-slate-400">
                <span>Estimated Tax</span>
                <span className="font-semibold text-slate-200">$0.00</span>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-base font-extrabold text-white">
                <span>Total</span>
                <span className="text-xl text-indigo-400">
                  {formatMinorMoney(cart.total_minor, cart.currency)}
                </span>
              </div>
            </div>

            {/* Sandbox Notice in Summary */}
            <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-3 text-[11px] text-amber-200 leading-relaxed flex items-start gap-2.5">
              <Info className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
              <span>
                <strong>Sandbox demo:</strong> You will not be charged real money and no items will be delivered.
              </span>
            </div>

            <Button
              type="button"
              variant="primary"
              size="lg"
              onClick={() => navigate('/checkout')}
              rightIcon={<ArrowRight className="h-4 w-4" />}
              className="w-full shadow-lg shadow-indigo-600/30 font-semibold"
            >
              Proceed to PayPal Checkout
            </Button>
          </div>

          <div className="rounded-2xl border border-slate-800/80 bg-slate-950/40 p-4 text-xs text-slate-400 space-y-2">
            <div className="flex items-center gap-2 text-slate-300 font-semibold">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>Server-Authoritative Calculation</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              Cart prices are never calculated in the browser. Totals are derived from stored catalog prices in integer minor units upon server order creation.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
