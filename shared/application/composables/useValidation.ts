/**
 * Validation rule function type
 */
export type Validator<T = unknown> = (_value: T) => string | true

/**
 * Validation result interface
 */
export interface ValidationResult {
  /** Whether validation passed */
  valid: boolean
  /** Array of error messages */
  errors: string[]
}

/**
 * Validation rules object type
 */
export type ValidationRules<T = unknown> = Validator<T> | Validator<T>[]

/**
 * Common validators factory
 */
export const validators = {
  /**
   * Required field validator
   */
  required(message = 'This field is required'): Validator {
    return (value) => {
      if (value === undefined || value === null || value === '') {
        return message
      }
      if (Array.isArray(value) && value.length === 0) {
        return message
      }
      return true
    }
  },

  /**
   * Email validator
   */
  email(message = 'Please enter a valid email address'): Validator<string> {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return (value) => {
      if (!value) return true // Use required for empty check
      return emailRegex.test(value) ? true : message
    }
  },

  /**
   * Minimum length validator
   */
  minLength(min: number, message?: string): Validator<string> {
    return (value) => {
      if (!value) return true
      return value.length >= min
        ? true
        : message ?? `Must be at least ${min} characters`
    }
  },

  /**
   * Maximum length validator
   */
  maxLength(max: number, message?: string): Validator<string> {
    return (value) => {
      if (!value) return true
      return value.length <= max
        ? true
        : message ?? `Must be no more than ${max} characters`
    }
  },

  /**
   * Phone number validator
   */
  phone(message = 'Please enter a valid phone number'): Validator<string> {
    // Supports various phone formats: +XXX XXX XXX XXX, (XXX) XXX-XXXX, etc.
    const phoneRegex = /^[+]?[\d\s\-().]{8,}$/
    return (value) => {
      if (!value) return true
      const cleaned = value.replace(/\s/g, '')
      return phoneRegex.test(cleaned) ? true : message
    }
  },

  /**
   * Numeric validator (string that contains only digits)
   */
  numeric(message = 'Must contain only numbers'): Validator<string> {
    return (value) => {
      if (!value) return true
      return /^\d+$/.test(String(value)) ? true : message
    }
  },

  /**
   * Number validator (valid number including decimals)
   */
  number(message = 'Must be a valid number'): Validator {
    return (value) => {
      if (value === '' || value === null || value === undefined) return true
      return !isNaN(Number(value)) ? true : message
    }
  },

  /**
   * Integer validator
   */
  integer(message = 'Must be a whole number'): Validator {
    return (value) => {
      if (value === '' || value === null || value === undefined) return true
      return Number.isInteger(Number(value)) ? true : message
    }
  },

  /**
   * Minimum value validator
   */
  min(minValue: number, message?: string): Validator<number> {
    return (value) => {
      if (value === null || value === undefined) return true
      return Number(value) >= minValue
        ? true
        : message ?? `Must be at least ${minValue}`
    }
  },

  /**
   * Maximum value validator
   */
  max(maxValue: number, message?: string): Validator<number> {
    return (value) => {
      if (value === null || value === undefined) return true
      return Number(value) <= maxValue
        ? true
        : message ?? `Must be no more than ${maxValue}`
    }
  },

  /**
   * Between validator (inclusive)
   */
  between(minValue: number, maxValue: number, message?: string): Validator<number> {
    return (value) => {
      if (value === null || value === undefined) return true
      const num = Number(value)
      return num >= minValue && num <= maxValue
        ? true
        : message ?? `Must be between ${minValue} and ${maxValue}`
    }
  },

  /**
   * Pattern/Regex validator
   */
  pattern(regex: RegExp, message = 'Invalid format'): Validator<string> {
    return (value) => {
      if (!value) return true
      return regex.test(value) ? true : message
    }
  },

  /**
   * URL validator
   */
  url(message = 'Please enter a valid URL'): Validator<string> {
    return (value) => {
      if (!value) return true
      try {
        new URL(value)
        return true
      } catch {
        return message
      }
    }
  },

  /**
   * Alpha only validator (letters only)
   */
  alpha(message = 'Must contain only letters'): Validator<string> {
    return (value) => {
      if (!value) return true
      return /^[a-zA-Z]+$/.test(value) ? true : message
    }
  },

  /**
   * Alphanumeric validator
   */
  alphanumeric(message = 'Must contain only letters and numbers'): Validator<string> {
    return (value) => {
      if (!value) return true
      return /^[a-zA-Z0-9]+$/.test(value) ? true : message
    }
  },

  /**
   * Confirmed/matches validator (for password confirmation)
   */
  matches(compareValue: string | (() => string), message = 'Values do not match'): Validator<string> {
    return (value) => {
      const compare = typeof compareValue === 'function' ? compareValue() : compareValue
      return value === compare ? true : message
    }
  },

  /**
   * Date validator
   */
  date(message = 'Please enter a valid date'): Validator<string> {
    return (value) => {
      if (!value) return true
      const date = new Date(value)
      return !isNaN(date.getTime()) ? true : message
    }
  },

  /**
   * Date before validator
   */
  dateBefore(beforeDate: Date | string, message?: string): Validator<string> {
    return (value) => {
      if (!value) return true
      const date = new Date(value)
      const compare = new Date(beforeDate)
      return date < compare
        ? true
        : message ?? `Must be before ${compare.toLocaleDateString()}`
    }
  },

  /**
   * Date after validator
   */
  dateAfter(afterDate: Date | string, message?: string): Validator<string> {
    return (value) => {
      if (!value) return true
      const date = new Date(value)
      const compare = new Date(afterDate)
      return date > compare
        ? true
        : message ?? `Must be after ${compare.toLocaleDateString()}`
    }
  },

  /**
   * One of validator (value must be in list)
   */
  oneOf<T>(allowedValues: T[], message?: string): Validator<T> {
    return (value) => {
      if (value === null || value === undefined) return true
      return allowedValues.includes(value)
        ? true
        : message ?? `Must be one of: ${allowedValues.join(', ')}`
    }
  },

  /**
   * Custom validator
   */
  custom<T>(fn: (_value: T) => boolean, message = 'Invalid value'): Validator<T> {
    return (value) => {
      return fn(value) ? true : message
    }
  }
}

