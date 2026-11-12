import { describe, it, expect } from 'vitest'
import {
  formatMinorMoney,
  formatPrice,
  getFitScoreDetails,
  formatDateTime,
} from '../lib/formatters'

describe('Formatters Utility', () => {
  describe('formatMinorMoney', () => {
    it('formats integer minor cents into currency strings', () => {
      expect(formatMinorMoney(12999, 'USD')).toBe('$129.99')
      expect(formatMinorMoney(7999, 'USD')).toBe('$79.99')
      expect(formatMinorMoney(0, 'USD')).toBe('$0.00')
    })

    it('handles different currencies gracefully', () => {
      expect(formatMinorMoney(5000, 'EUR')).toContain('50.00')
    })
  })

  describe('formatPrice', () => {
    it('formats decimal string amounts into currency', () => {
      expect(formatPrice('149.99', 'USD')).toBe('$149.99')
      expect(formatPrice(149.99, 'USD')).toBe('$149.99')
    })

    it('returns "Price not listed" for missing or null amounts', () => {
      expect(formatPrice(null)).toBe('Price not listed')
      expect(formatPrice(undefined)).toBe('Price not listed')
      expect(formatPrice('')).toBe('Price not listed')
      expect(formatPrice('N/A')).toBe('Price not listed')
    })
  })

  describe('getFitScoreDetails', () => {
    it('returns exceptional match for scores >= 90', () => {
      const details = getFitScoreDetails(95)
      expect(details.label).toBe('Exceptional match')
      expect(details.badgeBg).toContain('emerald')
    })

    it('returns strong match for scores >= 80', () => {
      const details = getFitScoreDetails(84)
      expect(details.label).toBe('Strong match')
      expect(details.badgeBg).toContain('indigo')
    })

    it('returns good match for scores >= 70', () => {
      const details = getFitScoreDetails(75)
      expect(details.label).toBe('Good match')
      expect(details.badgeBg).toContain('sky')
    })

    it('returns partial match for scores < 70', () => {
      const details = getFitScoreDetails(62)
      expect(details.label).toBe('Partial match')
      expect(details.badgeBg).toContain('amber')
    })
  })

  describe('formatDateTime', () => {
    it('formats valid ISO dates', () => {
      const formatted = formatDateTime('2026-11-12T10:30:00Z')
      expect(formatted).toBeTruthy()
      expect(typeof formatted).toBe('string')
    })

    it('returns input on invalid date parse failure', () => {
      expect(formatDateTime('invalid-date')).toBe('invalid-date')
    })
  })
})
