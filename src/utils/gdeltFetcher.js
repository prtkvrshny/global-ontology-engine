export function fetchGdeltData(query, maxRecords = 10) {
  return new Promise((resolve, reject) => {
    // Generate unique callback function name to avoid collisions
    const callbackName = 'gdelt_cb_' + Math.round(10000000 * Math.random());
    
    // GDELT uniquely supports jsonp via format=jsonp
    const url = `https://api.gdeltproject.org/api/v2/doc/doc?query=${encodeURIComponent(query)}&mode=artlist&maxrecords=${maxRecords}&format=jsonp&callback=${callbackName}`;
    
    const script = document.createElement('script');
    script.src = url;
    
    // Aggressive timeout to prevent eternal loading if GDELT is offline
    const timeoutId = setTimeout(() => {
        cleanup();
        reject(new Error("GDELT API (JSONP) timed out"));
    }, 5000);
    
    // Define the global callback mapping JSONP injection
    window[callbackName] = (data) => {
        cleanup();
        if(data && data.articles) {
            resolve(data.articles);
        } else {
            resolve([]); // Return empty array if valid JSON but no articles
        }
    };
    
    script.onerror = () => {
        cleanup();
        reject(new Error("JSONP Request blocked by network/browser extension"));
    };
    
    const cleanup = () => {
        clearTimeout(timeoutId);
        if(document.body.contains(script)) document.body.removeChild(script);
        delete window[callbackName];
    };
    
    document.body.appendChild(script);
  });
}
