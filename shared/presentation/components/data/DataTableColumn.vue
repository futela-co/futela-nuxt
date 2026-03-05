<script setup lang="ts">
/**
 * DataTableColumn - Column definition helper component
 *
 * This component provides a declarative way to define table columns.
 * It's used in conjunction with DataTable to define column configurations.
 *
 * Usage:
 * <DataTable :data="items">
 *   <DataTableColumn key="name" label="Name" sortable />
 *   <DataTableColumn key="email" label="Email" />
 *   <DataTableColumn key="status" label="Status" align="center">
 *     <template #cell="{ value }">
 *       <BaseBadge :variant="value === 'active' ? 'success' : 'danger'">
 *         {{ value }}
 *       </BaseBadge>
 *     </template>
 *   </DataTableColumn>
 * </DataTable>
 */

export interface ColumnProps {
  columnKey: string
  label: string
  sortable?: boolean
  width?: string
  align?: 'left' | 'center' | 'right'
  headerClass?: string
  cellClass?: string
  visible?: boolean
}

const props = withDefaults(defineProps<ColumnProps>(), {
  sortable: false,
  align: 'left',
  visible: true,
})

const slots = defineSlots<{
  default?: () => unknown
  header?: () => unknown
  cell?: (props: { value: unknown; row: Record<string, unknown>; index: number }) => unknown
}>()

// Expose column configuration for parent DataTable to consume
const columnConfig = computed(() => ({
  key: props.columnKey,
  label: props.label,
  sortable: props.sortable,
  width: props.width,
  align: props.align,
  headerClass: props.headerClass,
  cellClass: props.cellClass,
  visible: props.visible,
  hasHeaderSlot: !!slots.header,
  hasCellSlot: !!slots.cell,
}))

defineExpose({
  columnConfig,
})
</script>

<template>
  <!-- This component is primarily for configuration; actual rendering is handled by DataTable -->
  <component :is="'template'">
    <slot name="header" />
    <slot
      name="cell"
      :value="null"
      :row="{}"
      :index="0"
    />
  </component>
</template>
