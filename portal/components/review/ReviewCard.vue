<script setup lang="ts">
import { UserCircleIcon } from '@heroicons/vue/24/solid'
import type { Review } from '~/domain/types/user'

interface Props {
  review: Review
  variant?: 'default' | 'compact'
  expandable?: boolean
  maxLines?: number
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  expandable: true,
  maxLines: 3,
})

const isExpanded = ref(false)

const formattedDate = computed(() => {
  const date = new Date(props.review.createdAt)
  return date.toLocaleDateString('fr-FR', {
    month: 'long',
    year: 'numeric',
  })
})

const displayName = computed(() => {
  return props.review.reviewerName || 'Utilisateur'
})
</script>

<template>
  <!-- Compact variant -->
  <div
    v-if="variant === 'compact'"
    class="py-4"
  >
    <div class="flex items-center gap-3">
      <div class="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
        <UserCircleIcon class="w-8 h-8 text-gray-400" />
      </div>
      <div class="flex items-center gap-2 text-sm">
        <span class="font-medium text-gray-900">{{ displayName }}</span>
        <span class="text-gray-300">&middot;</span>
        <ReviewStarRating :model-value="review.rating" size="sm" :show-value="false" />
        <span class="text-gray-300">&middot;</span>
        <span class="text-gray-500">{{ formattedDate }}</span>
      </div>
    </div>
    <p class="mt-2 text-sm text-gray-600 line-clamp-2">{{ review.comment }}</p>
  </div>

  <!-- Default variant -->
  <div
    v-else
    class="py-5 border-b border-gray-100 last:border-0"
  >
    <div class="flex items-start gap-3">
      <div class="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
        <UserCircleIcon class="w-10 h-10 text-gray-400" />
      </div>
      <div class="flex-1">
        <div class="flex items-center gap-2">
          <span class="font-semibold text-gray-900">{{ displayName }}</span>
        </div>
        <div class="flex items-center gap-2 mt-0.5">
          <ReviewStarRating :model-value="review.rating" size="sm" :show-value="false" />
          <span class="text-sm text-gray-500">&middot; {{ formattedDate }}</span>
        </div>
      </div>
    </div>

    <div class="mt-3">
      <p
        class="text-sm text-gray-700 leading-relaxed"
        :class="{ 'line-clamp-3': !isExpanded && expandable }"
      >
        {{ review.comment }}
      </p>
      <button
        v-if="expandable && review.comment && review.comment.length > 200"
        class="mt-1 text-sm font-medium text-primary-600 hover:text-primary-700"
        @click="isExpanded = !isExpanded"
      >
        {{ isExpanded ? 'Voir moins' : 'Lire la suite' }}
      </button>
    </div>
  </div>
</template>
