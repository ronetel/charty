export default async function fetchWithTiming(input: RequestInfo, init?: RequestInit) {
  const start = Date.now();
  const method = (init && init.method) || "GET";
  const url = typeof input === "string" ? input : input instanceof Request ? input.url : String(input);

  // simple GET cache (sessionStorage), TTL 30s
  const cacheKey = `fetch_cache:${method}:${url}`;
  if ((!init || (init && init.method === "GET")) && typeof window !== "undefined") {
    try {
      const raw = sessionStorage.getItem(cacheKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Date.now() - parsed.ts < 30000) {
          console.debug(`fetchWithTiming: cache hit ${url}`);
          return new Response(JSON.stringify(parsed.data), { status: 200 });
        }
      }
    } catch (e) {
      // ignore cache errors
    }
  }

  const res = await fetch(input, init);
  const elapsed = Date.now() - start;
  console.debug(`fetchWithTiming: ${method} ${url} ${res.status} ${elapsed}ms`);

  // store GET responses in session cache
  if (res.ok && (!init || (init && init.method === "GET")) && typeof window !== "undefined") {
    try {
      const clone = res.clone();
      const data = await clone.json().catch(() => null);
      if (data !== null) {
        sessionStorage.setItem(cacheKey, JSON.stringify({ ts: Date.now(), data }));
      }
    } catch (e) {
      // ignore
    }
  }

  return res;
}
