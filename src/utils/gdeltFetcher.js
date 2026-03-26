/**
 * GDELT Events CSV Fetcher
 * 
 * Calls the local Vite Dev Server proxy (/api/gdelt-events)
 * which handles the heavy lifting of downloading, unzipping, parsing,
 * filtering, and organizing the raw GDELT Events CSV.
 */

export async function fetchAllCategoryFeeds(country) {
  try {
    const url = `/api/gdelt-events?country=${encodeURIComponent(country)}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(35000) });
    
    if (!res.ok) {
        throw new Error(`Local API returned ${res.status}`);
    }

    const feeds = await res.json();
    return feeds;
  } catch (err) {
    console.error('GDELT Pipeline Wrapper error:', err);
    throw err;
  }
}



/**
 * Calculate relative time from a date string.
 * e.g. "3 min ago", "2 hrs ago", "1 day ago"
 */
export function getRelativeTime(dateString) {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now - date;

  if (isNaN(diffMs) || diffMs < 0) return 'just now';

  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffSec < 60) return 'just now';
  if (diffMin < 60) return `${diffMin} min ago`;
  if (diffHr < 24) return `${diffHr} hr${diffHr > 1 ? 's' : ''} ago`;
  return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
}
