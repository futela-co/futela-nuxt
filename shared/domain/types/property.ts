export interface PhotoThumbnails {
  thumbnail: string
  medium: string
  large: string
  thumbnail_webp: string
  medium_webp: string
  large_webp: string
  avatar: string
}

export interface Photo {
  id: string
  url: string
  filename: string
  isPrimary: boolean
  displayOrder: number
  caption: string | null
  createdAt: string
  thumbnails?: PhotoThumbnails
}

export interface Address {
  id: string
  street: string
  latitude: number | null
  longitude: number | null
  town: { id: string; name: string }
  city: { id: string; name: string }
}

export interface Property {
  id: string
  type: string
  title: string
  description: string
  pricePerDay: number | null
  pricePerMonth: number | null
  isPublished: boolean
  isActive: boolean
  isAvailable: boolean
  ownerId: string
  ownerName: string
  categoryId: string | null
  categoryName: string | null
  addressId: string | null
  address: Address | null
  viewCount: number
  rating: number | null
  reviewCount: number
  photos: Photo[]
  primaryPhotoIndex: number | null
  createdAt: string
  updatedAt: string
  listingType?: string
  listingTypeLabel?: string
  salePrice?: number | null
  // Apartment/House
  bedrooms?: number | null
  bathrooms?: number | null
  // Apartment
  floor?: number | null
  hasElevator?: boolean | null
  hasBalcony?: boolean | null
  hasParking?: boolean | null
  squareMeters?: number | null
  // House
  floors?: number | null
  hasGarden?: boolean | null
  hasPool?: boolean | null
  hasGarage?: boolean | null
  landSquareMeters?: number | null
  houseSquareMeters?: number | null
  isFurnished?: boolean | null
  // Land
  landType?: string | null
  landTypeLabel?: string | null
  hasWaterAccess?: boolean | null
  hasElectricityAccess?: boolean | null
  isFenced?: boolean | null
  hasBuildingPermit?: boolean | null
  // EventHall
  capacity?: number | null
  hasSoundSystem?: boolean | null
  hasVideoProjector?: boolean | null
  hasKitchen?: boolean | null
  hasOutdoorSpace?: boolean | null
  eventTypes?: string[] | null
  // Car
  brand?: string | null
  model?: string | null
  year?: number | null
  licensePlate?: string | null
  seats?: number | null
  fuelType?: string | null
  fuelTypeLabel?: string | null
  transmission?: string | null
  transmissionLabel?: string | null
  mileage?: number | null
  color?: string | null
  equipment?: string | null
  withDriver?: boolean | null
}

export interface Category {
  id: string
  name: string
  description: string | null
  slug: string
  isActive: boolean
  propertiesCount: number
  createdAt: string
}

export interface SearchFilters {
  query?: string
  type?: string
  listingType?: string
  categoryId?: string
  provinceId?: string
  cityId?: string
  townId?: string
  districtId?: string
  minPrice?: number
  maxPrice?: number
  bedrooms?: number
  bathrooms?: number
  page?: number
  _geoLabel?: string
  [key: string]: any
}

export interface SearchResponse {
  properties: Property[]
  total: number
  filters: Record<string, any>
}

export interface Country {
  id: string
  name: string
  code: string
}

export interface Province {
  id: string
  name: string
  countryId: string
}

export interface City {
  id: string
  name: string
  provinceId: string
}

export interface District {
  id: string
  name: string
  cityId: string
}

export interface Town {
  id: string
  name: string
  cityId: string
}
