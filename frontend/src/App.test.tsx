import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import App from './App'

describe('BuyNexa Phase 2 Application', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation((url: string) => {
        if (url.includes('/api/v1/health/live')) {
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                status: 'ok',
                service: 'buynexa-api',
                timestamp: '2026-11-12T00:00:00Z',
              }),
          })
        }
        if (url.includes('/api/v1/health/ready')) {
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                status: 'ok',
                database: 'connected',
                timestamp: '2026-11-12T00:00:00Z',
              }),
          })
        }
        if (url.includes('/api/v1/briefs')) {
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                id: 'brief_mock_123',
                session_id: 'session_mock_456',
                original_query: 'Noise-cancelling headphones under $150',
                category: 'wireless headphones',
                use_cases: ['travel', 'office'],
                budget: { amount: 150.0, currency: 'USD', mode: 'hard_limit' },
                must_have: ['noise cancellation'],
                preferences: ['comfortable'],
                exclusions: ['bulky'],
                preferred_brands: ['Sony'],
                locale: 'US',
                created_at: '2026-11-12T00:00:00Z',
                updated_at: '2026-11-12T00:00:00Z',
              }),
          })
        }
        if (url.includes('/api/v1/cart')) {
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                id: 'cart_mock_789',
                session_id: 'session_mock_456',
                items: [],
                subtotal_minor: 0,
                total_minor: 0,
                currency: 'USD',
                item_count: 0,
                updated_at: '2026-11-12T00:00:00Z',
              }),
          })
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ items: [] }),
        })
      })
    )
  })

  it('renders BuyNexa header, wordmark, and primary navigation', () => {
    render(<App />)
    expect(screen.getAllByText(/BuyNexa/i).length).toBeGreaterThan(0)
    expect(screen.getAllByRole('link', { name: /Discover/i })[0]).toBeInTheDocument()
    expect(screen.getAllByRole('link', { name: /Compare/i })[0]).toBeInTheDocument()
    expect(screen.getAllByRole('link', { name: /Demo Store/i })[0]).toBeInTheDocument()
  })

  it('renders official hero headline and prompt composer', () => {
    render(<App />)
    expect(
      screen.getByRole('heading', { name: /Tell us what you need/i })
    ).toBeInTheDocument()
    expect(
      screen.getByPlaceholderText(/Tell us what you're looking for, budget/i)
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /Find Products/i })
    ).toBeInTheDocument()
  })

  it('populates prompt composer when an example card is selected', () => {
    render(<App />)
    const exampleButton = screen.getByText(/Travel Headphones/i)
    fireEvent.click(exampleButton)

    const textarea = screen.getByPlaceholderText(
      /Tell us what you're looking for, budget/i
    ) as HTMLTextAreaElement
    expect(textarea.value).toContain('wireless noise-cancelling headphones under $150')
  })

  it('submits shopping brief and displays intentional extraction loading state', async () => {
    render(<App />)
    const textarea = screen.getByPlaceholderText(
      /Tell us what you're looking for, budget/i
    )
    fireEvent.change(textarea, {
      target: { value: 'Ergonomic 27-inch 4K monitor under $400 for programming' },
    })

    const submitBtn = screen.getByRole('button', { name: /Find Products/i })
    fireEvent.click(submitBtn)

    expect(screen.getByText(/Analyzing Requirements.../i)).toBeInTheDocument()

    // Verifies transition into criteria review
    await waitFor(() => {
      expect(screen.getByText(/Review & Refine Criteria/i)).toBeInTheDocument()
    })
  })

  it('navigates to the Demo Store and displays collection items', async () => {
    render(<App />)
    const demoStoreLink = screen.getAllByRole('link', { name: /Demo Store/i })[0]
    fireEvent.click(demoStoreLink)

    await waitFor(() => {
      expect(screen.getByText(/BuyNexa Store Collection/i)).toBeInTheDocument()
    })
  })

  it('renders clean commercial SaaS footer with platform and legal links', () => {
    render(<App />)
    expect(screen.getByText(/Your AI shopping copilot\./i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Privacy Policy/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Terms of Service/i })).toBeInTheDocument()
    expect(screen.getByText(/© 2026 BuyNexa\. All rights reserved\./i)).toBeInTheDocument()
  })
})
