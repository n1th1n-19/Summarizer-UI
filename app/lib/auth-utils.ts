// Utility functions for authentication management

/**
 * Clear all authentication data from localStorage
 */
export function clearAuthData(): void {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
  console.log('🧹 Cleared authentication data from localStorage');
}

/**
 * Check if user appears to be logged in based on localStorage
 */
export function hasStoredAuth(): boolean {
  if (typeof window === 'undefined') return false;
  
  const token = localStorage.getItem('authToken');
  const user = localStorage.getItem('user');
  
  return !!(token && user);
}

/**
 * Get stored auth token
 */
export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('authToken');
}

/**
 * Get stored user data
 */
export function getStoredUser(): any | null {
  if (typeof window === 'undefined') return null;
  
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  
  try {
    return JSON.parse(userStr);
  } catch {
    console.warn('⚠️ Invalid user data in localStorage, clearing...');
    clearAuthData();
    return null;
  }
}

/**
 * Validate token format (basic JWT structure check)
 */
export function isValidTokenFormat(token: string): boolean {
  if (!token) return false;
  
  // JWT should have 3 parts separated by dots
  const parts = token.split('.');
  return parts.length === 3;
}

/**
 * Check if token is expired (client-side check only)
 */
export function isTokenExpired(token: string): boolean {
  if (!isValidTokenFormat(token)) return true;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const now = Math.floor(Date.now() / 1000);
    return payload.exp && payload.exp < now;
  } catch {
    return true;
  }
}