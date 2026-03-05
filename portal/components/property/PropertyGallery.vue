<script setup lang="ts">
import {
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  Squares2X2Icon,
  BuildingOffice2Icon,
  HomeIcon,
  GlobeAltIcon,
  BuildingLibraryIcon,
  TruckIcon,
  PhotoIcon,
} from '@heroicons/vue/24/outline'
import type { Photo } from '~/types/property'

interface Props {
  photos: Photo[]
  propertyType?: string
}

const props = defineProps<Props>()

const typeColorMap: Record<string, { bg: string; border: string; icon: string; iconColor: string }> = {
  apartment: { bg: 'bg-blue-50', border: 'border-blue-200', icon: 'blue', iconColor: 'text-blue-300' },
  house: { bg: 'bg-emerald-50', border: 'border-emerald-200', icon: 'emerald', iconColor: 'text-emerald-300' },
  land: { bg: 'bg-amber-50', border: 'border-amber-200', icon: 'amber', iconColor: 'text-amber-300' },
  event_hall: { bg: 'bg-purple-50', border: 'border-purple-200', icon: 'purple', iconColor: 'text-purple-300' },
  car: { bg: 'bg-rose-50', border: 'border-rose-200', icon: 'rose', iconColor: 'text-rose-300' },
}

const placeholderStyle = computed(() => typeColorMap[props.propertyType ?? ''] ?? { bg: 'bg-gray-50', border: 'border-gray-200', iconColor: 'text-gray-300' })

const typeIconComponent = computed(() => {
  const map: Record<string, any> = {
    apartment: BuildingOffice2Icon,
    house: HomeIcon,
    land: GlobeAltIcon,
    event_hall: BuildingLibraryIcon,
    car: TruckIcon,
  }
  return map[props.propertyType ?? ''] ?? PhotoIcon
})

// Get optimized thumbnail URL with fallback to original
function thumbUrl(photo: Photo, size: 'thumbnail' | 'medium' | 'large'): string {
  const webpKey = `${size}_webp` as keyof typeof photo.thumbnails
  return photo.thumbnails?.[webpKey] ?? photo.thumbnails?.[size] ?? photo.url
}

// Track which photo indexes have broken URLs
const erroredIndexes = reactive(new Set<number>())

function onImgError(index: number) {
  erroredIndexes.add(index)
}

// Check if ALL photos have errored → treat as no photos
const allPhotosErrored = computed(() => {
  if (props.photos.length === 0) return true
  return props.photos.every((_, i) => erroredIndexes.has(i))
})

const showModal = ref(false)
const activeIndex = ref(0)

const mainPhoto = computed(() => props.photos[0] ?? null)
const thumbnailPhotos = computed(() => props.photos.slice(1, 5))

function openModal(index: number = 0) {
  activeIndex.value = index
  showModal.value = true
  document.body.style.overflow = 'hidden'
}

function closeModal() {
  showModal.value = false
  document.body.style.overflow = ''
}

function prevPhoto() {
  activeIndex.value = activeIndex.value > 0 ? activeIndex.value - 1 : props.photos.length - 1
}

function nextPhoto() {
  activeIndex.value = activeIndex.value < props.photos.length - 1 ? activeIndex.value + 1 : 0
}

function handleKeydown(e: KeyboardEvent) {
  if (!showModal.value) return
  if (e.key === 'ArrowLeft') prevPhoto()
  if (e.key === 'ArrowRight') nextPhoto()
  if (e.key === 'Escape') closeModal()
}

if (typeof window !== 'undefined') {
  window.addEventListener('keydown', handleKeydown)
}
</script>

