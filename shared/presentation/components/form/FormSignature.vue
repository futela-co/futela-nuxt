<script setup lang="ts">
/**
 * FormSignature - Signature Pad Placeholder Component
 *
 * This is a placeholder component that provides basic signature capture functionality.
 * For production use with more features, consider integrating:
 * - signature_pad (https://github.com/szimek/signature_pad)
 * - vue-signature-pad (https://github.com/neighborhood999/vue-signature-pad)
 */

interface Props {
  modelValue?: string | null
  disabled?: boolean
  readonly?: boolean
  error?: string
  id?: string
  name?: string
  width?: number
  height?: number
  penColor?: string
  backgroundColor?: string
  lineWidth?: number
  showGuide?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: null,
  disabled: false,
  readonly: false,
  width: 400,
  height: 200,
  penColor: '#000000',
  backgroundColor: '#ffffff',
  lineWidth: 2,
  showGuide: true,
})

const emit = defineEmits<{
  'update:modelValue': [value: string | null]
  begin: []
  end: []
  clear: []
}>()

const generatedId = `signature-${Math.random().toString(36).substring(2, 9)}`
const signatureId = computed(() => props.id || generatedId)
const canvasRef = ref<HTMLCanvasElement | null>(null)
const isDrawing = ref(false)
const isEmpty = ref(true)
const lastX = ref(0)
const lastY = ref(0)

const containerClasses = computed(() => [
  'relative rounded border-2 overflow-hidden transition-colors duration-200',
  props.error
    ? 'border-red-500'
    : 'border-gray-300',
  props.disabled ? 'opacity-60 cursor-not-allowed' : '',
])

function getContext(): CanvasRenderingContext2D | null {
  return canvasRef.value?.getContext('2d') || null
}

function getCoordinates(event: MouseEvent | TouchEvent): { x: number; y: number } {
  const canvas = canvasRef.value
  if (!canvas) return { x: 0, y: 0 }

  const rect = canvas.getBoundingClientRect()
  const scaleX = canvas.width / rect.width
  const scaleY = canvas.height / rect.height

  if ('touches' in event) {
    const touch = event.touches[0]!
    return {
      x: (touch.clientX - rect.left) * scaleX,
      y: (touch.clientY - rect.top) * scaleY,
    }
  }

  return {
    x: (event.clientX - rect.left) * scaleX,
    y: (event.clientY - rect.top) * scaleY,
  }
}

function startDrawing(event: MouseEvent | TouchEvent) {
  if (props.disabled || props.readonly) return

  event.preventDefault()
  isDrawing.value = true
  isEmpty.value = false

  const { x, y } = getCoordinates(event)
  lastX.value = x
  lastY.value = y

  emit('begin')
}

function draw(event: MouseEvent | TouchEvent) {
  if (!isDrawing.value || props.disabled || props.readonly) return

  event.preventDefault()
  const ctx = getContext()
  if (!ctx) return

  const { x, y } = getCoordinates(event)

  ctx.beginPath()
  ctx.moveTo(lastX.value, lastY.value)
  ctx.lineTo(x, y)
  ctx.strokeStyle = props.penColor
  ctx.lineWidth = props.lineWidth
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.stroke()

  lastX.value = x
  lastY.value = y
}

function stopDrawing() {
  if (isDrawing.value) {
    isDrawing.value = false
    saveSignature()
    emit('end')
  }
}

function saveSignature() {
  const canvas = canvasRef.value
  if (!canvas) return

  const dataUrl = canvas.toDataURL('image/png')
  emit('update:modelValue', dataUrl)
}

function clearSignature() {
  const canvas = canvasRef.value
  const ctx = getContext()
  if (!canvas || !ctx) return

  ctx.fillStyle = props.backgroundColor
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  if (props.showGuide) {
    drawGuide(ctx, canvas.width, canvas.height)
  }

  isEmpty.value = true
  emit('update:modelValue', null)
  emit('clear')
}

