import { Router } from "express";
import { XMLParser } from "fast-xml-parser";
import { fetchWithRetry, getCachedOrSet } from "../services/academic.service";

const router = Router();

router.get("/academic/search", async (req, res) => {
  const { query, offset, limit, fields } = req.query;
  const cacheKey = `ss_${query}_${offset}_${limit}_${fields}`;

  try {
    const data = await getCachedOrSet(cacheKey, async () => {
      const SEMANTIC_SCHOLAR_API = 'https://api.semanticscholar.org/graph/v1/paper/search';
      const url = `${SEMANTIC_SCHOLAR_API}?query=${encodeURIComponent(query as string)}&offset=${offset || 0}&limit=${limit || 10}&fields=${fields || 'title,authors,year,abstract,url,citationCount,venue,publicationDate,relevanceScore'}`;
      
      const headers: Record<string, string> = {};
      if (process.env.SEMANTIC_SCHOLAR_API_KEY) {
        headers['x-api-key'] = process.env.SEMANTIC_SCHOLAR_API_KEY;
      }

      const response = await fetchWithRetry(url, { headers });
      if (!response.ok) {
        throw new Error(await response.text());
      }
      return response.json();
    });
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: `Semantic Scholar API error: ${error.message}` });
  }
});

router.get("/openalex/search", async (req, res) => {
  const { query, page, perPage, minYear } = req.query;
  let url = `https://api.openalex.org/works?search=${encodeURIComponent(query as string)}&per-page=${perPage || 5}&page=${page || 1}&select=id,title,authorships,publication_year,abstract_inverted_index,cited_by_count,doi`;
  if (minYear) url += `&filter=publication_year:>${parseInt(minYear as string) - 1}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    
    const results = data.results.map((item: any) => ({
      title: item.title,
      authors: item.authorships.map((a: any) => a.author.display_name),
      year: item.publication_year,
      link: item.id
    }));

    res.json({ source: "OpenAlex", results });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch from OpenAlex' });
  }
});

router.get("/arxiv/search", async (req, res) => {
  const { query, maxResults } = req.query;
  const url = `http://export.arxiv.org/api/query?search_query=${encodeURIComponent(query as string)}&start=0&max_results=${maxResults || 5}`;

  try {
    const response = await fetch(url);
    const xmlData = await response.text();
    
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "@_"
    });
    const jsonObj = parser.parse(xmlData);
    
    let entries = jsonObj.feed?.entry || [];
    if (!Array.isArray(entries)) entries = [entries];

    const results = entries.map((entry: any) => ({
      title: entry.title?.replace(/\n/g, ' ').trim(),
      authors: Array.isArray(entry.author) 
        ? entry.author.map((a: any) => a.name) 
        : [entry.author?.name].filter(Boolean),
      summary: entry.summary?.replace(/\n/g, ' ').trim(),
      link: entry.id
    }));

    res.json({ source: "arXiv", results });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch from arXiv' });
  }
});

router.get("/search/all", async (req, res) => {
  const { query } = req.query;
  if (!query) return res.status(400).json({ error: "Query required" });

  try {
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    
    const [openalexRes, arxivRes] = await Promise.all([
      fetch(`${baseUrl}/api/openalex/search?query=${encodeURIComponent(query as string)}`),
      fetch(`${baseUrl}/api/arxiv/search?query=${encodeURIComponent(query as string)}`)
    ]);

    const openalexData = await openalexRes.json();
    const arxivData = await arxivRes.json();

    res.json({
      query,
      sources: [openalexData, arxivData]
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch combined results' });
  }
});

export default router;
