export interface SafeFetchResult<T = any> {
  ok: boolean;
  status: number;
  data: T | null;
  error?: string;
}

/**
 * Safely fetches an endpoint and parses JSON without ever throwing
 * `Unexpected token 'T', "The page c"... is not valid JSON` when a host
 * returns HTML/plain-text error pages (e.g. static 404 or gateway page).
 */
export async function safeFetchJson<T = any>(
  url: string,
  options?: RequestInit
): Promise<SafeFetchResult<T>> {
  try {
    const res = await fetch(url, options);
    const rawText = await res.text();
    const trimmed = rawText.trim();

    let parsed: any = null;
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
      try {
        parsed = JSON.parse(trimmed);
      } catch {
        parsed = null;
      }
    }

    if (!res.ok) {
      const errMsg =
        (parsed && typeof parsed.error === 'string' && parsed.error) ||
        `Request returned status ${res.status}`;
      return {
        ok: false,
        status: res.status,
        data: parsed,
        error: errMsg,
      };
    }

    if (parsed === null) {
      return {
        ok: false,
        status: res.status,
        data: null,
        error: 'Received a non-JSON response from server.',
      };
    }

    return {
      ok: true,
      status: res.status,
      data: parsed as T,
    };
  } catch (err: any) {
    return {
      ok: false,
      status: 0,
      data: null,
      error: err?.message || 'Network request failed.',
    };
  }
}
