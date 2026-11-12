import React from 'react'
import type { NormalizedProduct, ProductRecommendation } from '../../types/product'
import { formatPrice } from '../../lib/formatters'
import { Button } from '../ui/button'
import { ExternalLink, X, Check, AlertTriangle, ShoppingBag, Sparkles } from 'lucide-react'

export interface ComparisonTableProps {
  products: NormalizedProduct[]
  recommendations?: Record<string, ProductRecommendation>
  onRemove: (productId: string) => void
  onClear: () => void
}

export const ComparisonTable: React.FC<ComparisonTableProps> = ({
  products,
  recommendations = {},
  onRemove,
  onClear,
}) => {
  if (products.length === 0) {
    return null
  }

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-400 font-medium">
          Comparing {products.length} of 3 selected products
        </span>
        <Button type="button" variant="ghost" size="sm" onClick={onClear} className="text-xs">
          Clear All
        </Button>
      </div>

      {/* Responsive Table Wrapper */}
      <div
        tabIndex={0}
        role="region"
        aria-label="Product comparison table"
        className="w-full overflow-x-auto rounded-2xl border border-slate-800/80 bg-slate-900/60 backdrop-blur-md shadow-xl focus:outline-none focus:ring-1 focus:ring-indigo-500"
      >
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-950/80">
              <th className="p-4 sm:p-5 w-44 text-xs font-semibold text-slate-400 uppercase tracking-wider sticky left-0 bg-slate-950/95 z-10 border-r border-slate-800/60">
                Specification
              </th>
              {products.map((p) => {
                const rec = recommendations[p.id]
                return (
                  <th key={p.id} className="p-4 sm:p-5 min-w-[240px] sm:min-w-[280px] align-top">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        {p.provider === 'buynexa' ? (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 flex items-center gap-1">
                            <ShoppingBag className="h-3 w-3 text-indigo-400" />
                            <span>BuyNexa Store</span>
                          </span>
                        ) : (
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700/60">
                            {p.retailer || 'External Merchant'}
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => onRemove(p.id)}
                          className="text-slate-500 hover:text-rose-400 p-1 rounded-lg focus:outline-none transition-colors"
                          aria-label={`Remove ${p.title} from comparison`}
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>

                      {p.image_url && (
                        <div className="h-24 w-24 rounded-xl bg-slate-950 border border-slate-800 p-1.5 overflow-hidden">
                          <img
                            src={p.image_url}
                            alt={p.title}
                            className="h-full w-full object-contain"
                          />
                        </div>
                      )}

                      <h4 className="font-bold text-white text-sm line-clamp-2 leading-snug">{p.title}</h4>

                      <div className="text-base font-extrabold text-indigo-400">
                        {formatPrice(p.price?.amount, p.price?.currency)}
                      </div>

                      {rec && (
                        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-xs font-semibold">
                          <Sparkles className="h-3 w-3" />
                          <span>{rec.fit_score}% match</span>
                        </div>
                      )}
                    </div>
                  </th>
                )
              })}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-800/80">
            {/* Price Row */}
            <tr className="hover:bg-slate-850/30 transition-colors">
              <th className="p-4 text-xs font-semibold text-slate-300 sticky left-0 bg-slate-950/95 z-10 border-r border-slate-800/60">
                Price
              </th>
              {products.map((p) => (
                <td key={p.id} className="p-4 font-semibold text-slate-100">
                  {formatPrice(p.price?.amount, p.price?.currency)}
                </td>
              ))}
            </tr>

            {/* Matched Criteria */}
            <tr className="hover:bg-slate-850/30 transition-colors">
              <th className="p-4 text-xs font-semibold text-slate-300 sticky left-0 bg-slate-950/95 z-10 border-r border-slate-800/60">
                Matched Strengths
              </th>
              {products.map((p) => {
                const rec = recommendations[p.id]
                return (
                  <td key={p.id} className="p-4 text-xs text-slate-300 space-y-1">
                    {rec && rec.matched_criteria.length > 0 ? (
                      rec.matched_criteria.map((mc, idx) => (
                        <div key={idx} className="flex items-start gap-1.5">
                          <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span>
                            <strong>{mc.criterion}:</strong> {mc.evidence}
                          </span>
                        </div>
                      ))
                    ) : (
                      <span className="text-slate-500 italic">No specific criteria matched</span>
                    )}
                  </td>
                )
              })}
            </tr>

            {/* Trade-offs & Missing Specs */}
            <tr className="hover:bg-slate-850/30 transition-colors">
              <th className="p-4 text-xs font-semibold text-slate-300 sticky left-0 bg-slate-950/95 z-10 border-r border-slate-800/60">
                Trade-offs & Gaps
              </th>
              {products.map((p) => {
                const rec = recommendations[p.id]
                const caveats = rec?.caveats || []
                const missing = rec?.missing_attributes || []
                return (
                  <td key={p.id} className="p-4 text-xs text-slate-400 space-y-1.5">
                    {caveats.map((c, idx) => (
                      <div key={idx} className="flex items-start gap-1.5 text-amber-300/80">
                        <AlertTriangle className="h-3.5 w-3.5 text-amber-400 shrink-0 mt-0.5" />
                        <span>{c}</span>
                      </div>
                    ))}
                    {missing.length > 0 && (
                      <div className="text-[11px] text-slate-500">
                        Not listed: {missing.join(', ')}
                      </div>
                    )}
                    {caveats.length === 0 && missing.length === 0 && (
                      <span className="text-slate-500 italic">None noted</span>
                    )}
                  </td>
                )
              })}
            </tr>

            {/* Availability */}
            <tr className="hover:bg-slate-850/30 transition-colors">
              <th className="p-4 text-xs font-semibold text-slate-300 sticky left-0 bg-slate-950/95 z-10 border-r border-slate-800/60">
                Stock Status
              </th>
              {products.map((p) => (
                <td key={p.id} className="p-4 text-xs text-slate-300 capitalize">
                  {p.availability || 'In Stock'}
                </td>
              ))}
            </tr>

            {/* Purchase Action */}
            <tr className="hover:bg-slate-850/30 transition-colors">
              <th className="p-4 text-xs font-semibold text-slate-300 sticky left-0 bg-slate-950/95 z-10 border-r border-slate-800/60">
                Purchase Action
              </th>
              {products.map((p) => (
                <td key={p.id} className="p-4">
                  {p.provider === 'buynexa' ? (
                    <a
                      href="/demo-store"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
                    >
                      <ShoppingBag className="h-3.5 w-3.5" />
                      <span>View in Store</span>
                    </a>
                  ) : p.product_url ? (
                    <a
                      href={p.product_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white transition-colors"
                    >
                      <span>View at {p.retailer || 'Retailer'}</span>
                      <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
                    </a>
                  ) : (
                    <span className="text-xs text-slate-500 italic">Not available</span>
                  )}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
