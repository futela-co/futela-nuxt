<script setup lang="ts">
export type ExportFormat = 'pdf' | 'excel' | 'csv'

export interface ExportConfig {
  format: ExportFormat
  label: string
  icon: string
  mimeType: string
  extension: string
}

interface Props {
  data: Record<string, unknown>[]
  filename?: string
  formats?: ExportFormat[]
  columns?: { key: string; label: string }[]
  disabled?: boolean
  loading?: boolean
  variant?: 'primary' | 'secondary' | 'outline-primary' | 'outline-secondary'
  size?: 'sm' | 'md' | 'lg'
  label?: string
}

const props = withDefaults(defineProps<Props>(), {
  filename: 'export',
  formats: () => ['csv', 'excel', 'pdf'],
  disabled: false,
  loading: false,
  variant: 'outline-secondary',
  size: 'md',
  label: '',
})

const emit = defineEmits<{
  export: [format: ExportFormat, data: Record<string, unknown>[]]
  'export-start': [format: ExportFormat]
  'export-complete': [format: ExportFormat]
  'export-error': [format: ExportFormat, error: Error]
}>()

const isOpen = ref(false)
const isExporting = ref(false)
const dropdownRef = ref<HTMLElement>()

const formatConfigs: Record<ExportFormat, ExportConfig> = {
  pdf: {
    format: 'pdf',
    label: 'PDF',
    icon: 'M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z',
    mimeType: 'application/pdf',
    extension: '.pdf',
  },
  excel: {
    format: 'excel',
    label: 'Excel',
    icon: 'M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h7.5c.621 0 1.125-.504 1.125-1.125m-9.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-7.5A1.125 1.125 0 0112 18.375m9.75-12.75c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125m19.5 0v1.5c0 .621-.504 1.125-1.125 1.125M2.25 5.625v1.5c0 .621.504 1.125 1.125 1.125m0 0h17.25m-17.25 0h7.5c.621 0 1.125.504 1.125 1.125M3.375 8.25c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m17.25-3.75h-7.5c-.621 0-1.125.504-1.125 1.125m8.625-1.125c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h7.5m-7.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125M12 10.875v-1.5m0 1.5c0 .621-.504 1.125-1.125 1.125M12 10.875c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125M13.125 12h7.5m-7.5 0c-.621 0-1.125.504-1.125 1.125M20.625 12c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h7.5M12 14.625v-1.5m0 1.5c0 .621-.504 1.125-1.125 1.125M12 14.625c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125m0 1.5v-1.5m0 0c0-.621.504-1.125 1.125-1.125m0 0h7.5',
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    extension: '.xlsx',
  },
  csv: {
    format: 'csv',
    label: 'CSV',
    icon: 'M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m.75 12l3 3m0 0l3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z',
    mimeType: 'text/csv',
    extension: '.csv',
  },
}

const availableFormats = computed(() => {
  return props.formats.map(format => formatConfigs[format]).filter(Boolean)
})

const buttonClasses = computed(() => {
  const variantClasses: Record<string, string> = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    'outline-primary': 'btn-outline-primary',
    'outline-secondary': 'btn-outline-secondary',
  }

  const sizeClasses: Record<string, string> = {
    sm: 'btn-sm',
    md: '',
    lg: 'btn-lg',
  }

  return ['btn', variantClasses[props.variant], sizeClasses[props.size]].filter(Boolean).join(' ')
})

function toggle() {
  if (props.disabled || props.loading) return
  isOpen.value = !isOpen.value
}

function close() {
  isOpen.value = false
}

function onClickOutside(event: MouseEvent) {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    close()
  }
}

async function handleExport(format: ExportFormat) {
  if (isExporting.value || props.disabled) return

  isExporting.value = true
  emit('export-start', format)

  try {
    emit('export', format, props.data)

    // Generate export based on format
    switch (format) {
      case 'csv':
        await exportToCsv()
        break
      case 'excel':
        await exportToExcel()
        break
      case 'pdf':
        await exportToPdf()
        break
    }

    emit('export-complete', format)
  } catch (error) {
    emit('export-error', format, error as Error)
    console.error(`Export to ${format} failed:`, error)
  } finally {
    isExporting.value = false
    close()
  }
}

function getHeaders(): string[] {
  if (props.columns && props.columns.length > 0) {
    return props.columns.map(col => col.label)
  }
  if (props.data.length > 0) {
    return Object.keys(props.data[0]!)
  }
  return []
}

function getKeys(): string[] {
  if (props.columns && props.columns.length > 0) {
    return props.columns.map(col => col.key)
  }
  if (props.data.length > 0) {
    return Object.keys(props.data[0]!)
  }
  return []
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined) return ''
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}

async function exportToCsv() {
  const headers = getHeaders()
  const keys = getKeys()

  const csvContent = [
    headers.join(','),
    ...props.data.map(row =>
      keys.map(key => {
        const value = formatValue(row[key])
        // Escape quotes and wrap in quotes if contains comma or quote
        if (value.includes(',') || value.includes('"') || value.includes('\n')) {
          return `"${value.replace(/"/g, '""')}"`
        }
        return value
      }).join(',')
    ),
  ].join('\n')

  downloadFile(csvContent, formatConfigs.csv.mimeType, formatConfigs.csv.extension)
}

