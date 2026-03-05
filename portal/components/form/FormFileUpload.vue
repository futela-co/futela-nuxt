<script setup lang="ts">
export interface UploadedFile {
  id: string
  name: string
  size: number
  type: string
  file: File
  progress?: number
  status?: 'pending' | 'uploading' | 'success' | 'error'
  error?: string
}

interface Props {
  modelValue?: UploadedFile[]
  accept?: string
  multiple?: boolean
  maxSize?: number
  maxFiles?: number
  disabled?: boolean
  error?: string
  id?: string
  name?: string
  uploadText?: string
  dragText?: string
  showFileList?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => [],
  accept: '*/*',
  multiple: false,
  maxSize: 10 * 1024 * 1024,
  maxFiles: 10,
  disabled: false,
  uploadText: '',
  dragText: '',
  showFileList: true,
})

const emit = defineEmits<{
  'update:modelValue': [files: UploadedFile[]]
  upload: [files: UploadedFile[]]
  remove: [file: UploadedFile]
  error: [message: string]
}>()

const generatedId = `fileupload-${Math.random().toString(36).substring(2, 9)}`
const inputId = computed(() => props.id || generatedId)
const inputRef = ref<HTMLInputElement | null>(null)
const isDragging = ref(false)

const dropzoneClasses = computed(() => [
  'relative flex flex-col items-center justify-center w-full min-h-32 px-4 py-6',
  'border-2 border-dashed rounded transition-colors duration-200',
  'cursor-pointer',
  isDragging.value
    ? 'border-primary-500 bg-primary-50'
    : props.error
      ? 'border-red-300 bg-red-50 hover:border-red-400'
      : 'border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100',
  props.disabled ? 'opacity-60 cursor-not-allowed' : '',
])

function generateFileId(): string {
  return `file-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

function validateFile(file: File): string | null {
  if (file.size > props.maxSize) {
    return `Le fichier "${file.name}" depasse la taille maximale autorisee (${formatFileSize(props.maxSize)})`
  }

  if (props.accept !== '*/*') {
    const acceptedTypes = props.accept.split(',').map(t => t.trim())
    const fileType = file.type
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()

    const isAccepted = acceptedTypes.some(type => {
      if (type.startsWith('.')) {
        return fileExtension === type.toLowerCase()
      }
      if (type.endsWith('/*')) {
        return fileType.startsWith(type.replace('/*', '/'))
      }
      return fileType === type
    })

    if (!isAccepted) {
      return `Le type de fichier "${file.name}" n'est pas accepte`
    }
  }

  return null
}

