export const API_BASE_URL = 'http://localhost:8000/api/v1';

export const fetchAPI = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.detail || `HTTP Error: ${response.status}`;
      const err = new Error(errorMessage);
      err.status = response.status;
      throw err;
    }
    
    return await response.json();
  } catch (error) {
    if (error.status !== 404) {
      console.error(`API Error on ${endpoint}:`, error);
    }
    throw error;
  }
};

export const getWebSocketUrl = (endpoint) => {
  return `ws://localhost:8000/api/v1${endpoint}`;
};
