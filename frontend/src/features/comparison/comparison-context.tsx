import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'

interface ComparisonContextType {
  selectedProductIds: string[]
  toggleProduct: (productId: string) => boolean // returns true if added, false if removed
  isSelected: (productId: string) => boolean
  clearComparison: () => void
  removeProduct: (productId: string) => void
  count: number
  maxAllowed: number
}

const ComparisonContext = createContext<ComparisonContextType | null>(null)

const STORAGE_KEY = 'buynexa_comparison_product_ids'
const MAX_COMPARISON_PRODUCTS = 3

export const ComparisonProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>(() => {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(selectedProductIds))
    } catch {
      // storage unavailable
    }
  }, [selectedProductIds])

  const toggleProduct = useCallback((productId: string): boolean => {
    let wasAdded = false
    setSelectedProductIds((prev) => {
      if (prev.includes(productId)) {
        return prev.filter((id) => id !== productId)
      }
      if (prev.length >= MAX_COMPARISON_PRODUCTS) {
        return prev
      }
      wasAdded = true
      return [...prev, productId]
    })
    return wasAdded
  }, [])

  const removeProduct = useCallback((productId: string) => {
    setSelectedProductIds((prev) => prev.filter((id) => id !== productId))
  }, [])

  const isSelected = useCallback(
    (productId: string) => selectedProductIds.includes(productId),
    [selectedProductIds]
  )

  const clearComparison = useCallback(() => {
    setSelectedProductIds([])
  }, [])

  return (
    <ComparisonContext.Provider
      value={{
        selectedProductIds,
        toggleProduct,
        isSelected,
        clearComparison,
        removeProduct,
        count: selectedProductIds.length,
        maxAllowed: MAX_COMPARISON_PRODUCTS,
      }}
    >
      {children}
    </ComparisonContext.Provider>
  )
}

export function useComparison() {
  const context = useContext(ComparisonContext)
  if (!context) {
    throw new Error('useComparison must be used within a ComparisonProvider')
  }
  return context
}
