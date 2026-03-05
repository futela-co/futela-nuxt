<script setup lang="ts">
export interface UploadedImage {
  id: string
  name: string
  size: number
  type: string
  file: File
  preview: string
  progress?: number
  status?: 'pending' | 'uploading' | 'success' | 'error'
  error?: string
}

interface Props {
  modelValue?: UploadedImage | UploadedImage[] | null
  multiple?: boolean
  maxSize?: number
  maxFiles?: number
  disabled?: boolean
  error?: string
  id?: string
  name?: string
  accept?: string
  aspectRatio?: '1:1' | '4:3' | '16:9' | 'free'
  previewSize?: 'sm' | 'md' | 'lg'
  showFileName?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: null,
  multiple: false,
  maxSize: 5 * 1024 * 1024,
  maxFiles: 10,
  disabled: false,
  accept: 'image/*',
  aspectRatio: 'free',
  previewSize: 'md',
  showFileName: true,
})

const emit = defineEmits<{
  'update:modelValue': [images: UploadedImage | UploadedImage[] | null]
  upload: [images: UploadedImage[]]
  remove: [image: UploadedImage]
  error: [message: string]
}>()

const generatedId = `imageupload-${Math.random().toString(36).substring(2, 9)}`
const inputId = computed(() => props.id || generatedId)
const inputRef = ref<HTMLInputElement | null>(null)
const isDragging = ref(false)

const previewSizeClasses: Record<string, string> = {
  sm: 'w-24 h-24',
  md: 'w-32 h-32',
  lg: 'w-40 h-40',
}

const aspectRatioClasses: Record<string, string> = {
  '1:1': 'aspect-square',
  '4:3': 'aspect-4/3',
  '16:9': 'aspect-video',
  free: '',
}

const dropzoneClasses = computed(() => [
  'relative flex flex-col items-center justify-center',
  previewSizeClasses[props.previewSize],
  'border-2 border-dashed rounded transition-colors duration-200',
  'cursor-pointer',
  isDragging.value
    ? 'border-primary-500 bg-primary-50'
    : props.error
      ? 'border-red-300 bg-red-50 hover:border-red-400'
      : 'border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100',
  props.disabled ? 'opacity-60 cursor-not-allowed' : '',
])

const images = computed<UploadedImage[]>(() => {
  if (!props.modelValue) return []
  if (Array.isArray(props.modelValue)) return props.modelValue
  return [props.modelValue]
})

function generateImageId(): string {
  return `img-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

function validateImage(file: File): string | null {
  if (file.size > props.maxSize) {
    return `L'image "${file.name}" depasse la taille maximale autorisee (${formatFileSize(props.maxSize)})`
  }

  if (!file.type.startsWith('image/')) {
    return `Le fichier "${file.name}" n'est pas une image valide`
  }

  return null
}

function createPreview(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => resolve(e.target?.result as string)
    reader.onerror = () => reject(new Error('Erreur lors de la lecture du fichier'))
    reader.readAsDataURL(file)
  })
}

async function processFiles(fileList: FileList | null) {
  if (!fileList || props.disabled) return

  const currentImages = images.value
  const newImages: UploadedImage[] = []
  const errors: string[] = []

  const availableSlots = props.multiple ? props.maxFiles - currentImages.length : 1
  const filesToProcess = Array.from(fileList).slice(0, availableSlots)

  for (const file of filesToProcess) {
    const validationError = validateImage(file)
    if (validationError) {
      errors.push(validationError)
      continue
    }

    try {
      const preview = await createPreview(file)
      const uploadedImage: UploadedImage = {
        id: generateImageId(),
        name: file.name,
        size: file.size,
        type: file.type,
        file,
        preview,
        progress: 0,
        status: 'pending',
      }
      newImages.push(uploadedImage)
    } catch {
      errors.push(`Erreur lors du chargement de "${file.name}"`)
    }
  }

  if (errors.length > 0) {
    emit('error', errors.join('\n'))
  }

  if (newImages.length > 0) {
    if (props.multiple) {
      emit('update:modelValue', [...currentImages, ...newImages])
    } else {
      emit('update:modelValue', newImages[0]!)
    }
    emit('upload', newImages)
  }

  if (inputRef.value) {
    inputRef.value.value = ''
  }
}

function handleInputChange(event: Event) {
  const target = event.target as HTMLInputElement
  processFiles(target.files)
}

