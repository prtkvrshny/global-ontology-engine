import * as cheerio from 'cheerio';

export default async function handler(req, res) {
  try {
    const { url } = req.query;
    if (!url) return res.status(400).json({ error: 'Missing URL' });

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    const response = await fetch(url, { 
        signal: controller.signal,
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' }
    });
    clearTimeout(timeoutId);

    if (!response.ok) throw new Error(`Fetch failed: ${response.status}`);
    const html = await response.text();
    const $ = cheerio.load(html);
    
    const metaDesc = $('meta[name="description"]').attr('content') || $('meta[property="og:description"]').attr('content') || '';
    
    let text = '';
    $('article p, main p, .content p, .article-body p, .post-content p, .entry-content p, p').each((i, el) => {
      const pText = $(el).text().trim();
      if (pText.length > 40) text += pText + '\n\n';
    });
    
    if (text.length < 200 && metaDesc) {
      text = "SUMMARY FROM SOURCE: " + metaDesc + "\n\n" + text;
    }
    
    text = text.replace(/\s+/g, ' ').trim().slice(0, 4500); 

    res.status(200).json({ text });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
