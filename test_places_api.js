import dotenv from 'dotenv';
dotenv.config();

const API_KEY = process.env.VITE_GOOGLE_MAPS_API_KEY;
const lat = 18.5679; // Pune approx (Viman nagar)
const lng = 73.9143;
const radiusM = 1500;

async function testSearchNearby(types) {
  const body = {
    includedTypes: types,
    locationRestriction: {
      circle: { center: { latitude: parseFloat(lat), longitude: parseFloat(lng) }, radius: radiusM }
    },
    maxResultCount: 20
  };
  const res = await fetch('https://places.googleapis.com/v1/places:searchNearby', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Goog-Api-Key': API_KEY, 'X-Goog-FieldMask': 'places.id,places.displayName', 'X-Goog-FieldMask': '*' },
    body: JSON.stringify(body)
  });
  if(!res.ok) {
     const er = await res.text();
     console.log(`Nearby ${types.join(',')} Error:`, er);
     return;
  }
  const data = await res.json();
  console.log(`Nearby ${types.join(',')}:`, data.places ? data.places.length : 0);
}

async function testSearchText(query) {
  const body = {
    textQuery: query,
    locationRestriction: {
      circle: { center: { latitude: parseFloat(lat), longitude: parseFloat(lng) }, radius: radiusM }
    },
    maxResultCount: 20
  };
  const res = await fetch('https://places.googleapis.com/v1/places:searchText', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Goog-Api-Key': API_KEY, 'X-Goog-FieldMask': 'places.id,places.displayName' },
    body: JSON.stringify(body)
  });
  if(!res.ok) {
     const er = await res.text();
     console.log(`Text ${query} Error:`, er);
     return;
  }
  const data = await res.json();
  console.log(`Text ${query}:`, data.places ? data.places.length : 0);
}

async function run() {
  await testSearchNearby(['restaurant']);
  await testSearchNearby(['apartment_complex']);
  await testSearchNearby(['corporate_office']);
  await testSearchText('restaurant');
  await testSearchText('apartments');
  await testSearchText('office');
}
run();
