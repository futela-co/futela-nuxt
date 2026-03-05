<script setup lang="ts">
/**
 * FormEditor - WYSIWYG Editor Placeholder Component
 *
 * This is a placeholder component that provides basic rich text editing functionality.
 * For production use, consider integrating a full WYSIWYG editor like:
 * - TipTap (https://tiptap.dev)
 * - Quill (https://quilljs.com)
 * - Editor.js (https://editorjs.io)
 * - CKEditor (https://ckeditor.com)
 */

interface Props {
  modelValue?: string
  placeholder?: string
  disabled?: boolean
  readonly?: boolean
  error?: string
  id?: string
  name?: string
  minHeight?: string
  maxHeight?: string
  toolbar?: ('bold' | 'italic' | 'underline' | 'strike' | 'link' | 'list' | 'orderedList' | 'heading' | 'quote' | 'code')[]
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  placeholder: 'Commencez a ecrire...',
  disabled: false,
  readonly: false,
  minHeight: '150px',
  maxHeight: '400px',
  toolbar: () => ['bold', 'italic', 'underline', 'link', 'list', 'orderedList', 'heading', 'quote'],
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  focus: [event: FocusEvent]
  blur: [event: FocusEvent]
}>()

const generatedId = `editor-${Math.random().toString(36).substring(2, 9)}`
const editorId = computed(() => props.id || generatedId)
const editorRef = ref<HTMLDivElement | null>(null)
const isFocused = ref(false)

const containerClasses = computed(() => [
  'w-full rounded border overflow-hidden transition-colors duration-200',
  isFocused.value
    ? 'border-primary-500 ring-2 ring-primary-500 ring-offset-0'
    : props.error
      ? 'border-red-500'
      : 'border-gray-300',
  props.disabled ? 'bg-gray-100 opacity-60' : 'bg-white',
])

const toolbarButtons: Record<string, { icon: string; title: string; command: string; value?: string }> = {
  bold: {
    icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 12h8a4 4 0 004-4c0-2.209-1.791-4-4-4H6v8zm0 0h9a4 4 0 010 8H6v-8z" />',
    title: 'Gras',
    command: 'bold',
  },
  italic: {
    icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l-4 4 4 4M6 16l4-4-4-4" />',
    title: 'Italique',
    command: 'italic',
  },
  underline: {
    icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8v4a4 4 0 108 0V8M5 20h14" />',
    title: 'Souligne',
    command: 'underline',
  },
  strike: {
    icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.5 12h-15M12 3v4m0 5v9" />',
    title: 'Barre',
    command: 'strikeThrough',
  },
  link: {
    icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />',
    title: 'Lien',
    command: 'createLink',
  },
  list: {
    icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />',
    title: 'Liste',
    command: 'insertUnorderedList',
  },
  orderedList: {
    icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h10M7 16h10M3 8h1M3 12h1M3 16h1" />',
    title: 'Liste numerotee',
    command: 'insertOrderedList',
  },
  heading: {
    icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 16h10M11 8v8" />',
    title: 'Titre',
    command: 'formatBlock',
    value: 'h3',
  },
  quote: {
    icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />',
    title: 'Citation',
    command: 'formatBlock',
    value: 'blockquote',
  },
  code: {
    icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />',
    title: 'Code',
    command: 'formatBlock',
    value: 'pre',
  },
}

function execCommand(command: string, value?: string) {
  if (props.disabled || props.readonly) return

  editorRef.value?.focus()

  if (command === 'createLink') {
    const url = prompt('Entrez l\'URL du lien:')
    if (url) {
      document.execCommand(command, false, url)
    }
  } else if (value) {
    document.execCommand(command, false, value)
  } else {
    document.execCommand(command, false)
  }

  updateContent()
}

function handleInput() {
  updateContent()
}

function updateContent() {
  if (editorRef.value) {
    emit('update:modelValue', editorRef.value.innerHTML)
  }
}

function handleFocus(event: FocusEvent) {
  isFocused.value = true
  emit('focus', event)
}

function handleBlur(event: FocusEvent) {
  isFocused.value = false
  emit('blur', event)
}

function handlePaste(event: ClipboardEvent) {
  event.preventDefault()
  const text = event.clipboardData?.getData('text/plain') || ''
  document.execCommand('insertText', false, text)
  updateContent()
}

watch(() => props.modelValue, (newValue) => {
  if (editorRef.value && editorRef.value.innerHTML !== newValue) {
    editorRef.value.innerHTML = newValue
  }
}, { immediate: true })

onMounted(() => {
  if (editorRef.value && props.modelValue) {
    editorRef.value.innerHTML = props.modelValue
  }
})
</script>

<template>
  <div class="w-full">
    <div :class="containerClasses">
      <div
        v-if="toolbar.length > 0"
        class="flex flex-wrap items-center gap-1 px-2 py-1.5 border-b border-gray-200 bg-gray-50"
      >
        <template
          v-for="tool in toolbar"
          :key="tool"
        >
          <button
            v-if="toolbarButtons[tool]"
            type="button"
            :title="toolbarButtons[tool].title"
            :disabled="disabled || readonly"
            class="p-1.5 rounded text-gray-900 hover:bg-gray-200 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            @click="execCommand(toolbarButtons[tool].command, toolbarButtons[tool].value)"
          >
            <svg
              class="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              v-html="toolbarButtons[tool].icon"
            />
          </button>
        </template>
      </div>

      <div
        :id="editorId"
        ref="editorRef"
        :contenteditable="!disabled && !readonly"
        :data-placeholder="placeholder"
        class="prose prose-sm max-w-none px-4 py-3 overflow-y-auto focus:outline-none"
        :class="[
          props.disabled ? 'cursor-not-allowed' : '',
          props.readonly ? 'cursor-default' : '',
        ]"
        :style="{
          minHeight,
          maxHeight,
        }"
        role="textbox"
        :aria-multiline="true"
        :aria-disabled="disabled"
        :aria-readonly="readonly"
        :aria-invalid="!!error"
        :aria-describedby="error ? `${editorId}-error` : undefined"
        @input="handleInput"
        @focus="handleFocus"
        @blur="handleBlur"
        @paste="handlePaste"
      />
    </div>

    <div class="mt-1.5 flex items-center justify-between text-xs text-gray-900">
      <span>
        Utilisez les boutons ci-dessus pour formater le texte
      </span>
    </div>

    <p
      v-if="error"
      :id="`${editorId}-error`"
      class="mt-1.5 text-xs text-red-500"
    >
      {{ error }}
    </p>
  </div>
</template>
