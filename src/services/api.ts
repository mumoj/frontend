const API_BASE = process.env.REACT_APP_API_BASE_URL || '';

export const apiRequest = async (endpoint: string, options = {}) => {
  // In development, use relative URLs (will be proxied)
  // In production, use absolute URLs with the base
  const url = API_BASE ? `${API_BASE}${endpoint}` : endpoint;
  
  const response = await fetch(url, {
    ...options,
    credentials: 'include',
  });
  
  return response;
};