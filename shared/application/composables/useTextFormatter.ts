/**
 * useTextFormatter
 * Composable for formatting text with nl2br and basic markdown support
 */

/**
 * Convert newlines to <br> tags (equivalent to Twig's nl2br)
 */
export function nl2br(text: string): string {
  if (!text) return ''
  return text.replace(/\n/g, '<br>')
}

/**
 * Parse basic markdown syntax
 * Supports: bold, italic, links, lists, headers
 */
export function parseMarkdown(text: string): string {
  if (!text) return ''

  let result = text

  // Escape HTML first (security)
  result = result
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

  // Headers (h1-h6)
  result = result.replace(/^######\s+(.+)$/gm, '<h6 class="text-xs font-semibold mt-2 mb-1">$1</h6>')
  result = result.replace(/^#####\s+(.+)$/gm, '<h5 class="text-xs font-semibold mt-2 mb-1">$1</h5>')
  result = result.replace(/^####\s+(.+)$/gm, '<h4 class="text-sm font-semibold mt-2 mb-1">$1</h4>')
  result = result.replace(/^###\s+(.+)$/gm, '<h3 class="text-sm font-bold mt-3 mb-1">$1</h3>')
  result = result.replace(/^##\s+(.+)$/gm, '<h2 class="text-base font-bold mt-3 mb-1">$1</h2>')
  result = result.replace(/^#\s+(.+)$/gm, '<h1 class="text-lg font-bold mt-3 mb-2">$1</h1>')

  // Bold: **text** or __text__
  result = result.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  result = result.replace(/__(.+?)__/g, '<strong>$1</strong>')

  // Italic: *text* or _text_
  result = result.replace(/\*([^*]+)\*/g, '<em>$1</em>')
  result = result.replace(/_([^_]+)_/g, '<em>$1</em>')

  // Strikethrough: ~~text~~
  result = result.replace(/~~(.+?)~~/g, '<del>$1</del>')

  // Code inline: `code`
  result = result.replace(/`([^`]+)`/g, '<code class="bg-gray-100 px-1 py-0.5 rounded text-xs font-mono">$1</code>')

  // Links: [text](url)
  result = result.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-primary-600 hover:underline" target="_blank" rel="noopener noreferrer">$1</a>')

  // Unordered lists: - item or * item
  result = result.replace(/(?:^[\-*]\s+.+\n?)+/gm, (match) => {
    const items = match.trim().split('\n').map(item => `<li class="ml-4">${item.replace(/^[\-*]\s+/, '')}</li>`).join('')
    return `<ul class="list-disc list-inside my-2">${items}</ul>`
  })

  // Ordered lists: 1. item
  result = result.replace(/(?:^\d+\.\s+.+\n?)+/gm, (match) => {
    const items = match.trim().split('\n').map(item => `<li class="ml-4">${item.replace(/^\d+\.\s+/, '')}</li>`).join('')
    return `<ol class="list-decimal list-inside my-2">${items}</ol>`
  })

  // Horizontal rule: --- or ***
  result = result.replace(/^(---|\*\*\*)$/gm, '<hr class="my-3 border-gray-300">')

  // Blockquote: > text
  result = result.replace(/^>\s+(.+)$/gm, '<blockquote class="border-l-2 border-gray-300 pl-3 italic text-gray-600">$1</blockquote>')

  // Newlines to <br> for remaining text (nl2br)
  result = result.replace(/\n/g, '<br>')

  // Clean up multiple <br> tags
  result = result.replace(/(<br>){3,}/g, '<br><br>')

  return result
}

/**
 * Format text with nl2br only (no markdown)
 */
export function formatTextNl2br(text: string | null | undefined): string {
  if (!text) return ''

  // Escape HTML first
  let result = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

  return nl2br(result)
}

/**
 * Format text with markdown and nl2br
 */
export function formatTextMarkdown(text: string | null | undefined): string {
  if (!text) return ''
  return parseMarkdown(text)
}

/**
 * Composable hook for text formatting
 */
export function useTextFormatter() {
  return {
    nl2br,
    parseMarkdown,
    formatTextNl2br,
    formatTextMarkdown
  }
}