function handleDragEnter(event: DragEvent) {
  event.preventDefault()
  if (!props.disabled) {
    isDragging.value = true
  }
}

function handleDragLeave(event: DragEvent) {
  event.preventDefault()
  isDragging.value = false
}

function handleDragOver(event: DragEvent) {
  event.preventDefault()
}

function handleDrop(event: DragEvent) {
  event.preventDefault()
  isDragging.value = false
  if (!props.disabled) {
    processFiles(event.dataTransfer?.files || null)
  }
}

function removeImage(image: UploadedImage) {
  if (props.multiple) {
    const updatedImages = images.value.filter(img => img.id !== image.id)
    emit('update:modelValue', updatedImages.length > 0 ? updatedImages : null)
  } else {
    emit('update:modelValue', null)
  }
  emit('remove', image)
}

function openFileDialog() {
  if (!props.disabled) {
    inputRef.value?.click()
  }
}

const { t } = useLocale()

onUnmounted(() => {
  images.value.forEach(img => {
    if (img.preview.startsWith('data:')) {
      URL.revokeObjectURL(img.preview)
    }
  })
})
</script>

<template>
  <div class="w-full">
    <div
      :class="[
        'flex flex-wrap gap-4',
        multiple ? '' : 'items-start',
      ]"
    >
      <div
        v-for="image in images"
        :key="image.id"
        class="relative group"
      >
        <div
          :class="[
            'relative overflow-hidden rounded border border-gray-200',
            previewSizeClasses[previewSize],
            aspectRatioClasses[aspectRatio],
          ]"
        >
          <img
            :src="image.preview"
            :alt="image.name"
            class="w-full h-full object-cover"
          >

          <div
            v-if="image.status === 'uploading' && image.progress !== undefined"
            class="absolute inset-0 bg-black/50 flex items-center justify-center"
          >
            <div class="w-3/4">
              <div class="h-1.5 bg-white/30 rounded-full overflow-hidden">
                <div
                  class="h-full bg-white transition-all duration-300"
                  :style="{ width: `${image.progress}%` }"
                />
              </div>
              <p class="mt-1 text-xs text-white text-center">
                {{ image.progress }}%
              </p>
            </div>
          </div>

          <div
            v-if="!disabled"
            class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
          >
            <button
              type="button"
              class="p-2 bg-white rounded-full text-red-500 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500"
              @click="removeImage(image)"
            >
              <svg
                class="h-5 w-5"
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

          <span
            v-if="image.status === 'success'"
            class="absolute top-2 right-2 p-1 bg-green-500 rounded-full text-white"
          >
            <svg
              class="h-3 w-3"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                clip-rule="evenodd"
              />
            </svg>
          </span>

          <span
            v-if="image.status === 'error'"
            class="absolute top-2 right-2 p-1 bg-red-500 rounded-full text-white"
          >
            <svg
              class="h-3 w-3"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z"
                clip-rule="evenodd"
              />
            </svg>
          </span>
        </div>

        <p
          v-if="showFileName"
          class="mt-1 text-xs text-gray-900 truncate max-w-full"
          :style="{ maxWidth: (previewSizeClasses[previewSize] ?? '').split(' ')[0]?.replace('w-', '') + 'px' }"
        >
          {{ image.name }}
        </p>
      </div>

      <div
        v-if="multiple || images.length === 0"
        :class="dropzoneClasses"
        @click="openFileDialog"
        @dragenter="handleDragEnter"
        @dragleave="handleDragLeave"
        @dragover="handleDragOver"
        @drop="handleDrop"
      >
        <input
          :id="inputId"
          ref="inputRef"
          type="file"
          :accept="accept"
          :multiple="multiple"
          :disabled="disabled"
          :name="name"
          class="sr-only"
          @change="handleInputChange"
        >

        <svg
          class="h-8 w-8 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="1.5"
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>

        <p class="mt-2 text-xs text-gray-900 text-center">
          {{ t('form.clickOrDragImage') }}
        </p>
      </div>
    </div>

    <p class="mt-2 text-xs text-gray-400">
      {{ t('form.maxPerFile').replace('{size}', formatFileSize(maxSize)) }}
      <span v-if="multiple"> - {{ t('form.maxImages').replace('{count}', String(maxFiles)) }}</span>
    </p>

    <p
      v-if="error"
      class="mt-2 text-xs text-red-500"
    >
      {{ error }}
    </p>
  </div>
</template>
