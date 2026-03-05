import fr from '~/presentation/locales/fr/index'
import en from '~/presentation/locales/en/index'
import ln from '~/presentation/locales/ln/index'
import sw from '~/presentation/locales/sw/index'
import lua from '~/presentation/locales/lua/index'
import kg from '~/presentation/locales/kg/index'

export type Locale = 'fr' | 'en' | 'ln' | 'sw' | 'lua' | 'kg'

type Translations = Record<string, string>

const translations: Record<Locale, Translations> = { fr, en, ln, sw, lua, kg }

const currentLocale = ref<Locale>('fr')

const STORAGE_KEY = 'futela_locale'

export const useLocale = () => {
  // Restore saved locale from localStorage (client-side only)
  if (import.meta.client) {
    const saved = localStorage.getItem(STORAGE_KEY) as Locale | null
    if (saved && translations[saved]) {
      currentLocale.value = saved
    }
  }

  const locale = computed(() => currentLocale.value)

  const setLocale = (newLocale: Locale) => {
    currentLocale.value = newLocale
    if (import.meta.client) {
      localStorage.setItem(STORAGE_KEY, newLocale)
    }
  }

  /**
   * Translate a key. Falls back to French, then to the key itself.
   * Supports {placeholder} interpolation: t('auth.resendIn', { seconds: 30 })
   */
  const t = (key: string, params?: Record<string, string | number>): string => {
    let value = translations[currentLocale.value]?.[key] || translations.fr[key] || key
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        value = value.replace(`{${k}}`, String(v))
      }
    }
    return value
  }

  const localeOptions = [
    { value: 'fr' as Locale, label: 'FR', fullLabel: 'Français' },
    { value: 'en' as Locale, label: 'EN', fullLabel: 'English' },
    { value: 'ln' as Locale, label: 'LN', fullLabel: 'Lingála' },
    { value: 'sw' as Locale, label: 'SW', fullLabel: 'Kiswahili' },
    { value: 'lua' as Locale, label: 'LU', fullLabel: 'Tshiluba' },
    { value: 'kg' as Locale, label: 'KG', fullLabel: 'Kikongo' },
  ]

  return { locale, setLocale, t, localeOptions, currentLocale }
}
