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
  ShieldCheck,
  ArrowRight,
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
      setTimeout(() => setAddedSuccess(false), 2500)
    } catch (err) {
      console.error('Failed to add product to cart', err)
    } finally {
      setAddingToCart(false)
    }
  }

  const hasOutboundUrl = !!product.product_url

  return (
    <div
      className={`rounded-3xl border bg-slate-900/60 p-5 sm:p-6 backdrop-blur-md transition-all duration-200 flex flex-col justify-between gap-5 ${
        isBuyNexaStore
          ? 'border-amber-500/40 ring-1 ring-amber-500/20 bg-slate-900/80 shadow-lg shadow-amber-950/20'
          : compared
          ? 'border-indigo-500/80 ring-2 ring-indigo-500/20 bg-slate-900/90 shadow-xl shadow-indigo-950/30'
          : 'border-slate-800/80 hover:border-slate-700/80 shadow-md'
      }`}
    >
      <div className="space-y-4">
        {/* Top Header: Source Provider Badge + Fit Score */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          {isBuyNexaStore ? (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 text-xs font-semibold">
              <ShieldCheck className="h-3.5 w-3.5 text-amber-400" />
              <span>BuyNexa Store — PayPal Sandbox Checkout</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700/60 text-xs font-mono font-medium">
              <span>External Retailer — Channel3 Offer</span>
              {product.retailer && (
                <span className="text-slate-400 font-sans">• {product.retailer}</span>
              )}
            </div>
          )}

          <div
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold self-start sm:self-auto ${scoreDetails.badgeBg}`}
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>{recommendation.fit_score}% match</span>
          </div>
        </div>

        {/* Product Media & Basic Info */}
        <div className="flex flex-col sm:flex-row gap-4 items-start">
          <div className="h-32 w-32 sm:h-28 sm:w-28 rounded-2xl bg-slate-950 border border-slate-800/80 overflow-hidden shrink-0 flex items-center justify-center p-2">
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
            <h3 className="text-base sm:text-lg font-bold text-white line-clamp-2 leading-snug">
              {product.title}
            </h3>
            <div className="text-xl font-extrabold text-indigo-400">
              {formatPrice(product.price?.amount, product.price?.currency)}
            </div>
            {product.description && (
              <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                {product.description}
              </p>
            )}
          </div>
        </div>

        {/* Evidence & Why BuyNexa Recommends It */}
        <div className="rounded-2xl bg-slate-950/70 border border-slate-800/80 p-4 space-y-3">
          <div className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>Why BuyNexa recommends this:</span>
          </div>

          {/* Matched Criteria Evidence List */}
          <ul className="space-y-1.5 text-xs text-slate-300">
            {recommendation.matched_criteria.map((mc, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                <span>
                  <strong className="text-slate-100">{mc.criterion}:</strong> {mc.evidence}
                </span>
              </li>
            ))}
          </ul>

          {/* Caveats / Missing Information */}
          {(recommendation.caveats.length > 0 ||
            recommendation.missing_attributes.length > 0) && (
            <div className="pt-2 border-t border-slate-900 space-y-1">
              <span className="text-[11px] font-semibold text-amber-400/90 flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" /> Caveats & missing attributes:
              </span>
              <ul className="text-[11px] text-slate-400 space-y-0.5">
                {recommendation.caveats.map((c, idx) => (
                  <li key={`c-${idx}`}>• {c}</li>
                ))}
                {recommendation.missing_attributes.map((m, idx) => (
                  <li key={`m-${idx}`}>• {m} is not listed in retailer specs</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
        <Button
          type="button"
          variant={compared ? 'primary' : 'secondary'}
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
                  <CheckCircle2 className="h-3.5 w-3.5 text-slate-950" />
                ) : (
                  <ShoppingBag className="h-3.5 w-3.5 text-slate-950" />
                )
              }
              className="rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-bold border-amber-300 shadow-md shadow-amber-950/30 text-xs"
            >
              {addedSuccess ? 'Added to Cart ✓' : 'Add to Cart • PayPal'}
            </Button>
          </div>
        ) : hasOutboundUrl ? (
          <a
            href={product.product_url!}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/80 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 select-none"
          >
            <span>View at {product.retailer || 'Retailer'}</span>
            <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
          </a>
        ) : (
          <span className="text-xs text-slate-500 italic text-center sm:text-right">
            Outbound link unavailable
          </span>
        )}
      </div>
    </div>
  )
}
