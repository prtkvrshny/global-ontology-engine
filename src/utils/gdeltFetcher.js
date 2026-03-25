export async function fetchGdeltData(query, maxRecords = 15) {
  // We utilize a stable RSS-to-JSON proxy to scrape Google News directly.
  // This bypasses the terminal 429 blockades plaguing the public GDELT endpoints.
  const encodedQuery = encodeURIComponent(`${query} news`);
  const rssUrl = `https://news.google.com/rss/search?q=${encodedQuery}&hl=en-US&gl=US&ceid=US:en`;
  const proxyUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}&api_key=`; 
  
  try {
    const res = await fetch(proxyUrl);
    if (!res.ok) throw new Error("RSS Proxy failed");
    
    const data = await res.json();
    if (data.status === 'ok' && data.items) {
       return data.items.slice(0, maxRecords).map(item => ({
           title: item.title,
           url: item.link,
           domain: item.source || 'GN-RSS',
           pubDate: item.pubDate 
       }));
    }
    return [];
  } catch (err) {
    console.error('Data pipeline error:', err);
    throw err;
  }
}
