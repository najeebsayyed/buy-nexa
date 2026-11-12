import React, { useEffect, useState } from 'react'
import { useRouter } from '../router'
import { useCart } from '../../features/cart/cart-context'
import { apiClient } from '../../lib/api-client'
import { formatMinorMoney } from '../../lib/formatters'
import type { DemoCatalogItem } from '../../types/cart'
import { Button } from '../../components/ui/button'
import { Skeleton } from '../../components/ui/skeleton'
import {
  Check,
  Plus,
  ArrowRight,
} from 'lucide-react'

// Built-in catalog items used when backend catalog table is in initial state
const SEED_CATALOG_ITEMS: DemoCatalogItem[] = [
  {
    sku: 'BN-ANC-PRO',
    title: 'BuyNexa Studio Pro ANC Wireless Headphones',
    description: 'Flagship active noise cancelling headphones with custom 40mm drivers, 40-hour battery life, and USB-C audio.',
    price_minor: 12999,
    currency: 'USD',
    image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80',
    category: 'Audio',
    features: ['Active Noise Cancellation', '40h Battery', 'Multipoint Bluetooth 5.3', 'USB-C Fast Charging'],
    in_stock: true,
  },
  {
    sku: 'BN-TRAVEL-BUDS',
    title: 'BuyNexa TravelPods ANC Earbuds',
    description: 'Ultra-compact wireless earbuds with adaptive transparency, IPX5 water resistance, and wireless charging case.',
    price_minor: 7999,
    currency: 'USD',
    image_url: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&auto=format&fit=crop&q=80',
    category: 'Audio',
    features: ['Adaptive Transparency', 'IPX5 Water Resistant', 'Wireless Charging Case', 'Voice Clarity Mic'],
    in_stock: true,
  },
  {
    sku: 'BN-CALL-HEADSET',
    title: 'BuyNexa ClearVoice Wireless Office Headset',
    description: 'Dual-mic beamforming headset engineered for all-day crystal-clear video conferences and ergonomic comfort.',
    price_minor: 5999,
    currency: 'USD',
    image_url: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600&auto=format&fit=crop&q=80',
    category: 'Productivity',
    features: ['AI Background Noise Removal', '30h Talk Time', 'Flip-to-Mute Boom', 'Memory Foam Cushions'],
    in_stock: true,
  },
  {
    sku: 'BN-DESK-PAD',
    title: 'BuyNexa Ergonomic Wool Felt Desk Mat',
    description: 'Premium anti-slip organic wool felt desk mat providing tactile comfort for keyboard, mouse, and desktop accessories.',
    price_minor: 2999,
    currency: 'USD',
    image_url: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600&auto=format&fit=crop&q=80',
    category: 'Accessories',
    features: ['High-density Natural Wool', 'Anti-slip Base', 'Water-repellent Coating', '90cm x 40cm Surface'],
    in_stock: true,
  },
]

export const DemoStoreRoute: React.FC = () => {
  const { navigate } = useRouter()
  const { addToCart, itemCount } = useCart()
  const [items, setItems] = useState<DemoCatalogItem[]>([])
  const [loading, setLoading] = useState(true)
  const [addedSku, setAddedSku] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true
    apiClient.catalog
      .getDemoCatalog()
      .then((res) => {
        if (!isMounted) return
        if (res && res.items && res.items.length > 0) {
          setItems(res.items)
        } else {
          setItems(SEED_CATALOG_ITEMS)
        }
      })
      .catch(() => {
        if (!isMounted) return
        setItems(SEED_CATALOG_ITEMS)
      })
      .finally(() => {
        if (isMounted) setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [])

  const handleAddToCart = async (sku: string) => {
    const success = await addToCart(sku, 1)
    if (success) {
      setAddedSku(sku)
      setTimeout(() => setAddedSku(null), 1800)
    }
  }

  return (
    <div className="space-y-10 py-2">
      {/* Storefront Header */}
      <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-6 sm:p-8 backdrop-blur-md shadow-lg space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-indigo-400 uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20">
              Demo Store
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              BuyNexa Store Collection
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
              Curated audio essentials and desk accessories engineered for focus, daily comfort, and productivity.
            </p>
          </div>

          {itemCount > 0 && (
            <Button
              type="button"
              variant="primary"
              size="md"
              onClick={() => navigate('/cart')}
              rightIcon={<ArrowRight className="h-4 w-4" />}
              className="w-full sm:w-auto shadow-md"
            >
              View Cart ({itemCount})
            </Button>
          )}
        </div>
      </div>

      {/* Catalog Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Skeleton className="h-96 rounded-2xl" />
          <Skeleton className="h-96 rounded-2xl" />
          <Skeleton className="h-96 rounded-2xl" />
          <Skeleton className="h-96 rounded-2xl" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((prod) => {
            const isAdded = addedSku === prod.sku
            return (
              <div
                key={prod.sku}
                className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-5 flex flex-col justify-between gap-5 hover:border-slate-700/80 transition-all shadow-sm"
              >
                <div className="space-y-4">
                  {/* Media */}
                  <div className="h-48 rounded-xl bg-slate-950 border border-slate-800 p-3 overflow-hidden flex items-center justify-center">
                    <img
                      src={prod.image_url}
                      alt={prod.title}
                      loading="lazy"
                      className="h-full w-full object-contain hover:scale-105 transition-transform duration-200"
                    />
                  </div>

                  {/* Metadata */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                      <span>{prod.category}</span>
                      <span className="text-emerald-400 font-sans font-medium">In Stock</span>
                    </div>

                    <h3 className="font-bold text-white text-sm line-clamp-2 leading-snug">
                      {prod.title}
                    </h3>

                    <div className="text-lg font-extrabold text-indigo-400 pt-1">
                      {formatMinorMoney(prod.price_minor, prod.currency)}
                    </div>

                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {prod.description}
                    </p>
                  </div>

                  {/* Features */}
                  <div className="pt-2 border-t border-slate-800/80">
                    <ul className="space-y-1 text-xs text-slate-400">
                      {prod.features.slice(0, 3).map((f, idx) => (
                        <li key={idx} className="flex items-center gap-1.5">
                          <Check className="h-3 w-3 text-indigo-400 shrink-0" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Add to Cart Button */}
                <Button
                  type="button"
                  variant={isAdded ? 'secondary' : 'primary'}
                  size="sm"
                  onClick={() => handleAddToCart(prod.sku)}
                  leftIcon={
                    isAdded ? (
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                    ) : (
                      <Plus className="h-3.5 w-3.5" />
                    )
                  }
                  className="w-full text-xs font-semibold rounded-xl"
                >
                  {isAdded ? 'Added to Cart ✓' : 'Add to Cart'}
                </Button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
