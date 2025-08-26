'use client';
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { z } from 'zod';

const UserSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  name: z.string(),
  avatarUrl: z.string().nullable(),
  createdAt: z.string(),
});

type User = z.infer<typeof UserSchema>;


interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  loading: boolean;
}

interface AuthContextType extends AuthState {
  logout: () => void;
  updateProfile: (data: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const authReducer = (state: AuthState, action: any): AuthState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        loading: false,
      };
    case 'LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
        loading: false,
      };
    case 'UPDATE_PROFILE':
      return {
        ...state,
        user: state.user ? { ...state.user, ...action.payload } : null,
      };
    default:
      return state;
  }
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, {
    isAuthenticated: false,
    user: null,
    token: null,
    loading: true,
  });

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const user = localStorage.getItem('user');
    
    if (token && user) {
      try {
        const userData = JSON.parse(user);
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: { token, user: userData }
        });
      } catch {
        localStorage.clear();
      }
    }
    dispatch({ type: 'SET_LOADING', payload: false });

    // Listen for auth updates from callback
    const handleAuthUpdate = () => {
      const newToken = localStorage.getItem('authToken');
      const newUser = localStorage.getItem('user');
      
      if (newToken && newUser) {
        try {
          const userData = JSON.parse(newUser);
          dispatch({
            type: 'LOGIN_SUCCESS',
            payload: { token: newToken, user: userData }
          });
        } catch {
          localStorage.clear();
          dispatch({ type: 'LOGOUT' });
        }
      } else {
        // If either token or user is missing, logout
        dispatch({ type: 'LOGOUT' });
      }
    };

    // Listen for localStorage changes (manual token deletion)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'authToken' || e.key === 'user') {
        if (!e.newValue) {
          // Token or user was removed
          dispatch({ type: 'LOGOUT' });
        }
      }
    };

    window.addEventListener('authUpdate', handleAuthUpdate);
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('authUpdate', handleAuthUpdate);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);


  const logout = () => {
    // Clear localStorage first
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    
    // Update state
    dispatch({ type: 'LOGOUT' });
    
    // Trigger auth update event for any listening components
    window.dispatchEvent(new Event('authUpdate'));
  };

  const updateProfile = (data: Partial<User>) => {
    dispatch({ type: 'UPDATE_PROFILE', payload: data });
  };

  return (
    <AuthContext.Provider value={{ ...state, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};