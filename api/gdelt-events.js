import https from 'https';
import http from 'http';
import AdmZip from 'adm-zip';
import * as cheerio from 'cheerio';

const COUNTRY_FIPS = {
  "Afghanistan": "AF", "Algeria": "AG", "Argentina": "AR", "Australia": "AS",
  "Brazil": "BR", "Canada": "CA", "China": "CH", "Egypt": "EG", "France": "FR",
  "Germany": "GM", "India": "IN", "Indonesia": "ID", "Iran": "IR", "Iraq": "IZ",
  "Israel": "IS", "Italy": "IT", "Japan": "JA", "Mexico": "MX", "Nigeria": "NI",
  "North Korea": "KN", "Pakistan": "PK", "Russia": "RS", "Saudi Arabia": "SA",
  "South Africa": "SF", "South Korea": "KS", "Turkey": "TU", "Ukraine": "UP",
  "United Kingdom": "UK", "United States": "US"
};

async function getLatestExportTimestamp() {
  return new Promise((resolve, reject) => {
    http.get('http://data.gdeltproject.org/gdeltv2/lastupdate.txt', (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        const firstLine = data.trim().split('\n')[0];
        if (firstLine) {
          const parts = firstLine.split(' ');
          const url = parts[2];
          const match = url.match(/\/(\d{14})\.export/);
          if (match) resolve(match[1]);
          else reject(new Error('Format changed'));
        } else reject(new Error('Invalid lastupdate.txt format'));
      });
    }).on('error', err => reject(err));
  });
}

async function downloadBuffer(url) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https') ? https : http;
    lib.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return downloadBuffer(res.headers.location).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) return reject(new Error(`HTTP ${res.statusCode}`));
      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => resolve(Buffer.concat(chunks)));
    }).on('error', err => reject(err));
  });
}

function parseGdeltDateString(ds) {
    if (!ds || ds.length !== 14) return null;
    return new Date(Date.UTC(parseInt(ds.slice(0, 4)), parseInt(ds.slice(4, 6)) - 1, parseInt(ds.slice(6, 8)), parseInt(ds.slice(8, 10)), parseInt(ds.slice(10, 12)), parseInt(ds.slice(12, 14))));
}

function formatDateString(d) {
    const pad = (n) => n.toString().padStart(2, '0');
    return `${d.getUTCFullYear()}${pad(d.getUTCMonth()+1)}${pad(d.getUTCDate())}${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}00`;
}

function classifyCameo(eventRootCode) {
  const code = parseInt(eventRootCode);
  if (isNaN(code)) return 'Geopolitics';
  if (code >= 1 && code <= 5) return 'Geopolitics';
  if (code === 6 || code === 7) return 'Economics';
  if (code === 8) return 'Geopolitics';
  if (code === 14) return 'Society';
  if (code >= 15 && code <= 20) return 'Defense';
  return 'Geopolitics';
}

function classifyByText(actor1, actor2) {
   const text = `${actor1} ${actor2}`.toLowerCase();
   if (text.match(/tech|cyber|satellite|software|digital|ai|computer/)) return 'Technology';
   if (text.match(/climate|water|weather|environment|disaster/)) return 'Climate';
   if (text.match(/bank|trade|market|economy|business|corporate/)) return 'Economics';
   if (text.match(/health|citizen|protest|education|society/)) return 'Society';
   return null;
}

function getCameoVerb(rootCode) {
    const map = {
        '01': 'makes public statement towards', '02': 'issues an appeal to', '03': 'expresses intent to cooperate with', '04': 'holds diplomatic consultations with',
        '05': 'engages in diplomatic cooperation with', '06': 'engages in material cooperation with', '07': 'provides economic or humanitarian aid to',
        '08': 'yields political concessions to', '09': 'initiates formal investigation into', '10': 'issues stringent demands to', '11': 'expresses formal disapproval of',
        '12': 'rejects proposals or demands from', '13': 'issues strategic threats against', '14': 'engages in political protest against',
        '15': 'exhibits military force posture towards', '16': 'reduces diplomatic relations with', '17': 'applies coercive measures against',
        '18': 'conducts physical assault against', '19': 'engages in armed conflict with', '20': 'utilizes unconventional mass violence against'
    };
    return map[rootCode.toString().padStart(2, '0')] || 'interacts with';
}

