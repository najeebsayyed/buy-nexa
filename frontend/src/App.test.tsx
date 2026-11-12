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
    expect(screen.getByRole('link', { name: /Discover/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Compare/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Demo Store/i })).toBeInTheDocument()
  })

  it('renders official hero headline and prompt composer', () => {
    render(<App />)
    expect(
      screen.getByRole('heading', { name: /Shop by what you need/i })
    ).toBeInTheDocument()
    expect(
      screen.getByPlaceholderText(/Describe what you need, your budget/i)
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /Create Shopping Brief/i })
    ).toBeInTheDocument()
  })

  it('populates prompt composer when an example card is selected', () => {
    render(<App />)
    const exampleButton = screen.getByText(/Headphones for travel/i)
    fireEvent.click(exampleButton)

    const textarea = screen.getByPlaceholderText(
      /Describe what you need, your budget/i
    ) as HTMLTextAreaElement
    expect(textarea.value).toContain('wireless noise-cancelling headphones under $150')
  })

  it('submits shopping brief and displays intentional extraction loading state', async () => {
    render(<App />)
    const textarea = screen.getByPlaceholderText(
      /Describe what you need, your budget/i
    )
    fireEvent.change(textarea, {
      target: { value: 'Ergonomic 27-inch 4K monitor under $400 for programming' },
    })

    const submitBtn = screen.getByRole('button', { name: /Create Shopping Brief/i })
    fireEvent.click(submitBtn)

    expect(screen.getByText(/Analyzing Requirements.../i)).toBeInTheDocument()

    // Verifies transition into brief review
    await waitFor(() => {
      expect(screen.getByText(/Review and Refine Your Criteria/i)).toBeInTheDocument()
    })
  })

  it('navigates to the Demo Store and displays Sandbox disclosures', async () => {
    render(<App />)
    const demoStoreLink = screen.getByRole('link', { name: /Demo Store/i })
    fireEvent.click(demoStoreLink)

    await waitFor(() => {
      expect(screen.getByText(/BuyNexa Sandbox Store/i)).toBeInTheDocument()
      expect(
        screen.getAllByText(/Sandbox demo — no real money and no fulfilment/i).length
      ).toBeGreaterThan(0)
    })
  })

  it('renders trusted commerce footer with hackathon and architecture disclosures', () => {
    render(<App />)
    expect(screen.getByText(/PayPal AI Hackathon 2026/i)).toBeInTheDocument()
    expect(
      screen.getByText(/Zero client-side payment tampering/i)
    ).toBeInTheDocument()
  })
})
