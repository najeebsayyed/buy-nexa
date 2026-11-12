import React from 'react'
import { Link } from '../../app/router'
import { ShoppingBag, Sparkles } from 'lucide-react'

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-800/80 bg-slate-950/80 mt-auto py-12 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col gap-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-slate-900">
          {/* Brand Column */}
          <div className="md:col-span-2 space-y-3">
            <Link to="/" className="flex items-center gap-2.5 text-white font-bold text-base">
              <div className="h-7 w-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                <ShoppingBag className="h-4 w-4" />
              </div>
              <span className="tracking-tight">BuyNexa</span>
            </Link>
            <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
              Your AI shopping copilot. Tell us what you need. Discover, compare and choose with confidence.
            </p>
          </div>

          {/* Navigation Column */}
          <div className="space-y-3">
            <h4 className="font-semibold text-slate-200 text-xs tracking-wider uppercase">
              Platform
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link
                  to="/"
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  Discover
                </Link>
              </li>
              <li>
                <Link
                  to="/compare"
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  Compare
                </Link>
              </li>
              <li>
                <Link
                  to="/demo-store"
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  Demo Store
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal / Trust Column */}
          <div className="space-y-3">
            <h4 className="font-semibold text-slate-200 text-xs tracking-wider uppercase">
              Trust & Legal
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link
                  to="/privacy"
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/terms"
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright & Disclaimer Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500 text-[11px]">
          <div>
            © 2026 BuyNexa. All rights reserved.
          </div>
          <div className="flex items-center gap-2 text-slate-500">
            <Sparkles className="h-3 w-3 text-indigo-400" />
            <span>AI-Assisted Shopping Copilot</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
