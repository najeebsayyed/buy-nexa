import React from 'react'
import { Link } from '../router'
import { ShieldCheck, ArrowLeft } from 'lucide-react'

export const PrivacyRoute: React.FC = () => {
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
          <ShieldCheck className="h-4 w-4" />
          <span>Privacy & Data Protection</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Privacy Policy</h1>
        <p className="text-sm text-slate-400">Last updated: November 2026</p>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 sm:p-8 space-y-6 text-sm text-slate-300 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-white">1. Information We Process</h2>
          <p>
            BuyNexa is designed with privacy-first principles. We process your natural language shopping requirements to extract product preferences, budget constraints, and must-have features. Shopping briefs are tied only to anonymous, cryptographically hashed session identifiers stored via secure HttpOnly session cookies.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-white">2. Product Discovery & Retailer Links</h2>
          <p>
            When you explore external merchant recommendations, outbound links navigate directly to third-party merchant websites. BuyNexa does not share personal identifying information with external retailers.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-white">3. Payment & Transaction Security</h2>
          <p>
            For purchases made through the BuyNexa Demo Store, payment interactions are processed securely through PayPal. Financial details and payment credentials are never captured, processed, or stored on BuyNexa servers.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-white">4. Data Retention & Control</h2>
          <p>
            Session records are automatically expired after their retention period. We do not sell your shopping data, build behavioral advertising profiles, or track you across external sites.
          </p>
        </section>
      </div>
    </div>
  )
}
