import React, { useEffect, useState, useCallback } from 'react'
import { useRouter } from '../router'
import { useComparison } from '../../features/comparison/comparison-context'
import { ComparisonTable } from '../../components/comparison/comparison-table'
import { Button } from '../../components/ui/button'
import { Skeleton } from '../../components/ui/skeleton'
import { apiClient, ApiError } from '../../lib/api-client'
import type { NormalizedProduct, ProductRecommendation } from '../../types/product'
import { Scale, ArrowLeft, RefreshCw, AlertCircle } from 'lucide-react'

export const CompareRoute: React.FC = () => {
  const { navigate } = useRouter()
  const { selectedProductIds, removeProduct, clearComparison } = useComparison()
  const [products, setProducts] = useState<NormalizedProduct[]>([])
  const [recommendations, setRecommendations] = useState<Record<string, ProductRecommendation>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadComparison = useCallback(async () => {
    if (selectedProductIds.length === 0) {
      setProducts([])
      setRecommendations({})
      return
    }

    setLoading(true)
    setError(null)
    try {
      const res = await apiClient.comparison.compareProducts(selectedProductIds)
      setProducts(res.products)
      setRecommendations(res.recommendations)
    } catch (err) {
      if (err instanceof ApiError) {
        setError(`Comparison error (${err.code}): ${err.message}`)
      } else if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Failed to load comparison data.')
      }
    } finally {
      setLoading(false)
    }
  }, [selectedProductIds])

  useEffect(() => {
    loadComparison()
  }, [loadComparison])

  if (selectedProductIds.length === 0) {
    return (
      <div className="max-w-md mx-auto text-center py-20 space-y-5">
        <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-indigo-400 w-fit mx-auto shadow-md">
          <Scale className="h-7 w-7" />
        </div>
        <div className="space-y-1.5">
          <h1 className="text-2xl font-bold text-white">No Products Selected</h1>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            Select up to 3 products from any search recommendation screen to compare specifications, budget fit, and trade-offs side by side.
          </p>
        </div>
        <Button
          type="button"
          variant="primary"
          size="md"
          onClick={() => navigate('/')}
          leftIcon={<ArrowLeft className="h-4 w-4" />}
          className="mt-2"
        >
          Discover Products
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-8 py-2">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-mono text-indigo-400 uppercase tracking-wider font-semibold">
            Requirement Analysis
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            Side-by-Side Product Comparison
          </h1>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => window.history.back()}
          leftIcon={<ArrowLeft className="h-4 w-4" />}
        >
          Back to Results
        </Button>
      </div>

      {loading && (
        <div className="space-y-4">
          <Skeleton className="h-96 w-full rounded-3xl" />
        </div>
      )}

      {error && !loading && (
        <div className="max-w-md mx-auto text-center py-10 space-y-3">
          <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 w-fit mx-auto">
            <AlertCircle className="h-5 w-5" />
          </div>
          <p className="text-sm text-slate-300">{error}</p>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={loadComparison}
            leftIcon={<RefreshCw className="h-3.5 w-3.5" />}
          >
            Retry
          </Button>
        </div>
      )}

      {!loading && !error && products.length > 0 && (
        <ComparisonTable
          products={products}
          recommendations={recommendations}
          onRemove={removeProduct}
          onClear={clearComparison}
        />
      )}
    </div>
  )
}
