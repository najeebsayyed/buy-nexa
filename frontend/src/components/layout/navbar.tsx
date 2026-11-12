import React, { useState } from 'react'
import { Link, useRouter } from '../../app/router'
import { useCart } from '../../features/cart/cart-context'
import { useComparison } from '../../features/comparison/comparison-context'
import {
  ShoppingBag,
  Sparkles,
  Scale,
  Store,
  Menu,
  X,
  ArrowRight,
} from 'lucide-react'

export const Navbar: React.FC = () => {
  const { currentRoute } = useRouter()
  const { itemCount } = useCart()
  const { count: compareCount } = useComparison()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navLinks = [
    { to: '/', label: 'Discover', icon: Sparkles },
    {
      to: '/compare',
      label: 'Compare',
      icon: Scale,
      badge: compareCount > 0 ? compareCount : undefined,
    },
    { to: '/demo-store', label: 'Demo Store', icon: Store },
  ]

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand Identity */}
        <Link
          to="/"
          className="flex items-center gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-xl p-1 transition-transform"
        >
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-500 via-indigo-600 to-violet-600 flex items-center justify-center shadow-md shadow-indigo-600/20 group-hover:scale-105 transition-transform duration-200">
            <ShoppingBag className="h-5 w-5 text-white" />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-lg tracking-tight text-white group-hover:text-slate-100 transition-colors">
              BuyNexa
            </span>
            <span className="hidden sm:inline-flex px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              AI Copilot
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav
          className="hidden md:flex items-center gap-1 bg-slate-900/60 p-1 rounded-2xl border border-slate-800"
          aria-label="Primary"
        >
          {navLinks.map((link) => {
            const Icon = link.icon
            const isActive =
              currentRoute.path === link.to ||
              (link.to !== '/' && currentRoute.path.startsWith(link.to))
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`relative px-4 py-1.5 rounded-xl text-xs font-medium transition-all duration-150 flex items-center gap-2 select-none ${
                  isActive
                    ? 'bg-slate-800 text-white shadow-sm border border-slate-700/60'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850/60'
                }`}
              >
                <Icon
                  className={`h-3.5 w-3.5 ${
                    isActive ? 'text-indigo-400' : 'text-slate-500'
                  }`}
                />
                <span>{link.label}</span>
                {link.badge !== undefined && (
                  <span className="ml-1 px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-indigo-500 text-white">
                    {link.badge}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Actions (Cart & Mobile Menu) */}
        <div className="flex items-center gap-3">
          {/* Cart Trigger */}
          <Link
            to="/cart"
            className="relative p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-all select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 group"
            aria-label={`Shopping cart with ${itemCount} items`}
          >
            <ShoppingBag className="h-4 w-4 transition-transform group-hover:scale-110" />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center shadow-sm">
                {itemCount}
              </span>
            )}
          </Link>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 transition-colors"
            aria-expanded={mobileMenuOpen}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-800 bg-slate-950/95 px-4 py-4 space-y-2 backdrop-blur-xl animate-fade-in">
          {navLinks.map((link) => {
            const Icon = link.icon
            const isActive =
              currentRoute.path === link.to ||
              (link.to !== '/' && currentRoute.path.startsWith(link.to))
            return (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between p-3 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-slate-800 text-white border border-slate-700/60'
                    : 'text-slate-300 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`h-4 w-4 ${
                      isActive ? 'text-indigo-400' : 'text-slate-400'
                    }`}
                  />
                  <span>{link.label}</span>
                </div>
                {link.badge !== undefined ? (
                  <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-indigo-500 text-white">
                    {link.badge}
                  </span>
                ) : (
                  <ArrowRight className="h-3.5 w-3.5 text-slate-600" />
                )}
              </Link>
            )
          })}
        </div>
      )}
    </header>
  )
}
