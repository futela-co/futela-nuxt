import type { ApiError } from '~/composables/useApi'

/**
 * Validation rule type
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type FormValidationRule<T = any> = (value: T, data: Record<string, any>) => string | true

/**
 * Validation rules for a field
 */
export type FieldRules<T = any> = FormValidationRule<T> | FormValidationRule<T>[]

/**
 * Form options interface
 */
export interface FormOptions<T extends Record<string, any>> {
  /** Initial form data */
  initialData: T
  /** Validation rules */
  rules?: Partial<Record<keyof T, FieldRules>>
  /** Transform data before submission */
  transform?: (data: T) => any
  /** Reset form after successful submission */
  resetOnSuccess?: boolean
  /** Clear errors on input */
  clearErrorsOnInput?: boolean
  /** Validate on blur */
  validateOnBlur?: boolean
  /** Validate on input */
  validateOnInput?: boolean
}

/**
 * Form field state
 */
export interface FieldState {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any
  error: string | null
  touched: boolean
  dirty: boolean
}

/**
 * Form composable
 * Provides state and methods for managing form data, validation, and submission
 */
export function useForm<T extends Record<string, any>>(options: FormOptions<T>) {
  const {
    initialData,
    rules = {} as Partial<Record<keyof T, FieldRules>>,
    transform,
    resetOnSuccess = false,
    clearErrorsOnInput = true,
    validateOnBlur = true,
    validateOnInput = false
  } = options

  // ============================================
  // State
  // ============================================

  /** Form data */
  const data = reactive<T>({ ...initialData }) as T

  /** Validation errors by field */
  const errors = reactive<Record<string, string | undefined>>({})

  /** Submission state */
  const isSubmitting = ref(false)

  /** Whether form has been submitted at least once */
  const hasSubmitted = ref(false)

  /** Fields that have been touched (focused and blurred) */
  const touched = reactive<Record<string, boolean | undefined>>({})

  /** Fields that have been modified */
  const dirty = reactive<Record<string, boolean | undefined>>({})

  /** Processing state for individual operations */
  const processing = ref(false)

  /** General form error (non-field specific) */
  const formError = ref<string | null>(null)

  // ============================================
  // Computed
  // ============================================

  /**
   * Check if form has any errors
   */
  const hasErrors = computed(() => {
    return Object.values(errors).some(error => !!error)
  })

  /**
   * Check if form is valid
   */
  const isValid = computed(() => !hasErrors.value)

  /**
   * Check if any field has been modified
   */
  const isDirty = computed(() => {
    return Object.values(dirty).some(d => d)
  })

  /**
   * Check if form data has changed from initial
   */
  const hasChanges = computed(() => {
    return Object.keys(initialData).some(key => {
      const k = key as keyof T
      return data[k] !== initialData[k]
    })
  })

  /**
   * Get all errors as an array
   */
  const errorList = computed(() => {
    const list: { field: keyof T; message: string }[] = []
    for (const [field, message] of Object.entries(errors)) {
      if (message) {
        list.push({ field: field as keyof T, message })
      }
    }
    return list
  })

  // ============================================
  // Validation Methods
  // ============================================

  /**
   * Validate a single field
   */
  function validateField(field: keyof T): boolean {
    const fieldRules = rules[field]
    const fieldKey = field as string
    if (!fieldRules) {
      errors[fieldKey] = undefined
      return true
    }

    const rulesArray = Array.isArray(fieldRules) ? fieldRules : [fieldRules]
    const value = data[field]

    for (const rule of rulesArray) {
      const result = rule(value, data as Record<string, any>)
      if (result !== true) {
        errors[fieldKey] = result
        return false
      }
    }

    errors[fieldKey] = undefined
    return true
  }

  /**
   * Validate all fields
   */
  function validate(): boolean {
    let isValid = true

    for (const field of Object.keys(rules) as (keyof T)[]) {
      if (!validateField(field)) {
        isValid = false
      }
    }

    return isValid
  }

  /**
   * Clear error for a field
   */
  function clearError(field: keyof T) {
    errors[field as string] = undefined
  }

  /**
   * Clear all errors
   */
  function clearErrors() {
    for (const field of Object.keys(errors)) {
      errors[field] = undefined
    }
    formError.value = null
  }

  /**
   * Set error for a field
   */
  function setError(field: keyof T, message: string) {
    errors[field as string] = message
  }

  /**
   * Set multiple errors
   */
  function setErrors(fieldErrors: Partial<Record<keyof T, string>>) {
    for (const [field, message] of Object.entries(fieldErrors)) {
      if (message) {
        errors[field] = message
      }
    }
  }

  /**
   * Set errors from API response
   */
  function setErrorsFromApi(apiError: ApiError) {
    formError.value = apiError.message

    if (apiError.errors) {
      for (const [field, messages] of Object.entries(apiError.errors)) {
        if (messages && messages.length > 0) {
          errors[field] = messages[0]
        }
      }
    }
  }

  // ============================================
  // Form Methods
  // ============================================

  /**
   * Handle field input
   */
  function handleInput(field: keyof T, value: any) {
    const fieldKey = field as string
    data[field] = value
    dirty[fieldKey] = true

    if (clearErrorsOnInput) {
      clearError(field)
    }

    if (validateOnInput && (hasSubmitted.value || touched[fieldKey])) {
      validateField(field)
    }
  }

  /**
   * Handle field blur
   */
  function handleBlur(field: keyof T) {
    touched[field as string] = true

    if (validateOnBlur) {
      validateField(field)
    }
  }

  /**
   * Reset form to initial state
   */
  function reset() {
    // Reset data
    for (const key of Object.keys(initialData) as (keyof T)[]) {
      data[key] = initialData[key]
    }

    // Clear all state
    clearErrors()
    for (const key of Object.keys(touched)) {
      touched[key] = false
    }
    for (const key of Object.keys(dirty)) {
      dirty[key] = false
    }
    hasSubmitted.value = false
    formError.value = null
  }

  /**
   * Reset specific fields
   */
  function resetFields(fields: (keyof T)[]) {
    for (const field of fields) {
      const fieldKey = field as string
      data[field] = initialData[field]
      clearError(field)
      touched[fieldKey] = false
      dirty[fieldKey] = false
    }
  }

  /**
   * Set form data
   */
  function setData(newData: Partial<T>) {
    for (const [key, value] of Object.entries(newData)) {
      const k = key as keyof T
      if (k in data) {
        data[k] = value as T[keyof T]
      }
    }
  }

  /**
   * Set a single field value
   */
  function setFieldValue(field: keyof T, value: T[keyof T]) {
    data[field] = value
  }

  /**
   * Get field value
   */
  function getFieldValue<K extends keyof T>(field: K): T[K] {
    return data[field]
  }

  /**
   * Get field error
   */
  function getFieldError(field: keyof T): string | undefined {
    return errors[field as string]
  }

  /**
   * Check if field has error
   */
  function hasFieldError(field: keyof T): boolean {
    return !!errors[field as string]
  }

  /**
   * Check if field is touched
   */
  function isFieldTouched(field: keyof T): boolean {
    return !!touched[field as string]
  }

  /**
   * Check if field is dirty
   */
  function isFieldDirty(field: keyof T): boolean {
    return !!dirty[field as string]
  }

  /**
   * Submit form
   */
  async function submit<R = any>(
    handler: (data: T) => Promise<R>
  ): Promise<R | undefined> {
    hasSubmitted.value = true
    clearErrors()

    // Validate
    if (!validate()) {
      return undefined
    }

    isSubmitting.value = true

    try {
      // Transform data if needed
      const submitData = transform ? transform({ ...data }) : { ...data }

      const result = await handler(submitData)

      if (resetOnSuccess) {
        reset()
      }

      return result
    } catch (error: any) {
      if (error.errors || error.message) {
        setErrorsFromApi(error as ApiError)
      } else {
        formError.value = 'An unexpected error occurred'
      }
      throw error
    } finally {
      isSubmitting.value = false
    }
  }

  /**
   * Get field props for binding to input components
   */
  function getFieldProps(field: keyof T) {
    const fieldKey = field as string
    return {
      modelValue: data[field],
      error: errors[fieldKey],
      'onUpdate:modelValue': (value: any) => handleInput(field, value),
      onBlur: () => handleBlur(field)
    }
  }

  /**
   * Register field (alternative to getFieldProps)
   */
  function register(field: keyof T) {
    const fieldKey = field as string
    return {
      value: computed({
        get: () => data[field],
        set: (v) => handleInput(field, v)
      }),
      error: computed(() => errors[fieldKey]),
      touched: computed(() => touched[fieldKey]),
      dirty: computed(() => dirty[fieldKey]),
      onBlur: () => handleBlur(field)
    }
  }

  return {
    // State
    data,
    errors,
    isSubmitting,
    hasSubmitted,
    touched,
    dirty,
    processing,
    formError,

    // Computed
    hasErrors,
    isValid,
    isDirty,
    hasChanges,
    errorList,

    // Validation
    validateField,
    validate,
    clearError,
    clearErrors,
    setError,
    setErrors,
    setErrorsFromApi,

    // Form methods
    handleInput,
    handleBlur,
    reset,
    resetFields,
    setData,
    setFieldValue,
    getFieldValue,
    getFieldError,
    hasFieldError,
    isFieldTouched,
    isFieldDirty,
    submit,
    getFieldProps,
    register
  }
}

// Validation rules are available from ~/utils/validators.ts (auto-imported by Nuxt)
