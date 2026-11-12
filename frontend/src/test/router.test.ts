import { describe, it, expect } from 'vitest'
import { matchRoute } from '../app/router'

describe('Client-Side Router matchRoute', () => {
  it('matches home route /', () => {
    const match = matchRoute('/')
    expect(match.name).toBe('home')
  })

  it('matches brief review route /search/:briefId', () => {
    const match = matchRoute('/search/brief_abc_123')
    expect(match.name).toBe('brief_review')
    expect(match.params.briefId).toBe('brief_abc_123')
  })

  it('matches search results route /search/:briefId/results', () => {
    const match = matchRoute('/search/brief_abc_123/results')
    expect(match.name).toBe('search_results')
    expect(match.params.briefId).toBe('brief_abc_123')
  })

  it('matches compare route /compare', () => {
    const match = matchRoute('/compare')
    expect(match.name).toBe('compare')
  })

  it('matches demo store route /demo-store', () => {
    const match = matchRoute('/demo-store')
    expect(match.name).toBe('demo_store')
  })

  it('matches cart route /cart', () => {
    const match = matchRoute('/cart')
    expect(match.name).toBe('cart')
  })

  it('matches checkout route /checkout', () => {
    const match = matchRoute('/checkout')
    expect(match.name).toBe('checkout')
  })

  it('matches order confirmation route /orders/:orderId', () => {
    const match = matchRoute('/orders/order_xyz_789')
    expect(match.name).toBe('order_confirmation')
    expect(match.params.orderId).toBe('order_xyz_789')
  })

  it('returns not_found for unmatched routes', () => {
    const match = matchRoute('/some/non/existent/path')
    expect(match.name).toBe('not_found')
  })
})