function drawGuide(ctx: CanvasRenderingContext2D, width: number, height: number) {
  ctx.beginPath()
  ctx.strokeStyle = '#e5e7eb'
  ctx.lineWidth = 1
  ctx.setLineDash([5, 5])
  ctx.moveTo(20, height - 40)
  ctx.lineTo(width - 20, height - 40)
  ctx.stroke()
  ctx.setLineDash([])

  ctx.font = '12px Inter, system-ui, sans-serif'
  ctx.fillStyle = '#9ca3af'
  ctx.fillText('Signez ci-dessus', 20, height - 20)
}

function initCanvas() {
  const canvas = canvasRef.value
  const ctx = getContext()
  if (!canvas || !ctx) return

  canvas.width = props.width
  canvas.height = props.height

  ctx.fillStyle = props.backgroundColor
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  if (props.showGuide) {
    drawGuide(ctx, canvas.width, canvas.height)
  }

  if (props.modelValue) {
    loadSignature(props.modelValue)
  }
}

function loadSignature(dataUrl: string) {
  const canvas = canvasRef.value
  const ctx = getContext()
  if (!canvas || !ctx) return

  const img = new Image()
  img.onload = () => {
    ctx.drawImage(img, 0, 0)
    isEmpty.value = false
  }
  img.src = dataUrl
}

watch(() => props.modelValue, (newValue) => {
  if (newValue && canvasRef.value) {
    loadSignature(newValue)
  } else if (!newValue) {
    clearSignature()
  }
})

watch([() => props.width, () => props.height], () => {
  nextTick(initCanvas)
})

onMounted(() => {
  initCanvas()

  window.addEventListener('mouseup', stopDrawing)
  window.addEventListener('touchend', stopDrawing)
})

onUnmounted(() => {
  window.removeEventListener('mouseup', stopDrawing)
  window.removeEventListener('touchend', stopDrawing)
})
</script>

<template>
  <div class="w-full">
    <div :class="containerClasses">
      <canvas
        :id="signatureId"
        ref="canvasRef"
        :width="width"
        :height="height"
        class="w-full touch-none"
        :class="[
          props.disabled || props.readonly ? 'cursor-not-allowed' : 'cursor-crosshair',
        ]"
        :style="{ maxWidth: `${width}px` }"
        @mousedown="startDrawing"
        @mousemove="draw"
        @mouseleave="stopDrawing"
        @touchstart="startDrawing"
        @touchmove="draw"
        @touchend="stopDrawing"
      />

      <div
        v-if="!disabled && !readonly"
        class="absolute top-2 right-2 flex items-center gap-2"
      >
        <button
          type="button"
          class="p-1.5 bg-white rounded-md shadow-sm border border-gray-200 text-gray-900 hover:text-gray-900 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
          title="Effacer la signature"
          @click="clearSignature"
        >
          <svg
            class="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      </div>

      <div
        v-if="isEmpty === true && !disabled && !readonly"
        class="absolute inset-0 flex items-center justify-center pointer-events-none"
      >
        <p class="text-sm text-gray-400">
          Dessinez votre signature ici
        </p>
      </div>

      <div
        v-if="props.readonly && modelValue"
        class="absolute bottom-2 left-2"
      >
        <span class="inline-flex items-center px-2 py-1 rounded-md bg-green-100 text-green-800 text-xs font-medium">
          <svg
            class="h-3 w-3 mr-1"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fill-rule="evenodd"
              d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
              clip-rule="evenodd"
            />
          </svg>
          Signe
        </span>
      </div>
    </div>

    <div class="mt-2 flex items-center justify-between">
      <p class="text-xs text-gray-900">
        Utilisez votre souris ou votre doigt pour signer
      </p>

      <div
        v-if="!isEmpty && !readonly"
        class="flex items-center gap-2"
      >
        <span class="inline-flex items-center text-xs text-green-600">
          <svg
            class="h-3 w-3 mr-1"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fill-rule="evenodd"
              d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
              clip-rule="evenodd"
            />
          </svg>
          Signature enregistree
        </span>
      </div>
    </div>

    <p
      v-if="error"
      :id="`${signatureId}-error`"
      class="mt-1.5 text-xs text-red-500"
    >
      {{ error }}
    </p>
  </div>
</template>
