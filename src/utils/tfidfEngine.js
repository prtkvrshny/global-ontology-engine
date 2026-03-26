/**
 * TF-IDF Retrieval Engine
 * Zero-dependency information retrieval using Term Frequency–Inverse Document Frequency
 * with cosine similarity for ranking document relevance.
 */

// ─── Stopwords (common words to ignore) ───
const STOPWORDS = new Set([
  'a','an','the','and','or','but','in','on','at','to','for','of','with','by',
  'from','is','it','its','was','are','be','has','had','have','this','that',
  'these','those','he','she','they','we','you','i','me','my','your','his',
  'her','our','their','us','them','will','would','could','should','can',
  'do','does','did','been','being','not','no','so','if','than','then',
  'also','just','about','more','very','all','any','each','every','some',
  'such','into','over','after','before','between','under','through','during',
  'up','down','out','off','as','how','what','when','where','which','who',
  'why','new','said','says','like','may','now','even','still','way','many',
  'much','most','other','only','own','same','well','back','here','there',
  'www','http','https','com','org','news'
]);

// ─── Light stemmer (suffix stripping) ───
function stem(word) {
  if (word.length < 4) return word;
  return word
    .replace(/ies$/, 'y')
    .replace(/ied$/, 'y')
    .replace(/ing$/, '')
    .replace(/tion$/, 't')
    .replace(/sion$/, 's')
    .replace(/ment$/, '')
    .replace(/ness$/, '')
    .replace(/able$/, '')
    .replace(/ible$/, '')
    .replace(/ful$/, '')
    .replace(/ous$/, '')
    .replace(/ive$/, '')
    .replace(/ly$/, '')
    .replace(/er$/, '')
    .replace(/ed$/, '')
    .replace(/es$/, '')
    .replace(/s$/, '');
}

// ─── Tokenizer ───
function tokenize(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2 && !STOPWORDS.has(w))
    .map(stem);
}

// ─── TF-IDF Index Class ───
export class TFIDFIndex {
  constructor() {
    this.documents = [];      // Original documents
    this.tokenizedDocs = [];  // Tokenized versions
    this.idf = {};            // Inverse Document Frequency per term
    this.tfidfVectors = [];   // TF-IDF vector per document
    this.vocabulary = new Set();
  }

  /**
   * Build the index from an array of documents.
   * Each document: { id, title, category, source, score, url?, pubDate? }
   */
  buildIndex(documents) {
    this.documents = documents;
    this.tokenizedDocs = documents.map(doc => tokenize(doc.title || ''));

    // Build vocabulary
    this.vocabulary = new Set();
    this.tokenizedDocs.forEach(tokens => tokens.forEach(t => this.vocabulary.add(t)));

    // Compute IDF: log(N / (df + 1)) where df = number of docs containing term
    const N = this.documents.length;
    const df = {};
    this.tokenizedDocs.forEach(tokens => {
      const unique = new Set(tokens);
      unique.forEach(t => { df[t] = (df[t] || 0) + 1; });
    });
    this.idf = {};
    for (const term of this.vocabulary) {
      this.idf[term] = Math.log((N + 1) / ((df[term] || 0) + 1)) + 1; // smoothed IDF
    }

    // Compute TF-IDF vectors for each document
    this.tfidfVectors = this.tokenizedDocs.map(tokens => {
      const tf = {};
      tokens.forEach(t => { tf[t] = (tf[t] || 0) + 1; });
      // Normalize TF by max frequency
      const maxTf = Math.max(...Object.values(tf), 1);
      const vector = {};
      for (const term of Object.keys(tf)) {
        vector[term] = (tf[term] / maxTf) * (this.idf[term] || 0);
      }
      return vector;
    });

    return this;
  }

  /**
   * Add new documents to the index without full rebuild.
   */
  addDocuments(newDocs) {
    const allDocs = [...this.documents, ...newDocs];
    this.buildIndex(allDocs);
    return this;
  }

  /**
   * Search the index with a query string.
   * Returns top-K documents sorted by cosine similarity.
   */
  search(query, topK = 8) {
    if (this.documents.length === 0) return [];

    // Tokenize and vectorize the query
    const queryTokens = tokenize(query);
    const queryTf = {};
    queryTokens.forEach(t => { queryTf[t] = (queryTf[t] || 0) + 1; });
    const maxQTf = Math.max(...Object.values(queryTf), 1);
    
    const queryVector = {};
    for (const term of Object.keys(queryTf)) {
      queryVector[term] = (queryTf[term] / maxQTf) * (this.idf[term] || 1);
    }

    // Compute cosine similarity between query and each document
    const results = this.tfidfVectors.map((docVector, idx) => {
      const similarity = cosineSimilarity(queryVector, docVector);
      return { index: idx, similarity, document: this.documents[idx] };
    });

    // Sort by similarity descending, filter zero similarity
    return results
      .filter(r => r.similarity > 0)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topK);
  }

  /**
   * Get the top N terms by IDF (most discriminative terms in the corpus).
   */
  getTopTerms(n = 15) {
    return Object.entries(this.idf)
      .sort((a, b) => b[1] - a[1])
      .slice(0, n)
      .map(([term, score]) => ({ term, score: score.toFixed(2) }));
  }

  /**
   * Get index stats.
   */
  getStats() {
    const categoryCounts = {};
    this.documents.forEach(doc => {
      const cat = doc.category || 'Unknown';
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    });
    return {
      totalDocuments: this.documents.length,
      vocabularySize: this.vocabulary.size,
      categories: categoryCounts,
    };
  }
}

// ─── Cosine Similarity ───
function cosineSimilarity(vecA, vecB) {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  const allTerms = new Set([...Object.keys(vecA), ...Object.keys(vecB)]);
  
  for (const term of allTerms) {
    const a = vecA[term] || 0;
    const b = vecB[term] || 0;
    dotProduct += a * b;
    normA += a * a;
    normB += b * b;
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  return denominator === 0 ? 0 : dotProduct / denominator;
}

// ─── Singleton factory ───
let indexInstance = null;

export function getOrCreateIndex() {
  if (!indexInstance) {
    indexInstance = new TFIDFIndex();
  }
  return indexInstance;
}

export function resetIndex() {
  indexInstance = new TFIDFIndex();
  return indexInstance;
}