async function exportToExcel() {
  // For Excel, we'll create a simple HTML table that Excel can open
  // In a real implementation, you might use a library like xlsx or exceljs
  const headers = getHeaders()
  const keys = getKeys()

  const htmlContent = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel">
    <head><meta charset="UTF-8"></head>
    <body>
      <table border="1">
        <thead>
          <tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>
        </thead>
        <tbody>
          ${props.data.map(row =>
            `<tr>${keys.map(key => `<td>${formatValue(row[key])}</td>`).join('')}</tr>`
          ).join('')}
        </tbody>
      </table>
    </body>
    </html>
  `

  downloadFile(htmlContent, 'application/vnd.ms-excel', '.xls')
}

async function exportToPdf() {
  // For PDF, we'll create a printable HTML page
  // In a real implementation, you might use a library like jspdf or pdfmake
  const headers = getHeaders()
  const keys = getKeys()

  const printWindow = window.open('', '_blank')
  if (!printWindow) {
    throw new Error('Could not open print window')
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${props.filename}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px; }
        th { background-color: #f5f5f5; font-weight: bold; }
        tr:nth-child(even) { background-color: #fafafa; }
        h1 { font-size: 18px; color: #333; }
        @media print {
          body { margin: 0; }
          table { page-break-inside: auto; }
          tr { page-break-inside: avoid; page-break-after: auto; }
        }
      </style>
    </head>
    <body>
      <h1>${props.filename}</h1>
      <p>Generated on: ${new Date().toLocaleString()}</p>
      <table>
        <thead>
          <tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>
        </thead>
        <tbody>
          ${props.data.map(row =>
            `<tr>${keys.map(key => `<td>${formatValue(row[key])}</td>`).join('')}</tr>`
          ).join('')}
        </tbody>
      </table>
    </body>
    </html>
  `

  printWindow.document.write(htmlContent)
  printWindow.document.close()
  printWindow.focus()

  // Wait for content to load then print
  setTimeout(() => {
    printWindow.print()
    printWindow.close()
  }, 250)
}

function downloadFile(content: string, mimeType: string, extension: string) {
  const blob = new Blob([content], { type: `${mimeType};charset=utf-8;` })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)

  link.setAttribute('href', url)
  link.setAttribute('download', `${props.filename}${extension}`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

onMounted(() => {
  document.addEventListener('click', onClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', onClickOutside)
})

const { t } = useLocale()

defineExpose({
  handleExport,
  close,
})
</script>

<template>
  <div
    ref="dropdownRef"
    class="relative inline-block"
  >
    <!-- Single Format Button -->
    <template v-if="formats.length === 1">
      <button
        type="button"
        :class="buttonClasses"
        :disabled="disabled || loading || isExporting || data.length === 0"
        @click="handleExport(formats[0]!)"
      >
        <span
          v-if="loading || isExporting"
          class="inline-flex gap-1 mr-2"
        >
          <span class="w-1.5 h-1.5 bg-current rounded-full animate-bounce [animation-delay:-0.3s]" />
          <span class="w-1.5 h-1.5 bg-current rounded-full animate-bounce [animation-delay:-0.15s]" />
          <span class="w-1.5 h-1.5 bg-current rounded-full animate-bounce" />
        </span>
        <svg
          v-else
          class="w-4 h-4 mr-1.5"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
          />
        </svg>
        {{ label || t('form.export') }} {{ formatConfigs[formats[0]!].label }}
      </button>
    </template>

    <!-- Dropdown for Multiple Formats -->
    <template v-else>
      <button
        type="button"
        :class="buttonClasses"
        :disabled="disabled || loading || isExporting || data.length === 0"
        @click="toggle"
      >
        <span
          v-if="loading || isExporting"
          class="inline-flex gap-1 mr-2"
        >
          <span class="w-1.5 h-1.5 bg-current rounded-full animate-bounce [animation-delay:-0.3s]" />
          <span class="w-1.5 h-1.5 bg-current rounded-full animate-bounce [animation-delay:-0.15s]" />
          <span class="w-1.5 h-1.5 bg-current rounded-full animate-bounce" />
        </span>
        <svg
          v-else
          class="w-4 h-4 mr-1.5"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
          />
        </svg>
        {{ label || t('form.export') }}
        <svg
          class="w-4 h-4 ml-1.5"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="2"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      <!-- Dropdown Menu -->
      <Transition name="dropdown">
        <div
          v-if="isOpen"
          class="dropdown-menu absolute right-0 z-[1000] mt-1 min-w-[160px] origin-top-right rounded bg-white shadow-lg ring-1 ring-black/5 focus:outline-none py-1"
        >
          <button
            v-for="format in availableFormats"
            :key="format.format"
            type="button"
            class="dropdown-item flex items-center w-full px-4 py-2 text-sm text-gray-900 hover:bg-gray-100 transition-colors"
            :disabled="isExporting"
            @click="handleExport(format.format)"
          >
            <svg
              class="w-4 h-4 mr-2 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                :d="format.icon"
              />
            </svg>
            {{ format.label }}
          </button>
        </div>
      </Transition>
    </template>

    <!-- Empty Data Warning -->
    <p
      v-if="data.length === 0 && !loading"
      class="text-xs text-gray-900 mt-1"
    >
      {{ t('table.noDataExport') }}
    </p>
  </div>
</template>
