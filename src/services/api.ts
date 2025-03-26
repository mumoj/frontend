const API_BASE = process.env.REACT_APP_API_BASE_URL || '';

export const apiRequest = async (endpoint: string, options = {}) => {
  // In development, use relative URLs (will be proxied)
  // In production, use absolute URLs with the base
  const url = API_BASE ? `${API_BASE}${endpoint}` : endpoint;

  // Log the URL being used for the request
  console.log(`API Request to: ${url}`);
  console.log(`API_BASE value: "${API_BASE}"`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
  
  const response = await fetch(url, {
    ...options,
    credentials: 'include',
  });
  
  return response;
};