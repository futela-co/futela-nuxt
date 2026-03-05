import { describe, it, expect, vi } from 'vitest'
import {
  debounce,
  deepClone,
  isEmpty,
  pick,
  omit,
  slugify,
  pluralize,
  sleep,
  buildQueryString,
} from '~shared/utils/helpers'

describe('helpers', () => {
  describe('debounce', () => {
    it('delays function execution', async () => {
      vi.useFakeTimers()
      const fn = vi.fn()
      const debounced = debounce(fn, 100)

      debounced()
      expect(fn).not.toHaveBeenCalled()

      vi.advanceTimersByTime(100)
      expect(fn).toHaveBeenCalledOnce()

      vi.useRealTimers()
    })

    it('cancels previous call on rapid invocations', () => {
      vi.useFakeTimers()
      const fn = vi.fn()
      const debounced = debounce(fn, 100)

      debounced()
      debounced()
      debounced()

      vi.advanceTimersByTime(100)
      expect(fn).toHaveBeenCalledOnce()

      vi.useRealTimers()
    })

    it('passes arguments to debounced function', () => {
      vi.useFakeTimers()
      const fn = vi.fn()
      const debounced = debounce(fn, 50)

      debounced('hello', 42)
      vi.advanceTimersByTime(50)

      expect(fn).toHaveBeenCalledWith('hello', 42)

      vi.useRealTimers()
    })
  })

  describe('deepClone', () => {
    it('clones a simple object', () => {
      const obj = { a: 1, b: 'hello' }
      const clone = deepClone(obj)
      expect(clone).toEqual(obj)
      expect(clone).not.toBe(obj)
    })

    it('clones nested objects', () => {
      const obj = { a: { b: { c: 42 } } }
      const clone = deepClone(obj)
      expect(clone).toEqual(obj)
      expect(clone.a).not.toBe(obj.a)
      expect(clone.a.b).not.toBe(obj.a.b)
    })

    it('clones arrays', () => {
      const arr = [1, 2, [3, 4]]
      const clone = deepClone(arr)
      expect(clone).toEqual(arr)
      expect(clone).not.toBe(arr)
    })
  })

  describe('isEmpty', () => {
    it('returns true for null', () => {
      expect(isEmpty(null)).toBe(true)
    })

    it('returns true for undefined', () => {
      expect(isEmpty(undefined)).toBe(true)
    })

    it('returns true for empty string', () => {
      expect(isEmpty('')).toBe(true)
    })

    it('returns true for whitespace-only string', () => {
      expect(isEmpty('   ')).toBe(true)
    })

    it('returns true for empty array', () => {
      expect(isEmpty([])).toBe(true)
    })

    it('returns true for empty object', () => {
      expect(isEmpty({})).toBe(true)
    })

    it('returns false for non-empty string', () => {
      expect(isEmpty('hello')).toBe(false)
    })

    it('returns false for non-empty array', () => {
      expect(isEmpty([1])).toBe(false)
    })

    it('returns false for non-empty object', () => {
      expect(isEmpty({ a: 1 })).toBe(false)
    })

    it('returns false for number 0', () => {
      expect(isEmpty(0)).toBe(false)
    })

    it('returns false for boolean false', () => {
      expect(isEmpty(false)).toBe(false)
    })
  })

  describe('pick', () => {
    it('picks specified keys', () => {
      const obj = { a: 1, b: 2, c: 3 }
      expect(pick(obj, ['a', 'c'])).toEqual({ a: 1, c: 3 })
    })

    it('ignores missing keys', () => {
      const obj = { a: 1, b: 2 }
      expect(pick(obj, ['a', 'c' as any])).toEqual({ a: 1 })
    })

    it('returns empty object for empty keys', () => {
      expect(pick({ a: 1 }, [])).toEqual({})
    })
  })

  describe('omit', () => {
    it('omits specified keys', () => {
      const obj = { a: 1, b: 2, c: 3 }
      expect(omit(obj, ['b'])).toEqual({ a: 1, c: 3 })
    })

    it('returns full object if no keys omitted', () => {
      const obj = { a: 1, b: 2 }
      expect(omit(obj, [])).toEqual({ a: 1, b: 2 })
    })

    it('handles omitting non-existent keys', () => {
      const obj = { a: 1 }
      expect(omit(obj, ['z' as any])).toEqual({ a: 1 })
    })
  })

  describe('slugify', () => {
    it('converts to lowercase', () => {
      expect(slugify('Hello World')).toBe('hello-world')
    })

    it('replaces spaces with hyphens', () => {
      expect(slugify('hello world')).toBe('hello-world')
    })

    it('removes accents', () => {
      expect(slugify('Café Résumé')).toBe('cafe-resume')
    })

    it('removes special characters', () => {
      expect(slugify('hello@world!')).toBe('hello-world')
    })

    it('removes leading/trailing hyphens', () => {
      expect(slugify('-hello-')).toBe('hello')
    })

    it('handles multiple spaces', () => {
      expect(slugify('hello   world')).toBe('hello-world')
    })

    it('handles empty string', () => {
      expect(slugify('')).toBe('')
    })

    it('handles French text', () => {
      expect(slugify('Appartement à Kinshasa')).toBe('appartement-a-kinshasa')
    })
  })

  describe('pluralize', () => {
    it('returns singular for count 0', () => {
      expect(pluralize(0, 'maison')).toBe('maison')
    })

    it('returns singular for count 1', () => {
      expect(pluralize(1, 'maison')).toBe('maison')
    })

    it('returns plural with s for count > 1', () => {
      expect(pluralize(2, 'maison')).toBe('maisons')
    })

    it('uses custom plural', () => {
      expect(pluralize(3, 'animal', 'animaux')).toBe('animaux')
    })
  })

  describe('sleep', () => {
    it('resolves after delay', async () => {
      vi.useFakeTimers()

      const promise = sleep(100)
      vi.advanceTimersByTime(100)
      await promise

      vi.useRealTimers()
    })
  })

  describe('buildQueryString', () => {
    it('builds query string from params', () => {
      const result = buildQueryString({ page: 1, search: 'hello' })
      expect(result).toContain('page=1')
      expect(result).toContain('search=hello')
      expect(result.startsWith('?')).toBe(true)
    })

    it('skips null values', () => {
      const result = buildQueryString({ page: 1, search: null })
      expect(result).toBe('?page=1')
    })

    it('skips undefined values', () => {
      const result = buildQueryString({ page: 1, search: undefined })
      expect(result).toBe('?page=1')
    })

    it('skips empty string values', () => {
      const result = buildQueryString({ page: 1, search: '' })
      expect(result).toBe('?page=1')
    })

    it('returns empty string for no params', () => {
      expect(buildQueryString({})).toBe('')
    })

    it('returns empty string for all-null params', () => {
      expect(buildQueryString({ a: null, b: undefined, c: '' })).toBe('')
    })
  })
})