<template>
  <div>
    <!-- No photos / all errored placeholder -->
    <div v-if="photos.length === 0 || allPhotosErrored" class="rounded-xl overflow-hidden">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
        <!-- Main placeholder -->
        <div
          class="aspect-[4/3] md:row-span-2 rounded-xl border-2 border-dashed flex flex-col items-center justify-center"
          :class="[placeholderStyle.bg, placeholderStyle.border]"
        >
          <component :is="typeIconComponent" class="w-16 h-16 mb-3" :class="placeholderStyle.iconColor" />
          <p class="text-sm font-medium" :class="placeholderStyle.iconColor">Aucune photo disponible</p>
        </div>
        <!-- Secondary placeholders (desktop) -->
        <div class="hidden md:grid grid-cols-2 gap-2">
          <div
            v-for="i in 4"
            :key="i"
            class="aspect-[4/3] rounded-xl border-2 border-dashed flex items-center justify-center"
            :class="[placeholderStyle.bg, placeholderStyle.border]"
          >
            <component :is="typeIconComponent" class="w-8 h-8" :class="placeholderStyle.iconColor" />
          </div>
        </div>
      </div>
    </div>

    <!-- Gallery grid -->
    <div v-else class="rounded-xl overflow-hidden">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-2 cursor-pointer">
        <!-- Main photo -->
        <div
          class="aspect-[4/3] md:row-span-2 rounded-xl border border-gray-200 overflow-hidden"
          @click="openModal(0)"
        >
          <!-- Errored main photo → colored placeholder -->
          <div
            v-if="erroredIndexes.has(0)"
            class="w-full h-full border-dashed border flex flex-col items-center justify-center"
            :class="[placeholderStyle.bg, placeholderStyle.border]"
          >
            <component :is="typeIconComponent" class="w-16 h-16 mb-3" :class="placeholderStyle.iconColor" />
            <p class="text-sm font-medium" :class="placeholderStyle.iconColor">Aucune photo disponible</p>
          </div>
          <img
            v-else
            :src="mainPhoto ? thumbUrl(mainPhoto, 'medium') : ''"
            :alt="mainPhoto?.caption ?? 'Photo principale'"
            class="w-full h-full object-cover hover:opacity-95 transition-opacity"
            @error="onImgError(0)"
          >
        </div>
        <!-- Thumbnail photos (mobile: horizontal scroll / desktop: grid) -->
        <div
          v-if="thumbnailPhotos.length > 0"
          class="flex gap-2 overflow-x-auto scrollbar-hide md:grid md:grid-cols-2 md:overflow-visible"
        >
          <div
            v-for="(photo, idx) in thumbnailPhotos"
            :key="photo.id"
            class="flex-shrink-0 aspect-[4/3] w-[30vw] sm:w-[20vw] md:w-auto relative rounded-xl border border-gray-200 overflow-hidden"
            @click="openModal(idx + 1)"
          >
            <!-- Errored thumbnail → colored placeholder -->
            <div
              v-if="erroredIndexes.has(idx + 1)"
              class="w-full h-full flex items-center justify-center"
              :class="[placeholderStyle.bg]"
            >
              <component :is="typeIconComponent" class="w-8 h-8" :class="placeholderStyle.iconColor" />
            </div>
            <img
              v-else
              :src="thumbUrl(photo, 'thumbnail')"
              :alt="photo.caption ?? ''"
              class="w-full h-full object-cover hover:opacity-95 transition-opacity"
              @error="onImgError(idx + 1)"
            >
            <!-- Show all photos button on last thumbnail -->
            <div
              v-if="idx === thumbnailPhotos.length - 1 && photos.length > 5"
              class="absolute inset-0 bg-black/40 flex items-center justify-center hover:bg-black/50 transition-colors"
            >
              <div class="flex items-center gap-2 text-white font-medium text-sm">
                <Squares2X2Icon class="w-5 h-5" />
                <span>+{{ photos.length - 5 }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Show all photos button (mobile) -->
    <button
      v-if="photos.length > 5 && !allPhotosErrored"
      class="mt-2 md:hidden w-full flex items-center justify-center gap-2 py-2.5 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700"
      @click="openModal(0)"
    >
      <Squares2X2Icon class="w-4 h-4" />
      Voir les {{ photos.length }} photos
    </button>

    <!-- Lightbox modal -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-if="showModal"
          class="fixed inset-0 z-[9999] bg-black/95 flex flex-col"
        >
          <!-- Header -->
          <div class="flex items-center justify-between p-4 text-white">
            <button
              class="flex items-center gap-2 text-sm hover:text-gray-300 transition-colors"
              @click="closeModal"
            >
              <XMarkIcon class="w-5 h-5" />
              Fermer
            </button>
            <span class="text-sm">{{ activeIndex + 1 }} / {{ photos.length }}</span>
          </div>

          <!-- Main image -->
          <div class="flex-1 flex items-center justify-center px-4 relative">
            <button
              class="absolute left-4 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
              @click="prevPhoto"
            >
              <ChevronLeftIcon class="w-6 h-6" />
            </button>

            <!-- Errored lightbox image → colored placeholder -->
            <div
              v-if="erroredIndexes.has(activeIndex)"
              class="w-[60vw] sm:w-[40vw] md:w-[30vw] aspect-[4/3] rounded-xl border-2 border-dashed flex flex-col items-center justify-center"
              :class="[placeholderStyle.bg, placeholderStyle.border]"
            >
              <component :is="typeIconComponent" class="w-16 h-16 mb-3" :class="placeholderStyle.iconColor" />
              <p class="text-sm font-medium" :class="placeholderStyle.iconColor">Photo non disponible</p>
            </div>
            <img
              v-else
              :src="photos[activeIndex] ? thumbUrl(photos[activeIndex], 'large') : ''"
              :alt="photos[activeIndex]?.caption ?? ''"
              class="max-h-[70vh] max-w-full object-contain"
              @error="onImgError(activeIndex)"
            >

            <button
              class="absolute right-4 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
              @click="nextPhoto"
            >
              <ChevronRightIcon class="w-6 h-6" />
            </button>
          </div>

          <!-- Thumbnails -->
          <div class="flex items-center justify-center gap-2 p-4 overflow-x-auto">
            <button
              v-for="(photo, idx) in photos"
              :key="photo.id"
              class="w-16 h-12 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-colors"
              :class="idx === activeIndex ? 'border-white' : 'border-transparent opacity-50 hover:opacity-75'"
              @click="activeIndex = idx"
            >
              <!-- Errored thumbnail in lightbox -->
              <div
                v-if="erroredIndexes.has(idx)"
                class="w-full h-full flex items-center justify-center"
                :class="placeholderStyle.bg"
              >
                <component :is="typeIconComponent" class="w-5 h-5" :class="placeholderStyle.iconColor" />
              </div>
              <img
                v-else
                :src="thumbUrl(photo, 'thumbnail')"
                :alt="photo.caption ?? ''"
                class="w-full h-full object-cover"
                @error="onImgError(idx)"
              >
            </button>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>
