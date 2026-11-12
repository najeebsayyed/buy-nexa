/**
 * Product, recommendation, and comparison types matching Architecture.md.
 */

export interface ProductMoney {
  amount: string
  currency: string
}

export interface NormalizedProduct {
  id: string
  provider: 'channel3' | string
  provider_product_id: string
  title: string
  description: string | null
  image_url: string | null
  price: ProductMoney | null
  retailer: string | null
  product_url: string | null
  availability: string | null
  attributes: Record<string, string | number | boolean | null>
  fetched_at: string
}

export interface CriterionEvidence {
  criterion: string
  evidence: string
}

export interface ProductRecommendation {
  product_id: string
  rank: number
  fit_score: number // 0 to 100
  matched_criteria: CriterionEvidence[]
  caveats: string[]
  missing_attributes: string[]
  explanation: string
}

export interface RankedProductItem {
  product: NormalizedProduct
  recommendation: ProductRecommendation
}

export interface ProductSearchResponse {
  brief_id: string
  query: string
  total_found: number
  items: RankedProductItem[]
  generated_at: string
}

export interface ComparisonRow {
  label: string
  category: 'overview' | 'requirements' | 'specs' | 'tradeoffs'
  values: Record<string, string | null> // keyed by product_id
}

export interface ComparisonResponse {
  product_ids: string[]
  products: NormalizedProduct[]
  recommendations: Record<string, ProductRecommendation>
  rows: ComparisonRow[]
}
