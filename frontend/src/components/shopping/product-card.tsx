import React, { useState } from 'react'
import type { RankedProductItem } from '../../types/product'
import { formatPrice, getFitScoreDetails } from '../../lib/formatters'
import { Button } from '../ui/button'
import { useComparison } from '../../features/comparison/comparison-context'
import { useCart } from '../../features/cart/cart-context'
import {
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Scale,
  Sparkles,
  ShoppingBag,
  ArrowRight,
  Check,
} from 'lucide-react'

export interface ProductCardProps {
  item: RankedProductItem
}

export const ProductCard: React.FC<ProductCardProps> = ({ item }) => {
  const { product, recommendation } = item
  const { toggleProduct, isSelected, count, maxAllowed } = useComparison()
  const { addToCart, cart } = useCart()
  const compared = isSelected(product.id)
  const scoreDetails = getFitScoreDetails(recommendation.fit_score)

  const [addingToCart, setAddingToCart] = useState(false)
  const [addedSuccess, setAddedSuccess] = useState(false)

  const isBuyNexaStore = product.provider === 'buynexa'
  const inCartCount = isBuyNexaStore
    ? cart?.items.find((it) => it.sku === product.provider_product_id)?.quantity || 0
    : 0

  const handleCompareClick = () => {
    toggleProduct(product.id)
  }

  const handleAddToCart = async () => {
    if (!isBuyNexaStore) return
    setAddingToCart(true)
    try {
      await addToCart(product.provider_product_id, 1)
      setAddedSuccess(true)
      setTimeout(() => setAddedSuccess(false), 2000)
    } catch (err) {
      console.error('Failed to add product to cart', err)
    } finally {
      setAddingToCart(false)
    }
  }

  const hasOutboundUrl = !!product.product_url

  return (
    <div
      className={`rounded-2xl border bg-slate-900/40 p-5 sm:p-6 backdrop-blur-md transition-all duration-200 flex flex-col justify-between gap-5 hover:border-slate-700/80 ${
        compared
          ? 'border-indigo-500/80 ring-1 ring-indigo-500/30 bg-slate-900/70 shadow-lg shadow-indigo-950/20'
          : isBuyNexaStore
          ? 'border-indigo-500/30 bg-slate-900/50'
          : 'border-slate-800/80 shadow-sm'
      }`}
    >
      <div className="space-y-4">
        {/* Header: Source Badge & Match Score */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          {isBuyNexaStore ? (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-xs font-medium">
              <ShoppingBag className="h-3.5 w-3.5 text-indigo-400" />
              <span>BuyNexa Store</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800/80 text-slate-300 border border-slate-700/60 text-xs font-medium">
              <span>External Retailer</span>
              {product.retailer && (
                <span className="text-slate-400 font-sans">• {product.retailer}</span>
              )}
            </div>
          )}

          <div
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-xs font-bold self-start sm:self-auto ${scoreDetails.badgeBg}`}
          >
            <Sparkles className="h-3 w-3" />
            <span>{recommendation.fit_score}% match</span>
          </div>
        </div>

        {/* Media & Details */}
        <div className="flex flex-col sm:flex-row gap-4 items-start">
          <div className="h-28 w-28 rounded-xl bg-slate-950 border border-slate-800 p-2 overflow-hidden shrink-0 flex items-center justify-center">
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.title}
                loading="lazy"
                className="h-full w-full object-contain hover:scale-105 transition-transform duration-200"
                onError={(e) => {
                  ;(e.target as HTMLElement).style.display = 'none'
                }}
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-slate-600 gap-1">
                <ShoppingBag className="h-6 w-6" />
                <span className="text-[10px]">No image</span>
              </div>
            )}
          </div>

          <div className="flex-1 space-y-1.5">
            <h3 className="text-base font-bold text-white line-clamp-2 leading-snug">
              {product.title}
            </h3>
            <div className="text-lg font-extrabold text-indigo-400">
              {formatPrice(product.price?.amount, product.price?.currency)}
            </div>
            {product.description && (
              <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                {product.description}
              </p>
            )}
          </div>
        </div>

        {/* Evidence & Why It Matches */}
        <div className="rounded-xl bg-slate-950/60 border border-slate-800/80 p-3.5 space-y-2.5">
          <div className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
            <span>Why this matches your criteria:</span>
          </div>

          <ul className="space-y-1 text-xs text-slate-300">
            {recommendation.matched_criteria.slice(0, 3).map((mc, idx) => (
              <li key={idx} className="flex items-start gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                <span>
                  <strong className="text-slate-100">{mc.criterion}:</strong> {mc.evidence}
                </span>
              </li>
            ))}
          </ul>

          {/* Caveats or Missing Specs */}
          {(recommendation.caveats.length > 0 ||
            recommendation.missing_attributes.length > 0) && (
            <div className="pt-2 border-t border-slate-900 space-y-1 text-xs text-slate-400">
              {recommendation.caveats.slice(0, 1).map((cav, idx) => (
                <div key={idx} className="flex items-start gap-1.5 text-amber-300/80">
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <span>{cav}</span>
                </div>
              ))}
              {recommendation.missing_attributes.length > 0 && (
                <div className="text-[11px] text-slate-500">
                  Not listed: {recommendation.missing_attributes.join(', ')}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Action Row */}
      <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-800/80">
        <Button
          type="button"
          variant={compared ? 'secondary' : 'outline'}
          size="sm"
          onClick={handleCompareClick}
          leftIcon={<Scale className="h-3.5 w-3.5" />}
          disabled={!compared && count >= maxAllowed}
          className="rounded-xl text-xs"
        >
          {compared ? 'Selected for Compare' : 'Add to Compare'}
        </Button>

        {isBuyNexaStore ? (
          <div className="flex items-center gap-2">
            {inCartCount > 0 && (
              <a
                href="/cart"
                className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors px-1"
              >
                <span>In Cart ({inCartCount})</span>
                <ArrowRight className="h-3 w-3" />
              </a>
            )}
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleAddToCart}
              isLoading={addingToCart}
              leftIcon={
                addedSuccess ? (
                  <Check className="h-3.5 w-3.5" />
                ) : (
                  <ShoppingBag className="h-3.5 w-3.5" />
                )
              }
              className="rounded-xl text-xs font-semibold"
            >
              {addedSuccess ? 'Added to Cart ✓' : 'Add to Cart'}
            </Button>
          </div>
        ) : hasOutboundUrl ? (
          <a
            href={product.product_url!}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white transition-colors"
          >
            <span>View at Retailer</span>
            <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
          </a>
        ) : (
          <span className="text-xs text-slate-500 italic">Retailer link unavailable</span>
        )}
      </div>
    </div>
  )
}
