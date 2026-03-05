export type ValidationRule = (value: any) => string | true

export function required(message = 'Ce champ est requis'): ValidationRule {
  return (value: any) => {
    if (value === null || value === undefined || value === '' || (Array.isArray(value) && value.length === 0)) {
      return message
    }
    return true
  }
}

export function email(message = 'Email invalide'): ValidationRule {
  return (value: any) => {
    if (!value) return true
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(value) ? true : message
  }
}

export function minLength(min: number, message?: string): ValidationRule {
  return (value: any) => {
    if (!value) return true
    return value.length >= min ? true : (message ?? `Minimum ${min} caractères`)
  }
}

export function maxLength(max: number, message?: string): ValidationRule {
  return (value: any) => {
    if (!value) return true
    return value.length <= max ? true : (message ?? `Maximum ${max} caractères`)
  }
}

export function min(minVal: number, message?: string): ValidationRule {
  return (value: any) => {
    if (value === null || value === undefined || value === '') return true
    return Number(value) >= minVal ? true : (message ?? `Minimum ${minVal}`)
  }
}

export function max(maxVal: number, message?: string): ValidationRule {
  return (value: any) => {
    if (value === null || value === undefined || value === '') return true
    return Number(value) <= maxVal ? true : (message ?? `Maximum ${maxVal}`)
  }
}

export function pattern(regex: RegExp, message = 'Format invalide'): ValidationRule {
  return (value: any) => {
    if (!value) return true
    return regex.test(value) ? true : message
  }
}

export function phone(message = 'Numéro de téléphone invalide'): ValidationRule {
  return pattern(/^\+?[0-9]{9,15}$/, message)
}

export function numeric(message = 'Doit être un nombre'): ValidationRule {
  return (value: any) => {
    if (value === null || value === undefined || value === '') return true
    return !isNaN(Number(value)) ? true : message
  }
}

export function confirmed(fieldGetter: () => any, message = 'Les champs ne correspondent pas'): ValidationRule {
  return (value: any) => {
    return value === fieldGetter() ? true : message
  }
}
