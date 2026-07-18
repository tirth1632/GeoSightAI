// src/services/googleMapsService.js

/**
 * Wrapper for Google Maps Places API to fetch place details based on latitude and longitude.
 * Proxies the request through the backend to avoid CORS issues with Google Maps REST APIs.
 */
export async function fetchPlaceDetailsByLatLng(lat, lng, placeId = null) {
  try {
    let url = `http://localhost:3001/place-details?lat=${lat}&lng=${lng}`;
    if (placeId) url += `&place_id=${placeId}`;
    
    const res = await fetch(url);
    if (!res.ok) {
      console.warn('Backend proxy place-details request failed', res.status);
      return null;
    }
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Failed to fetch place details from proxy:", error);
    return null;
  }
}
