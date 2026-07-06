async function parseJsonResponse<T>(response: Response): Promise<T> {
  const text = await response.text();
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error('Server returned an invalid response. Check if the backend is running or deployed correctly.');
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
