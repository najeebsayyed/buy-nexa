import React, { useState } from 'react'
import { useRouter, Link } from '../router'
import { useCart } from '../../features/cart/cart-context'
import { formatMinorMoney } from '../../lib/formatters'
import { PayPalCheckoutButton } from '../../components/checkout/paypal-button'
import { Button } from '../../components/ui/button'
import {
  ShieldCheck,
  Info,
  ArrowLeft,
  CheckCircle2,
  Lock,
} from 'lucide-react'

export const CheckoutRoute: React.FC = () => {
  const { navigate } = useRouter()
  const { cart } = useCart()
  const [checkoutError, setCheckoutError] = useState<string | null>(null)

  if (!cart || cart.items.length === 0) {
    return (
      <div className="max-w-md mx-auto text-center py-20 space-y-4">
        <h2 className="text-xl font-bold text-white">No Items in Cart</h2>
        <p className="text-sm text-slate-400">
          Your cart must contain at least one item from the Sandbox Store before checkout.
        </p>
        <Button
          type="button"
          variant="primary"
          size="md"
          onClick={() => navigate('/demo-store')}
          leftIcon={<ArrowLeft className="h-4 w-4" />}
        >
          Return to Store
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-mono text-indigo-400 uppercase tracking-wider font-semibold">
            PayPal Orders v2
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            PayPal Sandbox Checkout
          </h1>
        </div>

        <Link
          to="/cart"
          className="text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Edit Cart
        </Link>
      </div>

      {/* Mandatory Sandbox Disclosure */}
      <div className="rounded-3xl border border-amber-500/30 bg-amber-500/10 p-5 sm:p-6 text-xs text-amber-200 leading-relaxed flex items-start gap-4 shadow-lg">
        <Info className="h-6 w-6 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-amber-100">
            Sandbox demo — no real money and no fulfilment.
          </h3>
          <p className="text-amber-300/80">
            This checkout connects to PayPal's Sandbox testing environment. You can use standard PayPal Sandbox buyer test credentials or test card payments. No actual funds will be transferred and no physical items will be shipped.
          </p>
        </div>
      </div>

      {/* Checkout Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Left Column: Order Summary */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-md space-y-5">
          <h2 className="text-base font-bold text-white pb-3 border-b border-slate-800">
            Order Review
          </h2>

          <div className="space-y-3 divide-y divide-slate-800/80">
            {cart.items.map((item) => (
              <div key={item.sku} className="pt-3 first:pt-0 flex items-center justify-between gap-3 text-xs">
                <div className="space-y-0.5">
                  <span className="font-bold text-slate-200">{item.title}</span>
                  <div className="text-slate-500">
                    Qty: {item.quantity} × {formatMinorMoney(item.unit_price_minor, item.currency)}
                  </div>
                </div>
                <span className="font-extrabold text-white">
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
              <span>Sandbox Handling</span>
              <span className="text-emerald-400 font-medium">Free</span>
            </div>
            <div className="flex justify-between text-sm font-extrabold text-white pt-2 border-t border-slate-800/60">
              <span>Total Due</span>
              <span className="text-lg text-indigo-400">
                {formatMinorMoney(cart.total_minor, cart.currency)}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: PayPal Button & Trust Guarantees */}
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 backdrop-blur-md shadow-xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5 text-indigo-400" />
                Customer Approval Interface
              </span>
              <span className="text-[10px] font-mono text-emerald-400 uppercase">
                Encrypted
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
          </div>

          {/* Security & Invariants Card */}
          <div className="rounded-2xl border border-slate-800/80 bg-slate-950/40 p-5 space-y-3 text-xs text-slate-400">
            <div className="text-slate-300 font-semibold flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>Architectural Payment Invariants</span>
            </div>
            <ul className="space-y-2 text-[11px] leading-relaxed">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>Client sends only identifiers; FastAPI reloads catalog pricing from DB.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>Orders v2 capture runs server-side with verified status checks.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>PayPal secrets remain strictly confidential in backend settings.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
