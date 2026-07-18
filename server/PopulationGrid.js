import fs from 'fs';
import path from 'path';

class PopulationGrid {
  static grid = new Map();
  static isLoaded = false;
  static resolution = 0.05; // Group points into roughly 5.5km buckets.

  static async load() {
    if (this.isLoaded) return true;
    return new Promise((resolve) => {
      console.log("[\x1b[35mPopulationGrid\x1b[0m] Loading 62MB CSV into spatial index...");
      const csvPath = path.join(process.cwd(), 'population density.csv');
      
      fs.readFile(csvPath, 'utf8', (err, data) => {
        if (err) {
          console.error("[\x1b[31mError\x1b[0m] Could not load population density.csv:", err);
          return resolve(false);
        }
        
        console.time("PopulationGrid Build Time");
        const rows = data.split('\n');
        
        for (let i = 1; i < rows.length; i++) {
          const row = rows[i].trim();
          if (!row) continue;
          
          const parts = row.split(',');
          if (parts.length >= 3) {
            const lng = parseFloat(parts[0]);
            const lat = parseFloat(parts[1]);
            const pop = parseFloat(parts[2]);
            
            if (!isNaN(lat) && !isNaN(lng) && !isNaN(pop) && pop > 0) {
              const cellX = Math.floor(lng / this.resolution);
              const cellY = Math.floor(lat / this.resolution);
              const key = `${cellX},${cellY}`;
              
              if (!this.grid.has(key)) {
                this.grid.set(key, []);
              }
              this.grid.get(key).push({ lat, lng, pop });
            }
          }
        }
        
        console.timeEnd("PopulationGrid Build Time");
        this.isLoaded = true;
        console.log(`[\x1b[32mSuccess\x1b[0m] Population Index Built: ${this.grid.size} grids initialized.`);
        resolve(true);
      });
    });
  }

  static getDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  static getDensityNear(lat, lng, radiusKm) {
    if (!this.isLoaded) return 0;
    
    // We check roughly the bounding cells based on resolution.
    // 0.05 degrees is approx 5.5km
    const cellRadius = Math.ceil(radiusKm / (this.resolution * 111)); 
    const centerCellX = Math.floor(lng / this.resolution);
    const centerCellY = Math.floor(lat / this.resolution);
    
    let totalPop = 0;

    for (let xOffset = -cellRadius; xOffset <= cellRadius; xOffset++) {
      for (let yOffset = -cellRadius; yOffset <= cellRadius; yOffset++) {
        const key = `${centerCellX + xOffset},${centerCellY + yOffset}`;
        const pts = this.grid.get(key);
        if (pts) {
          for (let i = 0; i < pts.length; i++) {
             const dist = this.getDistance(lat, lng, pts[i].lat, pts[i].lng);
             if (dist <= radiusKm) {
                totalPop += pts[i].pop;
             }
          }
        }
      }
    }
    
    return totalPop;
  }
}

export default PopulationGrid;
