// Google Maps integration placeholder
// Will be configured when Google Maps API key is available

export interface MapCoordinates {
  lat: number
  lng: number
}

export interface MapMarker {
  position: MapCoordinates
  title?: string
  id?: string
}

export function initGoogleMaps(_apiKey: string): Promise<void> {
  // TODO: Load Google Maps script dynamically
  return Promise.resolve()
}

export function geocodeAddress(_address: string): Promise<MapCoordinates | null> {
  // TODO: Implement geocoding
  return Promise.resolve(null)
}
