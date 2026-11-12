import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ComparisonTable } from '../components/comparison/comparison-table'
import type { NormalizedProduct, ProductRecommendation } from '../types/product'

describe('ComparisonTable Component', () => {
  const mockProducts: NormalizedProduct[] = [
    {
      id: 'prod_1',
      provider: 'channel3',
      provider_product_id: 'c3_1',
      title: 'Sony WH-1000XM5 Wireless Headphones',
      description: 'Industry-leading noise cancellation.',
      image_url: 'https://example.com/sony.jpg',
      price: { amount: '348.00', currency: 'USD' },
      retailer: 'Best Buy',
      product_url: 'https://bestbuy.com/sony',
      availability: 'in stock',
      attributes: { battery: '30 hours', weight: '250g' },
      fetched_at: '2026-11-12T00:00:00Z',
    },
    {
      id: 'prod_2',
      provider: 'channel3',
      provider_product_id: 'c3_2',
      title: 'Bose QuietComfort 45',
      description: 'Legendary noise cancelling headphones.',
      image_url: 'https://example.com/bose.jpg',
      price: { amount: '279.00', currency: 'USD' },
      retailer: 'Target',
      product_url: 'https://target.com/bose',
      availability: 'in stock',
      attributes: { battery: '24 hours' },
      fetched_at: '2026-11-12T00:00:00Z',
    },
  ]

  const mockRecommendations: Record<string, ProductRecommendation> = {
    prod_1: {
      product_id: 'prod_1',
      rank: 1,
      fit_score: 92,
      matched_criteria: [
        { criterion: 'Noise cancellation', evidence: 'Industry-leading dual processor ANC' },
      ],
      caveats: ['Price exceeds standard $150 budget'],
      missing_attributes: ['water resistance'],
      explanation: 'Exceptional sound quality and premium ANC.',
    },
    prod_2: {
      product_id: 'prod_2',
      rank: 2,
      fit_score: 85,
      matched_criteria: [
        { criterion: 'Comfort', evidence: 'Plush synthetic leather earcups' },
      ],
      caveats: [],
      missing_attributes: ['fast charge protocol'],
      explanation: 'Very comfortable lightweight build.',
    },
  }

  it('renders table headers and specification rows for selected products', () => {
    const handleRemove = vi.fn()
    const handleClear = vi.fn()

    render(
      <ComparisonTable
        products={mockProducts}
        recommendations={mockRecommendations}
        onRemove={handleRemove}
        onClear={handleClear}
      />
    )

    // Table region
    expect(screen.getByRole('region', { name: /Product comparison table/i })).toBeInTheDocument()

    // Titles
    expect(screen.getByText(/Sony WH-1000XM5/i)).toBeInTheDocument()
    expect(screen.getByText(/Bose QuietComfort 45/i)).toBeInTheDocument()

    // Prices appear in header card and specification row
    expect(screen.getAllByText('$348.00').length).toBeGreaterThan(0)
    expect(screen.getAllByText('$279.00').length).toBeGreaterThan(0)

    // Retailer links
    expect(screen.getByRole('link', { name: /View at Best Buy/i })).toHaveAttribute(
      'href',
      'https://bestbuy.com/sony'
    )
    expect(screen.getByRole('link', { name: /View at Target/i })).toHaveAttribute(
      'href',
      'https://target.com/bose'
    )
  })

  it('calls onRemove when removing a product column', () => {
    const handleRemove = vi.fn()
    const handleClear = vi.fn()

    render(
      <ComparisonTable
        products={mockProducts}
        recommendations={mockRecommendations}
        onRemove={handleRemove}
        onClear={handleClear}
      />
    )

    const removeBtn = screen.getByLabelText(/Remove Sony WH-1000XM5/i)
    fireEvent.click(removeBtn)

    expect(handleRemove).toHaveBeenCalledWith('prod_1')
  })
})
