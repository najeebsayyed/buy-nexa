import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from './App'

describe('App Component', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn().mockImplementation((url: string) => {
      if (url.includes('/api/v1/health/live')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ status: 'ok', service: 'buynexa-api', timestamp: '2026-11-10T00:00:00Z' }),
        })
      }
      if (url.includes('/api/v1/health/ready')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ status: 'ok', database: 'connected', timestamp: '2026-11-10T00:00:00Z' }),
        })
      }
      return Promise.reject(new Error('Unknown URL'))
    }))
  })

  it('renders BuyNexa brand and hero headline', async () => {
    render(<App />)
    expect(screen.getAllByText(/BuyNexa/i).length).toBeGreaterThan(0)
    expect(screen.getByText(/Shop by what you need/i)).toBeInTheDocument()
    expect(await screen.findByText(/API Connected/i)).toBeInTheDocument()
  })

  it('renders backend health indicators and handles responses', async () => {
    render(<App />)
    expect(screen.getByText(/Backend Foundation & Connectivity/i)).toBeInTheDocument()
    expect(screen.getByText(/API Liveness Check/i)).toBeInTheDocument()
    expect(screen.getByText(/Database Readiness Check/i)).toBeInTheDocument()
    expect(await screen.findByText(/Status: ok/i)).toBeInTheDocument()
    expect(await screen.findByText(/Database: connected/i)).toBeInTheDocument()
  })
})