/**
 * Form validation composable
 * Provides validation utilities and common validators
 *
 * @example
 * ```ts
 * const { validate, validators } = useValidation()
 *
 * // Validate single value
 * const result = validate('test@example.com', [
 *   validators.required(),
 *   validators.email()
 * ])
 * // { valid: true, errors: [] }
 *
 * // Validate with single rule
 * const result = validate('', validators.required('Email is required'))
 * // { valid: false, errors: ['Email is required'] }
 * ```
 */
export function useValidation() {
  /**
   * Validate a value against one or more rules
   * @param value - Value to validate
   * @param rules - Single validator or array of validators
   * @returns Validation result with valid flag and errors array
   */
  function validate<T>(value: T, rules: ValidationRules<T>): ValidationResult {
    const errors: string[] = []
    const rulesArray = Array.isArray(rules) ? rules : [rules]

    for (const rule of rulesArray) {
      const result = rule(value)

      if (result !== true) {
        errors.push(result)
      }
    }

    return {
      valid: errors.length === 0,
      errors
    }
  }

  /**
   * Validate multiple values at once
   * @param data - Object with values to validate
   * @param schema - Object mapping keys to validation rules
   * @returns Object with validation results per field
   */
  function validateAll<T extends Record<string, unknown>>(
    data: T,
    schema: Partial<Record<keyof T, ValidationRules>>
  ): { valid: boolean; errors: Partial<Record<keyof T, string[]>> } {
    const errors: Partial<Record<keyof T, string[]>> = {}
    let valid = true

    for (const key of Object.keys(schema) as (keyof T)[]) {
      const rules = schema[key]
      const value = data[key]

      if (rules) {
        const result = validate(value, rules)

        if (!result.valid) {
          valid = false
          errors[key] = result.errors
        }
      }
    }

    return { valid, errors }
  }

  /**
   * Create a validator that runs multiple rules and returns first error
   */
  function chain<T>(...rules: Validator<T>[]): Validator<T> {
    return (value) => {
      for (const rule of rules) {
        const result = rule(value)
        if (result !== true) {
          return result
        }
      }
      return true
    }
  }

  /**
   * Create conditional validator
   */
  function when<T>(
    condition: boolean | (() => boolean),
    rules: ValidationRules<T>
  ): Validator<T> {
    return (value) => {
      const shouldValidate = typeof condition === 'function' ? condition() : condition

      if (!shouldValidate) {
        return true
      }

      const rulesArray = Array.isArray(rules) ? rules : [rules]

      for (const rule of rulesArray) {
        const result = rule(value)
        if (result !== true) {
          return result
        }
      }

      return true
    }
  }

  return {
    validate,
    validateAll,
    chain,
    when,
    validators
  }
}

/**
 * Type alias for useValidation return type
 */
export type ValidationComposable = ReturnType<typeof useValidation>