function processFiles(fileList: FileList | null) {
  if (!fileList || props.disabled) return

  const currentFiles = props.modelValue || []
  const newFiles: UploadedFile[] = []
  const errors: string[] = []

  const availableSlots = props.multiple ? props.maxFiles - currentFiles.length : 1
  const filesToProcess = Array.from(fileList).slice(0, availableSlots)

  for (const file of filesToProcess) {
    const validationError = validateFile(file)
    if (validationError) {
      errors.push(validationError)
      continue
    }

    const uploadedFile: UploadedFile = {
      id: generateFileId(),
      name: file.name,
      size: file.size,
      type: file.type,
      file,
      progress: 0,
      status: 'pending',
    }
    newFiles.push(uploadedFile)
  }

  if (errors.length > 0) {
    emit('error', errors.join('\n'))
  }

  if (newFiles.length > 0) {
    const updatedFiles = props.multiple
      ? [...currentFiles, ...newFiles]
      : newFiles
    emit('update:modelValue', updatedFiles)
    emit('upload', newFiles)
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

function removeFile(file: UploadedFile) {
  const updatedFiles = (props.modelValue || []).filter(f => f.id !== file.id)
  emit('update:modelValue', updatedFiles)
  emit('remove', file)
}

function openFileDialog() {
  if (!props.disabled) {
    inputRef.value?.click()
  }
}

const { t } = useLocale()

function getFileIcon(type: string): string {
  if (type.startsWith('image/')) return 'image'
  if (type.startsWith('video/')) return 'video'
  if (type.startsWith('audio/')) return 'audio'
  if (type === 'application/pdf') return 'pdf'
  if (type.includes('spreadsheet') || type.includes('excel')) return 'spreadsheet'
  if (type.includes('document') || type.includes('word')) return 'document'
  return 'file'
}
</script>

<template>
  <div class="w-full">
    <div
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

      <div class="flex flex-col items-center text-center">
        <div class="mb-3 p-3 bg-white rounded-full shadow-sm">
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
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
        </div>

        <p class="text-sm font-medium text-gray-900">
          {{ uploadText || t('form.clickToUpload') }}
        </p>
        <p class="mt-1 text-xs text-gray-900">
          {{ dragText || t('form.dragAndDrop') }}
        </p>
        <p class="mt-2 text-xs text-gray-400">
          {{ t('form.maxPerFile').replace('{size}', formatFileSize(maxSize)) }}
          <span v-if="multiple"> - {{ t('form.maxFiles').replace('{count}', String(maxFiles)) }}</span>
        </p>
      </div>
    </div>

    <ul
      v-if="showFileList && modelValue && modelValue.length > 0"
      class="mt-4 space-y-2"
    >
      <li
        v-for="file in modelValue"
        :key="file.id"
        class="flex items-center gap-3 p-3 bg-gray-50 rounded border border-gray-200"
      >
        <div class="flex-shrink-0">
          <div
            v-if="getFileIcon(file.type) === 'image'"
            class="w-10 h-10 rounded bg-blue-100 flex items-center justify-center"
          >
            <svg
              class="h-5 w-5 text-blue-600"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M1 5.25A2.25 2.25 0 013.25 3h13.5A2.25 2.25 0 0119 5.25v9.5A2.25 2.25 0 0116.75 17H3.25A2.25 2.25 0 011 14.75v-9.5zm1.5 5.81v3.69c0 .414.336.75.75.75h13.5a.75.75 0 00.75-.75v-2.69l-2.22-2.219a.75.75 0 00-1.06 0l-1.91 1.909.47.47a.75.75 0 11-1.06 1.06L6.53 8.091a.75.75 0 00-1.06 0l-2.97 2.97zM12 7a1 1 0 11-2 0 1 1 0 012 0z"
                clip-rule="evenodd"
              />
            </svg>
          </div>
          <div
            v-else-if="getFileIcon(file.type) === 'pdf'"
            class="w-10 h-10 rounded bg-red-100 flex items-center justify-center"
          >
            <svg
              class="h-5 w-5 text-red-600"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M4.5 2A1.5 1.5 0 003 3.5v13A1.5 1.5 0 004.5 18h11a1.5 1.5 0 001.5-1.5V7.621a1.5 1.5 0 00-.44-1.06l-4.12-4.122A1.5 1.5 0 0011.378 2H4.5zm2.25 8.5a.75.75 0 000 1.5h6.5a.75.75 0 000-1.5h-6.5zm0 3a.75.75 0 000 1.5h6.5a.75.75 0 000-1.5h-6.5z"
                clip-rule="evenodd"
              />
            </svg>
          </div>
          <div
            v-else
            class="w-10 h-10 rounded bg-gray-200 flex items-center justify-center"
          >
            <svg
              class="h-5 w-5 text-gray-900"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M4.5 2A1.5 1.5 0 003 3.5v13A1.5 1.5 0 004.5 18h11a1.5 1.5 0 001.5-1.5V7.621a1.5 1.5 0 00-.44-1.06l-4.12-4.122A1.5 1.5 0 0011.378 2H4.5z"
                clip-rule="evenodd"
              />
            </svg>
          </div>
        </div>

        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium text-gray-900 truncate">
            {{ file.name }}
          </p>
          <p class="text-xs text-gray-900">
            {{ formatFileSize(file.size) }}
          </p>

          <div
            v-if="file.status === 'uploading' && file.progress !== undefined"
            class="mt-1.5"
          >
            <div class="h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                class="h-full bg-primary-500 transition-all duration-300"
                :style="{ width: `${file.progress}%` }"
              />
            </div>
          </div>

          <p
            v-if="file.status === 'error' && file.error"
            class="mt-1 text-xs text-red-600"
          >
            {{ file.error }}
          </p>
        </div>

        <div class="flex-shrink-0 flex items-center gap-2">
          <span
            v-if="file.status === 'success'"
            class="text-green-500"
          >
            <svg
              class="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                clip-rule="evenodd"
              />
            </svg>
          </span>

          <button
            v-if="!disabled"
            type="button"
            class="p-1 text-gray-400 hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-red-500 rounded"
            @click.stop="removeFile(file)"
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
      </li>
    </ul>

    <p
      v-if="error"
      class="mt-2 text-xs text-red-500"
    >
      {{ error }}
    </p>
  </div>
</template>
