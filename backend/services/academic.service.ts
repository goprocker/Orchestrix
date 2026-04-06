export const academicCache = new Map<string, { data: any, timestamp: number }>();
const CACHE_TTL = 1000 * 60 * 60; // 1 hour
const MAX_CACHE_SIZE = 100;

export async function fetchWithRetry(url: string, options: any = {}, retries = 7, backoff = 3000) {
  for (let i = 0; i < retries; i++) {
    const response = await fetch(url, options);
    
    if (response.status === 429 && i < retries - 1) {
      const retryAfter = response.headers.get("Retry-After");
      let wait = 0;
      
      if (retryAfter) {
        wait = isNaN(Number(retryAfter)) 
          ? (new Date(retryAfter).getTime() - Date.now()) 
          : Number(retryAfter) * 1000;
      }
      
      if (!wait || wait <= 0) {
        wait = (backoff * Math.pow(2, i)) + (Math.random() * 1000);
      }

      console.log(`[RETRY] Rate limited (429). Attempt ${i + 1}/${retries}. Waiting ${Math.round(wait)}ms...`);
      await new Promise(resolve => setTimeout(resolve, wait));
      continue;
    }
    return response;
  }
  return fetch(url, options);
}

export async function getCachedOrSet(key: string, fetcher: () => Promise<any>) {
  const cached = academicCache.get(key);
  if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
    console.log(`[CACHE] Hit: ${key}`);
    return cached.data;
  }
  
  const data = await fetcher();
  academicCache.set(key, { data, timestamp: Date.now() });
  
  if (academicCache.size > MAX_CACHE_SIZE) {
    const firstKey = academicCache.keys().next().value;
    if (firstKey) academicCache.delete(firstKey);
  }
  
  return data;
}
