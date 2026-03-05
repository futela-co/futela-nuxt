import { api } from './client'
import { API_ENDPOINTS } from '~/constants/api'
import type { Country, Province, City, District, Town } from '~/types/property'

export interface GeoSearchResult {
  provinces: (Province & { countryName?: string })[]
  cities: (City & { provinceId: string; provinceName?: string })[]
  towns: (Town & { cityName?: string; provinceName?: string })[]
}

export const geographyApi = {
  getCountries(): Promise<Country[]> {
    return api.get(API_ENDPOINTS.GEOGRAPHY.COUNTRIES)
  },

  getProvinces(params?: { countryId?: string }): Promise<Province[]> {
    return api.get(API_ENDPOINTS.GEOGRAPHY.PROVINCES, params)
  },

  getCities(params?: { provinceId?: string }): Promise<City[]> {
    return api.get(API_ENDPOINTS.GEOGRAPHY.CITIES, params)
  },

  getDistricts(params?: { cityId?: string }): Promise<District[]> {
    return api.get(API_ENDPOINTS.GEOGRAPHY.DISTRICTS, params)
  },

  getTowns(params?: { cityId?: string }): Promise<Town[]> {
    return api.get(API_ENDPOINTS.GEOGRAPHY.TOWNS, params)
  },

  search(q: string): Promise<GeoSearchResult> {
    return api.get(API_ENDPOINTS.GEOGRAPHY.SEARCH, { q })
  },
}
