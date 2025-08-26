import { API_BASE_URL } from './config';

interface ApiOptions extends RequestInit {
  requireAuth?: boolean;
}

interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
}

// Get auth token from localStorage
function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('authToken');
}

// Handle auth errors by clearing invalid tokens
function handleAuthError() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
  window.dispatchEvent(new Event('authUpdate'));
  // Redirect to login
  window.location.href = '/login';
}

// Enhanced fetch wrapper with auth handling
export async function apiCall<T = any>(
  endpoint: string, 
  options: ApiOptions = {}
): Promise<ApiResponse<T>> {
  const { requireAuth = true, headers = {}, ...fetchOptions } = options;
  
  // Check authentication
  if (requireAuth) {
    const token = getAuthToken();
    if (!token) {
      console.warn('No auth token available for API call:', endpoint);
      return { error: 'Authentication required' };
    }
    
    (headers as any)['Authorization'] = `Bearer ${token}`;
  }

  // Add default headers
  (headers as any)['Content-Type'] = (headers as any)['Content-Type'] || 'application/json';

  try {
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
    console.log(`🌐 API Call: ${fetchOptions.method || 'GET'} ${url}`);
    
    const response = await fetch(url, {
      ...fetchOptions,
      headers,
    });

    // Handle auth errors
    if (response.status === 401) {
      console.error('Authentication failed - clearing tokens');
      handleAuthError();
      return { error: 'Authentication failed' };
    }

    // Handle other HTTP errors
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Network error' }));
      console.error(`API Error ${response.status}:`, errorData);
      return { 
        error: errorData.error || 'API Error', 
        message: errorData.message || `HTTP ${response.status}` 
      };
    }

    const data = await response.json();
    console.log(`✅ API Success: ${endpoint}`);
    return { data };

  } catch (error) {
    console.error('API Call failed:', error);
    return { 
      error: 'Network Error', 
      message: error instanceof Error ? error.message : 'Unknown network error' 
    };
  }
}

// Convenience methods
export const api = {
  get: <T>(endpoint: string, options?: Omit<ApiOptions, 'method'>) =>
    apiCall<T>(endpoint, { ...options, method: 'GET' }),
    
  post: <T>(endpoint: string, body?: any, options?: Omit<ApiOptions, 'method' | 'body'>) =>
    apiCall<T>(endpoint, { 
      ...options, 
      method: 'POST', 
      body: body ? JSON.stringify(body) : undefined 
    }),
    
  put: <T>(endpoint: string, body?: any, options?: Omit<ApiOptions, 'method' | 'body'>) =>
    apiCall<T>(endpoint, { 
      ...options, 
      method: 'PUT', 
      body: body ? JSON.stringify(body) : undefined 
    }),
    
  delete: <T>(endpoint: string, options?: Omit<ApiOptions, 'method'>) =>
    apiCall<T>(endpoint, { ...options, method: 'DELETE' }),
};