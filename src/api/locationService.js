let debounceTimer = null;
const cache = {};

export const LocationService = {
  async searchLocations(query) {
    if (!query || query.trim().length === 0) {
      return [];
    }

    const queryLower = query.toLowerCase().trim();
    
    if (cache[queryLower]) {
      return cache[queryLower];
    }

    return new Promise((resolve) => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }

      debounceTimer = setTimeout(async () => {
        try {
          const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=10&language=en&format=json`;
          const response = await fetch(url);

          if (response.ok) {
            const data = await response.json();
            if (data.results) {
              const results = [];
              for (const item of data.results) {
                const city = item.name || '';
                const state = item.admin1 || '';
                const country = item.country || '';
                
                let formatted = city;
                if (state && state !== city) {
                  formatted += `, ${state}`;
                }
                if (country) {
                  formatted += `, ${country}`;
                }
                
                if (!results.includes(formatted)) {
                  results.push(formatted);
                }
              }
              cache[queryLower] = results;
              resolve(results);
              return;
            }
          }
        } catch (e) {
          console.error('Error fetching locations:', e);
        }
        resolve([]);
      }, 500);
    });
  }
};
