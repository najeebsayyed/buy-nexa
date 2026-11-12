import React, { useEffect, useState, useCallback } from 'react'
import { useRouter, Link } from '../router'
import { apiClient, ApiError } from '../../lib/api-client'
import type { ShoppingBrief } from '../../types/brief'
import type { ProductSearchResponse } from '../../types/product'
import { ProductCard } from '../../components/shopping/product-card'
import { Skeleton } from '../../components/ui/skeleton'
import { Button } from '../../components/ui/button'
import { useComparison } from '../../features/comparison/comparison-context'
import {
  ArrowLeft,
  SlidersHorizontal,
  Scale,
  RefreshCw,
  AlertCircle,
  ShoppingBag,
} from 'lucide-react'

export const ResultsRoute: React.FC<{ briefId: string }> = ({ briefId }) => {
  const { navigate } = useRouter()
  const { count: compareCount } = useComparison()
  const [brief, setBrief] = useState<ShoppingBrief | null>(null)
  const [results, setResults] = useState<ProductSearchResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      // 1. Load brief first
      const loadedBrief = await apiClient.briefs.get(briefId)
      setBrief(loadedBrief)

      // 2. Perform product search & ranking
      const searchRes = await apiClient.search.searchProducts(briefId)
      setResults(searchRes)
    } catch (err) {
      if (err instanceof ApiError) {
        setError(`Search service error (${err.code}): ${err.message}`)
      } else if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Failed to retrieve product recommendations from the search engine.')
      }
    } finally {
      setLoading(false)
    }
  }, [briefId])

  useEffect(() => {
    loadData()
  }, [loadData])

  return (
    <div className="space-y-8 py-2">
      {/* Header & Criteria Summary */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8 backdrop-blur-md shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Link
                to={`/search/${briefId}`}
                className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Back to Brief
              </Link>
              <span className="text-slate-600">•</span>
              <span className="text-xs text-slate-400 font-mono">
                {results ? `${results.items.length} curated matches` : 'Discovery'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Curated Product Recommendations
            </h1>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {compareCount > 0 && (
              <Button
                type="button"
                variant="subtle"
                size="md"
                onClick={() => navigate('/compare')}
                leftIcon={<Scale className="h-4 w-4 text-indigo-400" />}
                className="font-semibold text-xs"
              >
                Compare ({compareCount})
              </Button>
            )}

            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => navigate(`/search/${briefId}`)}
              leftIcon={<SlidersHorizontal className="h-4 w-4" />}
            >
              Edit Brief
            </Button>
          </div>
        </div>

        {/* Brief Highlights Bar */}
        {brief && (
          <div className="pt-2 flex flex-wrap items-center gap-2 text-xs">
            {brief.category && (
              <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-300 font-medium">
                Category: <strong className="text-white">{brief.category}</strong>
              </span>
            )}
            {brief.budget && (
              <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-300 font-medium">
                Budget:{' '}
                <strong className="text-emerald-400">
                  {brief.budget.currency} {brief.budget.amount}
                </strong>{' '}
                ({brief.budget.mode === 'hard_limit' ? 'Max' : 'Target'})
              </span>
            )}
            {brief.must_have.map((mh, idx) => (
              <span
                key={idx}
                className="px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-medium"
              >
                ✓ {mh}
              </span>
            ))}
          </div>
        )}

        {/* Commerce Origin Trust Disclosures */}
        <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center gap-x-6 gap-y-2 text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-amber-400 shrink-0" />
            <span>
              <strong className="text-amber-300">BuyNexa Store:</strong> Eligible for instant PayPal Sandbox Checkout
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-indigo-400 shrink-0" />
            <span>
              <strong className="text-indigo-300">External Retailers:</strong> Real-time Channel3 merchant offers (outbound link)
            </span>
          </div>
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="space-y-6">
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span>Querying merchant catalogs & ranking evidence...</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton className="h-80 rounded-3xl" />
            <Skeleton className="h-80 rounded-3xl" />
            <Skeleton className="h-80 rounded-3xl" />
            <Skeleton className="h-80 rounded-3xl" />
          </div>
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div className="max-w-xl mx-auto text-center py-12 space-y-4">
          <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-400 w-fit mx-auto border border-rose-500/20">
            <AlertCircle className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-bold text-white">Discovery Service Unavailable</h2>
          <p className="text-sm text-slate-400 leading-relaxed max-w-md mx-auto">{error}</p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={loadData}
              leftIcon={<RefreshCw className="h-4 w-4" />}
            >
              Retry Search
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => navigate(`/search/${briefId}`)}
            >
              Refine Requirements
            </Button>
          </div>
        </div>
      )}

      {/* Zero Results State */}
      {!loading && !error && results && results.items.length === 0 && (
        <div className="max-w-md mx-auto text-center py-16 space-y-4">
          <div className="p-3 rounded-2xl bg-slate-800 text-slate-400 w-fit mx-auto">
            <ShoppingBag className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-bold text-white">No Matching Products Found</h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            No merchant listings met your combination of budget, category, and strict must-have constraints.
          </p>
          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={() => navigate(`/search/${briefId}`)}
            leftIcon={<SlidersHorizontal className="h-4 w-4" />}
            className="mt-2"
          >
            Relax Constraints in Brief
          </Button>
        </div>
      )}

      {/* Products Grid */}
      {!loading && !error && results && results.items.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span>
              Showing {results.items.length} verified products from merchant feeds
            </span>
            <span className="font-mono text-[11px] text-indigo-400">
              Ranked by deterministic Python engine
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {results.items.map((item) => (
              <ProductCard key={item.product.id} item={item} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
