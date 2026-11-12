/**
 * Shopping brief types matching backend schemas.
 */

export interface Budget {
  amount: number
  currency: string
  mode: 'hard_limit' | 'target'
}

export interface ShoppingBriefData {
  category: string | null
  use_cases: string[]
  budget: Budget | null
  must_have: string[]
  preferences: string[]
  exclusions: string[]
  preferred_brands: string[]
  locale: string | null
}

export interface ShoppingBrief extends ShoppingBriefData {
  id: string
  session_id: string
  original_query: string
  created_at: string
  updated_at: string
}

export interface ShoppingBriefCreateRequest {
  query: string
}

export interface ShoppingBriefUpdateRequest {
  category?: string | null
  use_cases?: string[] | null
  budget?: Budget | null
  must_have?: string[] | null
  preferences?: string[] | null
  exclusions?: string[] | null
  preferred_brands?: string[] | null
  locale?: string | null
}
