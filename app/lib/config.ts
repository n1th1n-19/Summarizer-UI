export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
export const FRONTEND_URL = process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000';

export const API_ENDPOINTS = {
  // Auth
  auth: {
    google: `${API_BASE_URL}/auth/google`,
    profile: `${API_BASE_URL}/auth/profile`,
    logout: `${API_BASE_URL}/auth/logout`,
    verify: `${API_BASE_URL}/auth/verify`,
  },
  // Documents
  documents: {
    list: `${API_BASE_URL}/documents`,
    upload: `${API_BASE_URL}/documents/upload`,
    search: `${API_BASE_URL}/documents/search`,
    get: (id: number) => `${API_BASE_URL}/documents/${id}`,
    delete: (id: number) => `${API_BASE_URL}/documents/${id}`,
    summarize: (id: number) => `${API_BASE_URL}/documents/${id}/summarize`,
    embeddings: (id: number) => `${API_BASE_URL}/documents/${id}/embeddings`,
  },
  // Chat
  chat: {
    sessions: `${API_BASE_URL}/chat/sessions`,
    sessionsByDocument: (documentId: number) => `${API_BASE_URL}/chat/sessions?documentId=${documentId}`,
    session: (id: number) => `${API_BASE_URL}/chat/sessions/${id}`,
    messages: (sessionId: number) => `${API_BASE_URL}/chat/sessions/${sessionId}/messages`,
  },
};