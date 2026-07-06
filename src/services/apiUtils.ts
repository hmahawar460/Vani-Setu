async function parseJsonResponse<T>(response: Response): Promise<T> {
  const text = await response.text();
  try {
    return JSON.parse(text) as T;
  } catch {
    // Include status and a snippet of the raw response to help diagnose the issue
    const preview = text.slice(0, 200).replace(/\n/g, ' ');
    throw new Error(
      `Server error (HTTP ${response.status}): received non-JSON response. ` +
      `Preview: "${preview}". ` +
      `Check that GROQ_API_KEY is set in Vercel's Environment Variables dashboard.`
    );
  }
}

/**
 * Prepends the backend API URL to the path.
 * If VITE_API_URL is not set, it defaults to empty string (which uses the current origin).
 */
function getApiUrl(path: string): string {
  const baseUrl = import.meta.env.VITE_API_URL || '';
  // Ensure we don't end up with double slashes if baseUrl has a trailing slash and path has a leading slash
  const normalizedBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${normalizedBase}${normalizedPath}`;
}

export { parseJsonResponse, getApiUrl };
