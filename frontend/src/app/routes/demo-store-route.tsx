import React, { useEffect, useState } from 'react'
import { useRouter } from '../router'
import { useCart } from '../../features/cart/cart-context'
import { apiClient } from '../../lib/api-client'
import { formatMinorMoney } from '../../lib/formatters'
import type { DemoCatalogItem } from '../../types/cart'
import { Button } from '../../components/ui/button'
import { Skeleton } from '../../components/ui/skeleton'
import {
  Info,
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
      {/* Sandbox Disclosure Header */}
      <div className="rounded-3xl border border-amber-500/30 bg-amber-500/5 p-6 sm:p-8 backdrop-blur-md shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[11px] font-mono text-amber-400 uppercase tracking-wider font-semibold px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20">
              Controlled Demo Catalog
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              BuyNexa Sandbox Store
            </h1>
          </div>

          {itemCount > 0 && (
            <Button
              type="button"
              variant="primary"
              size="md"
              onClick={() => navigate('/cart')}
              rightIcon={<ArrowRight className="h-4 w-4" />}
              className="w-full sm:w-auto shadow-lg shadow-indigo-600/30"
            >
              View Cart ({itemCount})
            </Button>
          )}
        </div>

        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 text-xs text-amber-200 leading-relaxed flex items-start gap-3">
          <Info className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold text-amber-100">
              Sandbox demo — no real money and no fulfilment.
            </p>
            <p className="text-amber-300/80">
              This store contains controlled demonstration catalog items used to test the PayPal Sandbox checkout flow. All prices and orders are verified server-side.
            </p>
          </div>
        </div>
      </div>

      {/* Catalog Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Skeleton className="h-96 rounded-3xl" />
          <Skeleton className="h-96 rounded-3xl" />
          <Skeleton className="h-96 rounded-3xl" />
          <Skeleton className="h-96 rounded-3xl" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((item) => {
            const isJustAdded = addedSku === item.sku
            return (
              <div
                key={item.sku}
                className="rounded-3xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-md flex flex-col justify-between gap-4 hover:border-slate-700/80 transition-all duration-200 shadow-md"
              >
                <div className="space-y-3">
                  {/* Image Container */}
                  <div className="h-48 w-full rounded-2xl bg-slate-950 border border-slate-800/80 overflow-hidden flex items-center justify-center p-3 relative group">
                    <img
                      src={item.image_url}
                      alt={item.title}
                      loading="lazy"
                      className="h-full w-full object-contain group-hover:scale-105 transition-transform duration-200"
                    />
                    <span className="absolute top-2.5 right-2.5 text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-900/90 text-slate-300 border border-slate-800">
                      {item.sku}
                    </span>
                  </div>

                  {/* Title & Price */}
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-400">
                      {item.category}
                    </span>
                    <h3 className="font-bold text-white text-base line-clamp-2 mt-0.5">
                      {item.title}
                    </h3>
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>

                  {/* Feature Badges */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {item.features.slice(0, 2).map((feat, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] px-2 py-0.5 rounded-lg bg-slate-800 text-slate-300 border border-slate-700/60"
                      >
                        {feat}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Price & Add to Cart */}
                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                  <div className="text-lg font-extrabold text-white">
                    {formatMinorMoney(item.price_minor, item.currency)}
                  </div>

                  <Button
                    type="button"
                    variant={isJustAdded ? 'primary' : 'secondary'}
                    size="sm"
                    onClick={() => handleAddToCart(item.sku)}
                    leftIcon={
                      isJustAdded ? (
                        <Check className="h-3.5 w-3.5 text-white" />
                      ) : (
                        <Plus className="h-3.5 w-3.5" />
                      )
                    }
                    className="rounded-xl font-semibold text-xs"
                  >
                    {isJustAdded ? 'Added!' : 'Add to Cart'}
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
