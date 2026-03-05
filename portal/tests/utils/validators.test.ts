import { describe, it, expect } from 'vitest'
import {
  required,
  email,
  minLength,
  maxLength,
  min,
  max,
  pattern,
  phone,
  numeric,
  confirmed,
} from '~/utils/validators'

describe('validators', () => {
  describe('required', () => {
    const validate = required()

    it('returns error for null', () => {
      expect(validate(null)).toBe('Ce champ est requis')
    })

    it('returns error for undefined', () => {
      expect(validate(undefined)).toBe('Ce champ est requis')
    })

    it('returns error for empty string', () => {
      expect(validate('')).toBe('Ce champ est requis')
    })

    it('returns error for empty array', () => {
      expect(validate([])).toBe('Ce champ est requis')
    })

    it('returns true for non-empty string', () => {
      expect(validate('hello')).toBe(true)
    })

    it('returns true for non-empty array', () => {
      expect(validate([1])).toBe(true)
    })

    it('returns true for number 0', () => {
      expect(validate(0)).toBe(true)
    })

    it('uses custom message', () => {
      const custom = required('Obligatoire')
      expect(custom('')).toBe('Obligatoire')
    })
  })

  describe('email', () => {
    const validate = email()

    it('returns true for empty value (not required)', () => {
      expect(validate('')).toBe(true)
      expect(validate(null)).toBe(true)
    })

    it('returns true for valid email', () => {
      expect(validate('user@example.com')).toBe(true)
    })

    it('returns true for email with subdomain', () => {
      expect(validate('user@mail.example.com')).toBe(true)
    })

    it('returns error for invalid email', () => {
      expect(validate('invalid')).toBe('Email invalide')
    })

    it('returns error for email without domain', () => {
      expect(validate('user@')).toBe('Email invalide')
    })

    it('returns error for email without @', () => {
      expect(validate('userexample.com')).toBe('Email invalide')
    })

    it('uses custom message', () => {
      const custom = email('Format incorrect')
      expect(custom('bad')).toBe('Format incorrect')
    })
  })

  describe('minLength', () => {
    const validate = minLength(3)

    it('returns true for empty value (not required)', () => {
      expect(validate('')).toBe(true)
      expect(validate(null)).toBe(true)
    })

    it('returns true for value at minimum length', () => {
      expect(validate('abc')).toBe(true)
    })

    it('returns true for value above minimum', () => {
      expect(validate('abcdef')).toBe(true)
    })

    it('returns error for value below minimum', () => {
      expect(validate('ab')).toBe('Minimum 3 caractères')
    })

    it('uses custom message', () => {
      const custom = minLength(5, 'Trop court')
      expect(custom('ab')).toBe('Trop court')
    })
  })

  describe('maxLength', () => {
    const validate = maxLength(5)

    it('returns true for empty value', () => {
      expect(validate('')).toBe(true)
    })

    it('returns true for value at maximum length', () => {
      expect(validate('abcde')).toBe(true)
    })

    it('returns true for value below maximum', () => {
      expect(validate('abc')).toBe(true)
    })

    it('returns error for value above maximum', () => {
      expect(validate('abcdef')).toBe('Maximum 5 caractères')
    })

    it('uses custom message', () => {
      const custom = maxLength(3, 'Trop long')
      expect(custom('abcde')).toBe('Trop long')
    })
  })

  describe('min', () => {
    const validate = min(10)

    it('returns true for empty value', () => {
      expect(validate(null)).toBe(true)
      expect(validate(undefined)).toBe(true)
      expect(validate('')).toBe(true)
    })

    it('returns true for value at minimum', () => {
      expect(validate(10)).toBe(true)
    })

    it('returns true for value above minimum', () => {
      expect(validate(20)).toBe(true)
    })

    it('returns error for value below minimum', () => {
      expect(validate(5)).toBe('Minimum 10')
    })

    it('works with string numbers', () => {
      expect(validate('15')).toBe(true)
      expect(validate('5')).toBe('Minimum 10')
    })
  })

  describe('max', () => {
    const validate = max(100)

    it('returns true for empty value', () => {
      expect(validate(null)).toBe(true)
    })

    it('returns true for value at maximum', () => {
      expect(validate(100)).toBe(true)
    })

    it('returns error for value above maximum', () => {
      expect(validate(101)).toBe('Maximum 100')
    })
  })

  describe('pattern', () => {
    const validate = pattern(/^[A-Z]+$/)

    it('returns true for empty value', () => {
      expect(validate('')).toBe(true)
    })

    it('returns true for matching pattern', () => {
      expect(validate('ABC')).toBe(true)
    })

    it('returns error for non-matching pattern', () => {
      expect(validate('abc')).toBe('Format invalide')
    })

    it('uses custom message', () => {
      const custom = pattern(/^\d+$/, 'Chiffres uniquement')
      expect(custom('abc')).toBe('Chiffres uniquement')
    })
  })

  describe('phone', () => {
    const validate = phone()

    it('returns true for empty value', () => {
      expect(validate('')).toBe(true)
    })

    it('returns true for valid phone with +', () => {
      expect(validate('+243991234567')).toBe(true)
    })

    it('returns true for valid phone without +', () => {
      expect(validate('0991234567')).toBe(true)
    })

    it('returns error for too short', () => {
      expect(validate('12345')).toBe('Numéro de téléphone invalide')
    })

    it('returns error for letters', () => {
      expect(validate('abcdefghij')).toBe('Numéro de téléphone invalide')
    })
  })

  describe('numeric', () => {
    const validate = numeric()

    it('returns true for empty value', () => {
      expect(validate(null)).toBe(true)
      expect(validate('')).toBe(true)
    })

    it('returns true for number', () => {
      expect(validate(42)).toBe(true)
    })

    it('returns true for string number', () => {
      expect(validate('42.5')).toBe(true)
    })

    it('returns error for non-numeric string', () => {
      expect(validate('abc')).toBe('Doit être un nombre')
    })
  })

  describe('confirmed', () => {
    it('returns true when values match', () => {
      const validate = confirmed(() => 'password123')
      expect(validate('password123')).toBe(true)
    })

    it('returns error when values differ', () => {
      const validate = confirmed(() => 'password123')
      expect(validate('different')).toBe('Les champs ne correspondent pas')
    })

    it('uses custom message', () => {
      const validate = confirmed(() => 'a', 'Pas identique')
      expect(validate('b')).toBe('Pas identique')
    })
  })
})
