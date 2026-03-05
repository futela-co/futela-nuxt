import type { ChartOptions, TooltipItem } from 'chart.js'

/**
 * Design system colors for charts
 */
export const chartColors = {
  primary: '#2563eb',
  success: '#198754',
  warning: '#ffc107',
  danger: '#dc3545',
  info: '#0dcaf0',
  secondary: '#6c757d',
  light: '#f8f9fa',
  dark: '#212529',
} as const

/**
 * Extended color palette for multiple datasets
 */
export const chartColorPalette = [
  chartColors.primary,
  chartColors.success,
  chartColors.warning,
  chartColors.danger,
  chartColors.info,
  chartColors.secondary,
  '#6f42c1', // purple
  '#fd7e14', // orange
  '#20c997', // teal
  '#e83e8c', // pink
] as const

/**
 * Converts hex color to rgba
 */
export function hexToRgba(hex: string, alpha: number = 1): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!result) return hex

  const r = parseInt(result[1]!, 16)
  const g = parseInt(result[2]!, 16)
  const b = parseInt(result[3]!, 16)

  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

/**
 * Generates an array of colors from the palette
 */
export function getChartColors(count: number, startIndex: number = 0): string[] {
  const colors: string[] = []
  for (let i = 0; i < count; i++) {
    colors.push(chartColorPalette[(startIndex + i) % chartColorPalette.length]!)
  }
  return colors
}

/**
 * Generates background colors with transparency
 */
export function getBackgroundColors(count: number, alpha: number = 0.8): string[] {
  return getChartColors(count).map(color => hexToRgba(color, alpha))
}

/**
 * Creates a gradient for canvas context
 */
export function createGradient(
  ctx: CanvasRenderingContext2D,
  color: string,
  startAlpha: number = 0.4,
  endAlpha: number = 0
): CanvasGradient {
  const gradient = ctx.createLinearGradient(0, 0, 0, ctx.canvas.height)
  gradient.addColorStop(0, hexToRgba(color, startAlpha))
  gradient.addColorStop(1, hexToRgba(color, endAlpha))
  return gradient
}

/**
 * Default chart options
 */
export const defaultChartOptions: ChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      position: 'top',
      labels: {
        usePointStyle: true,
        padding: 20,
        font: {
          family: 'Inter, system-ui, sans-serif',
          size: 12,
        },
      },
    },
    tooltip: {
      enabled: true,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      titleFont: {
        family: 'Inter, system-ui, sans-serif',
        size: 13,
      },
      bodyFont: {
        family: 'Inter, system-ui, sans-serif',
        size: 12,
      },
      padding: 12,
      cornerRadius: 8,
    },
  },
}

/**
 * Line chart specific options
 */
export const lineChartOptions = {
  ...defaultChartOptions,
  scales: {
    x: {
      grid: {
        display: false,
      },
      ticks: {
        font: {
          family: 'Inter, system-ui, sans-serif',
          size: 11,
        },
      },
    },
    y: {
      beginAtZero: true,
      grid: {
        color: 'rgba(0, 0, 0, 0.05)',
      },
      ticks: {
        font: {
          family: 'Inter, system-ui, sans-serif',
          size: 11,
        },
      },
    },
  },
  elements: {
    line: {
      tension: 0.4,
      borderWidth: 2,
    },
    point: {
      radius: 4,
      hoverRadius: 6,
    },
  },
} as ChartOptions<'line'>

/**
 * Bar chart specific options
 */
export const barChartOptions = {
  ...defaultChartOptions,
  scales: {
    x: {
      grid: {
        display: false,
      },
      ticks: {
        font: {
          family: 'Inter, system-ui, sans-serif',
          size: 11,
        },
      },
    },
    y: {
      beginAtZero: true,
      grid: {
        color: 'rgba(0, 0, 0, 0.05)',
      },
      ticks: {
        font: {
          family: 'Inter, system-ui, sans-serif',
          size: 11,
        },
      },
    },
  },
} as ChartOptions<'bar'>

