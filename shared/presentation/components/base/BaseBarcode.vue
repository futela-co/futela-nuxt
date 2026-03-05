<script setup lang="ts">
/**
 * BaseBarcode.vue
 * Composant pour afficher un code-barres visuel
 * Utilise JsBarcode pour générer le code-barres en SVG puis converti en image
 */
// @ts-expect-error jsbarcode has no type declarations
import JsBarcode from 'jsbarcode'

interface Props {
  value: string
  format?: 'CODE128' | 'EAN13' | 'EAN8' | 'UPC' | 'CODE39' | 'ITF14' | 'MSI' | 'pharmacode'
  width?: number
  height?: number
  displayValue?: boolean
  fontSize?: number
  textMargin?: number
  background?: string
  lineColor?: string
  flat?: boolean
  textAlign?: 'left' | 'center' | 'right'
  textPosition?: 'top' | 'bottom'
}

const props = withDefaults(defineProps<Props>(), {
  format: 'CODE128',
  width: 2,
  height: 50,
  displayValue: true,
  fontSize: 14,
  textMargin: 2,
  background: '#ffffff',
  lineColor: '#000000',
  flat: false,
  textAlign: 'center',
  textPosition: 'bottom'
})

const canvasRef = ref<HTMLCanvasElement | null>(null)
const error = ref<string | null>(null)
const isGenerated = ref(false)

const hasValue = computed(() => !!props.value && props.value.trim() !== '')

async function generateBarcode() {
  error.value = null
  isGenerated.value = false

  if (!hasValue.value) {
    return
  }

  // Wait for DOM to be ready
  await nextTick()

  if (!canvasRef.value) {
    console.error('Canvas ref not available')
    return
  }

  try {
    JsBarcode(canvasRef.value, props.value, {
      format: props.format,
      width: props.width,
      height: props.height,
      displayValue: props.displayValue,
      fontSize: props.fontSize,
      textMargin: props.textMargin,
      background: props.background,
      lineColor: props.lineColor,
      margin: 10,
      flat: props.flat,
      textAlign: props.textAlign,
      textPosition: props.textPosition,
      valid: (valid: boolean) => {
        if (!valid) {
          error.value = 'Code-barres invalide pour ce format'
          isGenerated.value = false
        }
      }
    })

    if (!error.value) {
      isGenerated.value = true
    }
  } catch (err: any) {
    console.error('Barcode generation error:', err)
    error.value = err.message || 'Impossible de générer le code-barres'
    isGenerated.value = false
  }
}

onMounted(() => {
  if (hasValue.value) {
    generateBarcode()
  }
})

watch(() => props.value, (newVal) => {
  if (newVal) {
    generateBarcode()
  }
})

watch(() => props.format, () => {
  if (hasValue.value) {
    generateBarcode()
  }
})
</script>

<template>
  <div class="barcode-container inline-block">
    <!-- Canvas for barcode rendering -->
    <canvas
      v-show="hasValue && !error"
      ref="canvasRef"
      class="barcode block"
    />

    <!-- Error message -->
    <div
      v-if="error"
      class="text-center"
    >
      <span class="inline-block px-3 py-1 text-xs font-mono bg-red-100 text-red-700 rounded-full">
        {{ value }}
      </span>
      <p class="text-xs font-medium text-red-500 mt-0.5">
        {{ error }}
      </p>
    </div>

    <!-- No barcode message -->
    <div
      v-if="!hasValue && !error"
      class="text-xs text-gray-400 py-2"
    >
      Aucun code-barres
    </div>
  </div>
</template>