function extractDomainFromUrl(url) {
  if (!url) return 'GDELT';
  try { return url.replace(/^https?:\/\//, '').split('/')[0].replace(/^www\./, '').toUpperCase(); } catch { return 'GDELT'; }
}

export default async function handler(req, res) {
  try {
    const { country = 'United States' } = req.query;
    const latestTs = await getLatestExportTimestamp();
    const latestDate = parseGdeltDateString(latestTs);
    const urls = [];
    // Production optimization: Limit to last 3 ZIP files (45 mins) to stay within Vercel timeout (10s limit)
    for (let i = 0; i < 3; i++) {
        urls.push(`http://data.gdeltproject.org/gdeltv2/${formatDateString(new Date(latestDate.getTime() - (i * 15 * 60 * 1000)))}.export.CSV.zip`);
    }

    const downloads = await Promise.allSettled(urls.map(url => downloadBuffer(url)));
    const parsedEvents = [];
    const processedUrls = new Set();
    const fipsCode = COUNTRY_FIPS[country];
    const textMatch = country.toLowerCase();

    for (const result of downloads) {
      if (result.status !== 'fulfilled') continue;
      const zip = new AdmZip(result.value);
      const csvText = zip.getEntries()[0].getData().toString('utf8');
      const lines = csvText.split('\n');

      for (const line of lines) {
        const cols = line.split('\t');
        if (cols.length < 61) continue;
        const sourceUrl = cols[60]?.trim();
        if (!sourceUrl || processedUrls.has(sourceUrl)) continue;

        const a1Name = cols[6] || '';
        const a2Name = cols[16] || '';
        const a1Fips = cols[7];
        const a2Fips = cols[17];

        const isMatch = a1Fips === fipsCode || a2Fips === fipsCode || 
                        a1Name.toLowerCase().includes(textMatch) || a2Name.toLowerCase().includes(textMatch) ||
                        sourceUrl.toLowerCase().includes(textMatch);

        if (isMatch) {
            processedUrls.add(sourceUrl);
            const eventRootCode = cols[28];
            const dateAdded = cols[59];
            const goldstein = parseFloat(cols[34]) || 0;
            const category = classifyByText(a1Name, a2Name) || classifyCameo(eventRootCode);
            
            let severity = 'low';
            if (goldstein < -5) severity = 'high';
            else if (goldstein < -2) severity = 'moderate';

            const cleanA1 = a1Name ? a1Name.charAt(0).toUpperCase() + a1Name.slice(1).toLowerCase() : 'An entity';
            let title = `${cleanA1} ${getCameoVerb(eventRootCode)}`;
            if (a2Name) title += ` ${a2Name.toUpperCase()}`;

            let dateObj = parseGdeltDateString(dateAdded) || new Date();
            dateObj = new Date(dateObj.getTime() + (Math.random() - 0.5) * 14 * 60 * 1000);

            parsedEvents.push({ title, url: sourceUrl, pubDate: dateObj.toISOString(), domain: category, severity, source: extractDomainFromUrl(sourceUrl) });
        }
      }
    }

    const organized = { Geopolitics: [], Economics: [], Defense: [], Technology: [], Climate: [], Society: [] };
    parsedEvents.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
    for (const ev of parsedEvents) {
      if (organized[ev.domain] && organized[ev.domain].length < 10) {
        organized[ev.domain].push(ev);
      }
    }

    // Parallel Title Scrape (Limited to 5 per category to avoid timeout)
    const scrapeQueue = [];
    Object.keys(organized).forEach(cat => scrapeQueue.push(...organized[cat].slice(0, 5)));
    
    await Promise.allSettled(scrapeQueue.map(async (feed) => {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 2000);
            const response = await fetch(feed.url, { signal: controller.signal, headers: { 'User-Agent': 'Mozilla/5.0' } });
            clearTimeout(timeoutId);
            if (response.ok) {
                const html = await response.text();
                const $ = cheerio.load(html);
                const title = $('title').text() || $('meta[property="og:title"]').attr('content');
                if (title && title.trim().length > 10) feed.title = title.replace(/\s+/g, ' ').trim();
            }
        } catch (e) {}
    }));

    res.status(200).json(organized);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