/**
 * Pie chart specific options
 */
export const pieChartOptions = {
  ...defaultChartOptions,
  plugins: {
    ...defaultChartOptions.plugins,
    legend: {
      ...defaultChartOptions.plugins?.legend,
      position: 'right' as const,
    },
  },
} as ChartOptions<'pie'>

/**
 * Doughnut chart specific options
 */
export const doughnutChartOptions = {
  ...defaultChartOptions,
  plugins: {
    ...defaultChartOptions.plugins,
    legend: {
      ...defaultChartOptions.plugins?.legend,
      position: 'right' as const,
    },
  },
} as ChartOptions<'doughnut'>

/**
 * Formats number for display in charts
 */
export function formatChartNumber(value: number): string {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`
  }
  return value.toFixed(0)
}

/**
 * Formats currency for display in charts
 */
export function formatChartCurrency(value: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('fr-CD', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

/**
 * Calculates percentage of a value
 */
export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0
  return Math.round((value / total) * 100)
}

/**
 * Transforms raw data to chart data format
 */
export function transformToChartData<T>(
  items: T[],
  labelKey: keyof T,
  valueKey: keyof T,
  colors?: string[]
): { labels: string[]; data: number[]; backgroundColor: string[] } {
  const labels = items.map(item => String(item[labelKey]))
  const data = items.map(item => Number(item[valueKey]))
  const backgroundColor = colors || getBackgroundColors(items.length)

  return { labels, data, backgroundColor }
}

/**
 * Creates tooltip callback for percentage display
 */
export function createPercentageTooltip(total: number) {
  return {
    callbacks: {
      label: (context: TooltipItem<'pie' | 'doughnut'>) => {
        const value = context.raw as number
        const percentage = calculatePercentage(value, total)
        return `${context.label}: ${value} (${percentage}%)`
      },
    },
  }
}

/**
 * Creates tooltip callback for currency display
 */
export function createCurrencyTooltip(currency: string = 'USD') {
  return {
    callbacks: {
      label: (context: TooltipItem<'bar' | 'line'>) => {
        const value = context.raw as number
        return `${context.dataset.label}: ${formatChartCurrency(value, currency)}`
      },
    },
  }
}

/**
 * Merges custom options with default options
 */
export function mergeChartOptions<T>(
  defaultOptions: T,
  customOptions?: Partial<T>
): T {
  if (!customOptions) return defaultOptions

  const merged = {
    ...defaultOptions,
    ...customOptions,
  } as T & { plugins?: Record<string, unknown>; scales?: Record<string, unknown> }

  if ((defaultOptions as Record<string, unknown>).plugins || (customOptions as Record<string, unknown>).plugins) {
    merged.plugins = {
      ...(defaultOptions as Record<string, unknown>).plugins as Record<string, unknown>,
      ...(customOptions as Record<string, unknown>).plugins as Record<string, unknown>,
    }
  }

  if ((defaultOptions as Record<string, unknown>).scales || (customOptions as Record<string, unknown>).scales) {
    merged.scales = {
      ...(defaultOptions as Record<string, unknown>).scales as Record<string, unknown>,
      ...(customOptions as Record<string, unknown>).scales as Record<string, unknown>,
    }
  }

  return merged as T
}

/**
 * Composable for chart utilities
 */
export function useChart() {
  return {
    // Colors
    chartColors,
    chartColorPalette,
    hexToRgba,
    getChartColors,
    getBackgroundColors,
    createGradient,

    // Options
    defaultChartOptions,
    lineChartOptions,
    barChartOptions,
    pieChartOptions,
    doughnutChartOptions,
    mergeChartOptions,

    // Formatters
    formatChartNumber,
    formatChartCurrency,
    calculatePercentage,

    // Data transformation
    transformToChartData,

    // Tooltip helpers
    createPercentageTooltip,
    createCurrencyTooltip,
  }
}

export default useChart
