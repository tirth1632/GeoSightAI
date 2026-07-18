import dotenv from 'dotenv';
dotenv.config();

const API_KEY = process.env.VITE_GOOGLE_MAPS_API_KEY;

async function testApi() {
  let pageToken = "";
  let totalPlaces = 0;
  for (let i = 0; i < 5; i++) {
    const bodyReq = {
      textQuery: "EV charging station in Pune, Maharashtra, India",
    };
    if (pageToken) bodyReq.pageToken = pageToken;

    const res = await fetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': API_KEY,
        'X-Goog-FieldMask': 'places.location,places.displayName,nextPageToken'
      },
      body: JSON.stringify(bodyReq)
    });

    const data = await res.json();
    if (data.places) {
      totalPlaces += data.places.length;
      console.log(`Page ${i + 1} got ${data.places.length} places. Total: ${totalPlaces}`);
    } else {
      console.log(`Page ${i + 1} got no places. Error?`, data);
      break;
    }

    if (data.nextPageToken) {
      console.log(`Got nextPageToken: ${data.nextPageToken.substring(0, 20)}...`);
      pageToken = data.nextPageToken;
    } else {
      console.log("No nextPageToken found.");
      break;
    }
  }
}

testApi();
