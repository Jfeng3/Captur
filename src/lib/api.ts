// API configuration utility
const API_URL = import.meta.env.VITE_API_URL || '';

// Helper to get full API URL
export function getApiUrl(path: string): string {
  // If path doesn't start with /, add it
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  
  // In production, use the full URL
  // In development, relative URLs work since Vite proxies them
  return import.meta.env.PROD 
    ? `${API_URL}${normalizedPath}`
    : normalizedPath;
}

// Wrapper for fetch with proper URL handling
export async function apiFetch(path: string, options?: RequestInit): Promise<Response> {
  return fetch(getApiUrl(path), options);
}