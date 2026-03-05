<script setup lang="ts">
definePageMeta({ layout: 'dashboard', landlord: true })

const route = useRoute()
const propertyId = computed(() => route.params.id as string)
</script>

<template>
  <LandlordPropertyForm mode="edit" :property-id="propertyId" />
</template>
