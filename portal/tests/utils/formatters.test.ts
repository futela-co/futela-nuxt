import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  formatPrice,
  formatDate,
  formatRelativeDate,
  formatDateTimeFormatted,
  formatNumber,
  truncate,
  getInitials,
  formatPhone,
  formatFileSize,
} from '~/utils/formatters'

describe('formatters', () => {
  describe('formatPrice', () => {
    it('returns dash for null', () => {
      expect(formatPrice(null)).toBe('-')
    })

    it('returns dash for undefined', () => {
      expect(formatPrice(undefined)).toBe('-')
    })

    it('formats price with CDF currency', () => {
      const result = formatPrice(50000)
      expect(result).toContain('50')
      expect(result).toContain('000')
    })

    it('formats zero', () => {
      const result = formatPrice(0)
      expect(result).toContain('0')
    })

    it('accepts custom currency', () => {
      const result = formatPrice(100, 'USD')
      expect(result).toBeTruthy()
    })
  })

  describe('formatDate', () => {
    it('returns dash for null', () => {
      expect(formatDate(null)).toBe('-')
    })

    it('returns dash for undefined', () => {
      expect(formatDate(undefined)).toBe('-')
    })

    it('returns dash for invalid date', () => {
      expect(formatDate('invalid')).toBe('-')
    })

    it('formats a valid date', () => {
      const result = formatDate('2024-06-15')
      expect(result).toBeTruthy()
      expect(result).not.toBe('-')
    })

    it('accepts custom format options', () => {
      const result = formatDate('2024-01-01', { year: 'numeric' })
      expect(result).toContain('2024')
    })
  })

  describe('formatRelativeDate', () => {
    beforeEach(() => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2024-06-15T12:00:00Z'))
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('returns dash for null', () => {
      expect(formatRelativeDate(null)).toBe('-')
    })

    it('returns dash for invalid date', () => {
      expect(formatRelativeDate('invalid')).toBe('-')
    })

    it('returns "à l\'instant" for just now', () => {
      const now = new Date()
      expect(formatRelativeDate(now.toISOString())).toBe("à l'instant")
    })

    it('returns minutes for recent dates', () => {
      const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000)
      expect(formatRelativeDate(fiveMinAgo.toISOString())).toBe('il y a 5 min')
    })

    it('returns hours for same-day dates', () => {
      const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000)
      expect(formatRelativeDate(threeHoursAgo.toISOString())).toBe('il y a 3h')
    })

    it('returns days for recent dates', () => {
      const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      expect(formatRelativeDate(twoDaysAgo.toISOString())).toBe('il y a 2j')
    })

    it('returns formatted date for older dates', () => {
      const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
      const result = formatRelativeDate(twoWeeksAgo.toISOString())
      expect(result).not.toBe('-')
      expect(result).not.toContain('il y a')
    })
  })

  describe('formatDateTimeFormatted', () => {
    it('returns dash for null', () => {
      expect(formatDateTimeFormatted(null)).toBe('-')
    })

    it('formats a valid datetime', () => {
      const result = formatDateTimeFormatted('2024-06-15T14:30:00Z')
      expect(result).toBeTruthy()
      expect(result).not.toBe('-')
    })
  })

  describe('formatNumber', () => {
    it('returns "0" for null', () => {
      expect(formatNumber(null)).toBe('0')
    })

    it('returns "0" for undefined', () => {
      expect(formatNumber(undefined)).toBe('0')
    })

    it('formats number with separators', () => {
      const result = formatNumber(1234567)
      // French locale uses space or non-breaking space as separator
      expect(result.replace(/\s/g, '')).toBe('1234567')
    })

    it('formats zero', () => {
      expect(formatNumber(0)).toBe('0')
    })
  })

  describe('truncate', () => {
    it('returns text unchanged if shorter than max', () => {
      expect(truncate('hello', 10)).toBe('hello')
    })

    it('returns text unchanged if equal to max', () => {
      expect(truncate('hello', 5)).toBe('hello')
    })

    it('truncates and adds ellipsis', () => {
      expect(truncate('hello world', 5)).toBe('hello...')
    })

    it('handles empty string', () => {
      expect(truncate('', 5)).toBe('')
    })
  })

  describe('getInitials', () => {
    it('returns initials for two words', () => {
      expect(getInitials('Jean Dupont')).toBe('JD')
    })

    it('returns single initial for one word', () => {
      expect(getInitials('Jean')).toBe('J')
    })

    it('returns max 2 initials for more words', () => {
      expect(getInitials('Jean Pierre Dupont')).toBe('JP')
    })

    it('returns uppercase', () => {
      expect(getInitials('jean dupont')).toBe('JD')
    })
  })

  describe('formatPhone', () => {
    it('returns dash for null', () => {
      expect(formatPhone(null)).toBe('-')
    })

    it('returns dash for undefined', () => {
      expect(formatPhone(undefined)).toBe('-')
    })

    it('formats phone number with country code', () => {
      const result = formatPhone('+243991234567')
      // Should contain formatted parts
      expect(result).toBeTruthy()
    })

    it('returns unformatted if pattern does not match', () => {
      expect(formatPhone('123')).toBe('123')
    })
  })

  describe('formatFileSize', () => {
    it('returns "0 B" for zero bytes', () => {
      expect(formatFileSize(0)).toBe('0 B')
    })

    it('formats bytes', () => {
      expect(formatFileSize(500)).toBe('500 B')
    })

    it('formats kilobytes', () => {
      expect(formatFileSize(1024)).toBe('1 KB')
    })

    it('formats megabytes', () => {
      expect(formatFileSize(1048576)).toBe('1 MB')
    })

    it('formats with decimals', () => {
      expect(formatFileSize(1536)).toBe('1.5 KB')
    })

    it('formats gigabytes', () => {
      expect(formatFileSize(1073741824)).toBe('1 GB')
    })
  })
})
