async function parseJsonResponse<T>(response: Response): Promise<T> {
  const text = await response.text();
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error('Server returned an invalid response. Run npm run dev or redeploy on Vercel.');
  }
}

export { parseJsonResponse };
