import { analyzeLocationDetails } from './LocationEngine.js';

async function run() {
  try {
    const res = await analyzeLocationDetails(20.5937, 78.9629, 'ev');
    console.log("SUCCESS:", res);
  } catch (err) {
    console.error("ERROR CAUGHT:");
    console.error(err);
  }
}
run();
