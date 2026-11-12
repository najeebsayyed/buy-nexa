import React, { useState } from 'react'
import { useRouter, Link } from '../router'
import { useCart } from '../../features/cart/cart-context'
import { formatMinorMoney } from '../../lib/formatters'
import { PayPalCheckoutButton } from '../../components/checkout/paypal-button'
import { Button } from '../../components/ui/button'
import {
  ShieldCheck,
  ArrowLeft,
  Lock,
} from 'lucide-react'

export const CheckoutRoute: React.FC = () => {
  const { navigate } = useRouter()
  const { cart } = useCart()
  const [checkoutError, setCheckoutError] = useState<string | null>(null)

  if (!cart || cart.items.length === 0) {
    return (
      <div className="max-w-md mx-auto text-center py-20 space-y-4 animate-fade-in">
        <h2 className="text-xl font-bold text-white">No Items in Cart</h2>
        <p className="text-xs sm:text-sm text-slate-400">
          Your cart is currently empty. Add products from the store before checkout.
        </p>
        <Button
          type="button"
          variant="primary"
          size="md"
          onClick={() => navigate('/demo-store')}
          leftIcon={<ArrowLeft className="h-4 w-4" />}
          className="text-xs"
        >
          Return to Store
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-2 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-semibold text-indigo-400 uppercase tracking-wider">
            Checkout
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            Complete Your Purchase
          </h1>
        </div>

        <Link
          to="/cart"
          className="text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Edit Cart
        </Link>
      </div>

      {/* Checkout Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Left Column: Order Review */}
        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-6 backdrop-blur-md space-y-5 shadow-sm">
          <h2 className="text-xs font-bold text-white pb-3 border-b border-slate-800 uppercase tracking-wider">
            Order Items
          </h2>

          <div className="space-y-3 divide-y divide-slate-800/80">
            {cart.items.map((item) => (
              <div key={item.sku} className="pt-3 first:pt-0 flex items-center justify-between gap-3 text-xs">
                <div className="space-y-0.5">
                  <span className="font-semibold text-slate-200">{item.title}</span>
                  <div className="text-slate-500">
                    Qty: {item.quantity} × {formatMinorMoney(item.unit_price_minor, item.currency)}
                  </div>
                </div>
                <span className="font-bold text-white">
                  {formatMinorMoney(item.line_total_minor, item.currency)}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-800 space-y-2 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>Subtotal</span>
              <span className="font-semibold text-slate-200">
                {formatMinorMoney(cart.subtotal_minor, cart.currency)}
              </span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Standard Shipping</span>
              <span className="text-emerald-400 font-medium">Free</span>
            </div>
            <div className="flex justify-between text-sm font-extrabold text-white pt-2.5 border-t border-slate-800/60">
              <span>Total</span>
              <span className="text-lg text-indigo-400">
                {formatMinorMoney(cart.total_minor, cart.currency)}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: PayPal Button & Discreet Test Payment Notice */}
        <div className="space-y-5">
          <div className="rounded-2xl border border-slate-800/80 bg-slate-900/70 p-6 backdrop-blur-md shadow-lg space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5 text-indigo-400" />
                Payment Method
              </span>
              <span className="text-[10px] font-medium text-slate-400">
                Official PayPal Checkout
              </span>
            </div>

            {/* Official PayPal Buttons Container */}
            <PayPalCheckoutButton
              cartId={cart.id}
              onSuccess={(orderId) => {
                navigate(`/orders/${orderId}`)
              }}
              onError={(err) => setCheckoutError(err)}
            />

            {checkoutError && (
              <p className="text-xs text-rose-400 font-medium">{checkoutError}</p>
            )}

            {/* Discreet Required Disclosure */}
            <p className="text-[11px] text-slate-400 text-center leading-relaxed pt-2 border-t border-slate-800/80">
              Test payment — no real charge will be made.
            </p>
          </div>

          <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500 text-center">
            <ShieldCheck className="h-3.5 w-3.5 text-slate-400" />
            <span>Encrypted checkout session</span>
          </div>
        </div>
      </div>
    </div>
  )
}
