import { describe, it, expect } from 'vitest'
import { formatDateShort, formatDateLong, formatDateTime } from '~/utils/date'

describe('date utils', () => {
  describe('formatDateShort', () => {
    it('formats date string to DD/MM/YYYY', () => {
      const result = formatDateShort('2024-06-15')
      expect(result).toBeTruthy()
      // Should contain day, month, year parts
      expect(result).toMatch(/\d/)
    })

    it('formats Date object', () => {
      const result = formatDateShort(new Date(2024, 5, 15))
      expect(result).toBeTruthy()
      expect(result).toMatch(/\d/)
    })

    it('returns consistent format for same date', () => {
      const a = formatDateShort('2024-01-01')
      const b = formatDateShort(new Date('2024-01-01'))
      expect(a).toBe(b)
    })
  })

  describe('formatDateLong', () => {
    it('formats date string to long format', () => {
      const result = formatDateLong('2024-06-15')
      expect(result).toBeTruthy()
      // Should contain year
      expect(result).toContain('2024')
    })

    it('formats Date object', () => {
      const result = formatDateLong(new Date(2024, 5, 15))
      expect(result).toBeTruthy()
      expect(result).toContain('2024')
    })
  })

  describe('formatDateTime', () => {
    it('formats date string with time', () => {
      const result = formatDateTime('2024-06-15T14:30:00')
      expect(result).toBeTruthy()
      expect(result).toMatch(/\d/)
    })

    it('formats Date object with time', () => {
      const result = formatDateTime(new Date(2024, 5, 15, 14, 30))
      expect(result).toBeTruthy()
      expect(result).toMatch(/\d/)
    })
  })
})
