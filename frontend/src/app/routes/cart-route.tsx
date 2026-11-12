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
  ArrowLeft,
} from 'lucide-react'

export const CartRoute: React.FC = () => {
  const { navigate } = useRouter()
  const { cart, loading, updateQuantity, removeItem } = useCart()

  if (!cart || cart.items.length === 0) {
    return (
      <div className="max-w-md mx-auto text-center py-20 space-y-5 animate-fade-in">
        <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-slate-500 w-fit mx-auto shadow-md">
          <ShoppingBag className="h-8 w-8" />
        </div>
        <div className="space-y-1.5">
          <h1 className="text-2xl font-bold text-white">Your Cart is Empty</h1>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            Discover products through AI recommendations or browse the BuyNexa collection.
          </p>
        </div>
        <Button
          type="button"
          variant="primary"
          size="md"
          onClick={() => navigate('/demo-store')}
          leftIcon={<ArrowLeft className="h-4 w-4" />}
          className="mt-2 text-xs"
        >
          Browse Store
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-2 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-semibold text-indigo-400 uppercase tracking-wider">
            Review Order
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            Shopping Cart ({cart.item_count} {cart.item_count === 1 ? 'item' : 'items'})
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Items List */}
        <div className="lg:col-span-2 space-y-3">
          {cart.items.map((item) => (
            <div
              key={item.sku}
              className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-4 sm:p-5 backdrop-blur-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm hover:border-slate-700/80 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-xl bg-slate-950 border border-slate-800 p-2 overflow-hidden shrink-0 flex items-center justify-center">
                  <img
                    src={item.image_url}
                    alt={item.title}
                    className="h-full w-full object-contain"
                  />
                </div>

                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-white line-clamp-1">{item.title}</h3>
                  <div className="text-xs text-indigo-400 font-semibold">
                    {formatMinorMoney(item.unit_price_minor, item.currency)} each
                  </div>
                </div>
              </div>

              {/* Quantity Controls & Line Total */}
              <div className="flex items-center justify-between sm:justify-end gap-5 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-800/80">
                <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-lg p-1">
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.sku, item.quantity - 1)}
                    disabled={loading}
                    className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-50 transition-colors"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="h-3 w-3" />
                  </button>

                  <span className="text-xs font-bold text-white w-5 text-center">
                    {item.quantity}
                  </span>

                  <button
                    type="button"
                    onClick={() => updateQuantity(item.sku, item.quantity + 1)}
                    disabled={loading}
                    className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-50 transition-colors"
                    aria-label="Increase quantity"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </div>

                <div className="text-sm font-extrabold text-white min-w-[65px] text-right">
                  {formatMinorMoney(item.line_total_minor, item.currency)}
                </div>

                <button
                  type="button"
                  onClick={() => removeItem(item.sku)}
                  disabled={loading}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800/60 transition-colors"
                  aria-label="Remove item from cart"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary & Checkout Card */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-6 backdrop-blur-md shadow-lg space-y-5">
            <h2 className="text-sm font-bold text-white pb-3 border-b border-slate-800 uppercase tracking-wider">
              Order Summary
            </h2>

            <div className="space-y-2.5 text-xs sm:text-sm">
              <div className="flex items-center justify-between text-slate-400">
                <span>Subtotal ({cart.item_count} items)</span>
                <span className="font-semibold text-slate-200">
                  {formatMinorMoney(cart.subtotal_minor, cart.currency)}
                </span>
              </div>

              <div className="flex items-center justify-between text-slate-400">
                <span>Standard Delivery</span>
                <span className="text-emerald-400 font-medium">Free</span>
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

            <Button
              type="button"
              variant="primary"
              size="lg"
              onClick={() => navigate('/checkout')}
              rightIcon={<ArrowRight className="h-4 w-4" />}
              className="w-full shadow-md font-semibold text-xs sm:text-sm rounded-xl"
            >
              Proceed to Checkout
            </Button>
          </div>

          <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500 text-center">
            <ShieldCheck className="h-3.5 w-3.5 text-slate-400" />
            <span>Secure 256-bit encrypted checkout</span>
          </div>
        </div>
      </div>
    </div>
  )
}
