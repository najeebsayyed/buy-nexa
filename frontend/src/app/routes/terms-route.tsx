import React from 'react'
import { Link } from '../router'
import { FileText, ArrowLeft } from 'lucide-react'

export const TermsRoute: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto py-8 space-y-8 animate-fade-in">
      <div className="space-y-3">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Discover
        </Link>
        <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
          <FileText className="h-4 w-4" />
          <span>Terms & Conditions</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Terms of Service</h1>
        <p className="text-sm text-slate-400">Last updated: November 2026</p>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 sm:p-8 space-y-6 text-sm text-slate-300 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-white">1. Service Description</h2>
          <p>
            BuyNexa provides an AI-assisted shopping discovery and comparison platform. We assist consumers by structuring product requirements, evaluating merchant catalog feeds, and presenting comparative evidence.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-white">2. Product Data & Disclosures</h2>
          <p>
            Product specifications, prices, and availability are derived from merchant catalog feeds at the time of inquiry. While BuyNexa enforces rigorous grounding standards, users should verify final pricing, warranty terms, and merchant return policies directly on the retailer's checkout page prior to purchase.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-white">3. Demo Store & Testing Notice</h2>
          <p>
            The BuyNexa Demo Store is a demonstration environment designed for evaluating the checkout experience. Transactions executed in demonstration mode are test payments that carry no real financial obligation and do not generate physical shipment or order fulfilment.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-white">4. Acceptable Use</h2>
          <p>
            Users agree to use BuyNexa solely for legitimate shopping research and personal purchasing evaluation, in accordance with applicable laws and acceptable use guidelines.
          </p>
        </section>
      </div>
    </div>
  )
}
