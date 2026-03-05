/**
 * Composable pour persister les donnees de formulaire dans le localStorage.
 * Les donnees sont automatiquement sauvegardees quand elles changent,
 * et supprimees quand le formulaire est soumis ou annule.
 *
 * @param storageKey - Cle unique pour identifier les donnees dans le localStorage
 * @param formData - Reference reactive aux donnees du formulaire
 * @param isEditMode - Reference reactive indiquant si on est en mode edition
 */
export function useFormStorage<T extends Record<string, unknown>>(
  storageKey: string,
  formData: Ref<T>,
  isEditMode: Ref<boolean>
) {
  const STORAGE_PREFIX = 'futela_form_'
  const fullKey = `${STORAGE_PREFIX}${storageKey}`

  /**
   * Sauvegarde les donnees du formulaire dans le localStorage
   */
  function saveToStorage() {
    // Ne pas sauvegarder en mode edition
    if (isEditMode.value) return

    try {
      const dataToSave = {
        data: formData.value,
        timestamp: Date.now()
      }
      localStorage.setItem(fullKey, JSON.stringify(dataToSave))
    } catch (err) {
      console.warn(`Failed to save form data to localStorage (${storageKey}):`, err)
    }
  }

  /**
   * Restaure les donnees du formulaire depuis le localStorage
   * @returns true si des donnees ont ete restaurees, false sinon
   */
  function restoreFromStorage(): boolean {
    // Ne pas restaurer en mode edition
    if (isEditMode.value) return false

    try {
      const saved = localStorage.getItem(fullKey)
      if (!saved) return false

      const parsed = JSON.parse(saved)

      // Verifier si les donnees ne sont pas trop anciennes (24h max)
      const maxAge = 24 * 60 * 60 * 1000 // 24 heures en millisecondes
      if (Date.now() - parsed.timestamp > maxAge) {
        clearStorage()
        return false
      }

      // Restaurer les donnees
      if (parsed.data && typeof parsed.data === 'object') {
        // Fusionner avec les valeurs existantes pour preserver la structure
        Object.keys(parsed.data).forEach(key => {
          if (key in formData.value) {
            const currentValue = formData.value[key]
            const savedValue = parsed.data[key]

            // Verifier la compatibilite des types
            if (Array.isArray(currentValue) && Array.isArray(savedValue)) {
              // Pour les tableaux, remplacer directement
              (formData.value as Record<string, unknown>)[key] = savedValue
            } else if (
              typeof currentValue === typeof savedValue ||
              currentValue === null ||
              currentValue === undefined ||
              savedValue === null ||
              savedValue === undefined
            ) {
              // Types compatibles ou valeurs nullables
              (formData.value as Record<string, unknown>)[key] = savedValue
            }
            // Sinon, ignorer la valeur incompatible
          }
        })
        return true
      }
    } catch (err) {
      console.warn(`Failed to restore form data from localStorage (${storageKey}):`, err)
      clearStorage()
    }

    return false
  }

  /**
   * Supprime les donnees du localStorage
   */
  function clearStorage() {
    try {
      localStorage.removeItem(fullKey)
    } catch (err) {
      console.warn(`Failed to clear form data from localStorage (${storageKey}):`, err)
    }
  }

  /**
   * Verifie si des donnees existent dans le localStorage
   */
  function hasStoredData(): boolean {
    try {
      return localStorage.getItem(fullKey) !== null
    } catch {
      return false
    }
  }

  /**
   * Configure le watch automatique pour sauvegarder les changements
   * @param immediate - Si true, sauvegarde immediatement les donnees actuelles
   */
  function enableAutoSave(immediate = false) {
    watch(
      formData,
      () => {
        saveToStorage()
      },
      { deep: true, immediate }
    )
  }

  return {
    saveToStorage,
    restoreFromStorage,
    clearStorage,
    hasStoredData,
    enableAutoSave
  }
}
