# Frontend Implementation Guide
## AI Research Paper Summarizer Backend Integration - Next.js + MUI + Lucide React

This guide provides comprehensive instructions for frontend developers to integrate with the AI Research Paper Summarizer backend API using Next.js, Material-UI (MUI), and Lucide React icons.

## 🚀 Quick Start

### Tech Stack
- **Next.js 14** - React framework with App Router
- **Material-UI (MUI)** - React component library
- **Lucide React** - Beautiful icons
- **Zod** - Schema validation (matching backend)
- **SWR/TanStack Query** - Data fetching and caching

### Backend Configuration
- **Base URL**: `http://localhost:5000` (development)
- **Authentication**: JWT Bearer tokens
- **Content Type**: `application/json` (except file uploads)
- **CORS**: Configured for `http://localhost:3000`

### Installation
```bash
npm install @mui/material @emotion/react @emotion/styled
npm install @mui/icons-material lucide-react
npm install zod swr axios
npm install @mui/x-data-grid @mui/x-date-pickers
```

### MUI Theme Setup
```typescript
// app/theme/theme.ts
'use client';
import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        },
      },
    },
  },
});
```

### Theme Provider Setup
```typescript
// app/providers/ThemeProvider.tsx
'use client';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { theme } from '../theme/theme';

export default function CustomThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
```

## 🔐 Authentication with Next.js & MUI

### Authentication Context
```typescript
// app/contexts/AuthContext.tsx
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
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
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
  }, []);

  const login = async (credentials: LoginCredentials) => {
    const response = await fetch('http://localhost:3001/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Login failed');
    }

    const data = await response.json();
    localStorage.setItem('authToken', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    
    dispatch({
      type: 'LOGIN_SUCCESS',
      payload: data
    });
  };

  const register = async (userData: RegisterData) => {
    const response = await fetch('http://localhost:3001/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Registration failed');
    }

    const data = await response.json();
    localStorage.setItem('authToken', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    
    dispatch({
      type: 'LOGIN_SUCCESS',
      payload: data
    });
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    dispatch({ type: 'LOGOUT' });
  };

  const updateProfile = (data: Partial<User>) => {
    dispatch({ type: 'UPDATE_PROFILE', payload: data });
  };

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, updateProfile }}>
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
```

### Login Component with MUI
```typescript
// app/components/auth/LoginForm.tsx
'use client';
import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  Divider,
  Link,
} from '@mui/material';
import { Google, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { z } from 'zod';

const LoginSchema = z.object({
  email: z.string().email('Please provide a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginData = z.infer<typeof LoginSchema>;

export default function LoginForm() {
  const { login } = useAuth();
  const [formData, setFormData] = useState<LoginData>({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Partial<LoginData>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const validateForm = () => {
    try {
      LoginSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Partial<LoginData> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as keyof LoginData] = err.message;
          }
        });
        setErrors(fieldErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setApiError('');
    
    try {
      await login(formData);
    } catch (error) {
      setApiError(error instanceof Error ? error.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:3001/auth/google';
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        bgcolor: 'background.default',
        p: 2,
      }}
    >
      <Card sx={{ maxWidth: 400, width: '100%' }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom textAlign="center">
            Sign In
          </Typography>
          <Typography variant="body2" color="text.secondary" textAlign="center" mb={3}>
            Access your AI Research Paper Summarizer
          </Typography>

          {apiError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {apiError}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              error={!!errors.email}
              helperText={errors.email}
              margin="normal"
              required
            />
            
            <TextField
              fullWidth
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              error={!!errors.password}
              helperText={errors.password}
              margin="normal"
              required
              InputProps={{
                endAdornment: (
                  <Button
                    onClick={() => setShowPassword(!showPassword)}
                    sx={{ minWidth: 'auto', p: 1 }}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </Button>
                ),
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{ mt: 3, mb: 2 }}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </Button>

            <Divider sx={{ my: 2 }}>
              <Typography variant="body2" color="text.secondary">
                OR
              </Typography>
            </Divider>

            <Button
              fullWidth
              variant="outlined"
              size="large"
              startIcon={<Google size={20} />}
              onClick={handleGoogleLogin}
              sx={{ mb: 2 }}
            >
              Continue with Google
            </Button>

            <Box textAlign="center">
              <Typography variant="body2">
                Don't have an account?{' '}
                <Link href="/register" underline="hover">
                  Sign up
                </Link>
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
```

### Registration Component
```typescript
// app/components/auth/RegisterForm.tsx
'use client';
import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  Divider,
  Link,
} from '@mui/material';
import { Google, Eye, EyeOff, UserCheck } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { z } from 'zod';

const RegisterSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must not exceed 50 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces'),
  email: z.string().email('Please provide a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/\d/, 'Password must contain at least one number')
    .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Password must contain at least one special character'),
});

type RegisterData = z.infer<typeof RegisterSchema>;

export default function RegisterForm() {
  const { register } = useAuth();
  const [formData, setFormData] = useState<RegisterData>({
    name: '',
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Partial<RegisterData>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const validateForm = () => {
    try {
      RegisterSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Partial<RegisterData> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as keyof RegisterData] = err.message;
          }
        });
        setErrors(fieldErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setApiError('');
    
    try {
      await register(formData);
    } catch (error) {
      setApiError(error instanceof Error ? error.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        bgcolor: 'background.default',
        p: 2,
      }}
    >
      <Card sx={{ maxWidth: 400, width: '100%' }}>
        <CardContent sx={{ p: 4 }}>
          <Box textAlign="center" mb={3}>
            <UserCheck size={48} color="#1976d2" />
            <Typography variant="h4" component="h1" gutterBottom>
              Create Account
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Join AI Research Paper Summarizer
            </Typography>
          </Box>

          {apiError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {apiError}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Full Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              error={!!errors.name}
              helperText={errors.name}
              margin="normal"
              required
            />
            
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              error={!!errors.email}
              helperText={errors.email}
              margin="normal"
              required
            />
            
            <TextField
              fullWidth
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              error={!!errors.password}
              helperText={errors.password}
              margin="normal"
              required
              InputProps={{
                endAdornment: (
                  <Button
                    onClick={() => setShowPassword(!showPassword)}
                    sx={{ minWidth: 'auto', p: 1 }}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </Button>
                ),
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{ mt: 3, mb: 2 }}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>

            <Box textAlign="center">
              <Typography variant="body2">
                Already have an account?{' '}
                <Link href="/login" underline="hover">
                  Sign in
                </Link>
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
```

## 📄 Document Management with MUI Data Grid

### Document Upload Component
```typescript
// app/components/documents/DocumentUpload.tsx
'use client';
import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  LinearProgress,
  Chip,
} from '@mui/material';
import { Upload, FileText, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function DocumentUpload({ onUploadSuccess }: { onUploadSuccess?: () => void }) {
  const { token } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);

  const acceptedTypes = ['.pdf', '.docx', '.txt', '.xlsx'];
  const maxSize = 50 * 1024 * 1024; // 50MB

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Validate file size
    if (selectedFile.size > maxSize) {
      setError('File size must be less than 50MB');
      return;
    }

    // Validate file type
    const fileExtension = '.' + selectedFile.name.split('.').pop()?.toLowerCase();
    if (!acceptedTypes.includes(fileExtension)) {
      setError('File type not supported. Please upload PDF, DOCX, TXT, or XLSX files.');
      return;
    }

    setFile(selectedFile);
    setTitle(selectedFile.name.split('.')[0]);
    setError('');
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !token) return;

    setUploading(true);
    setProgress(0);
    setError('');

    const formData = new FormData();
    formData.append('document', file);
    if (title) formData.append('title', title);

    try {
      const response = await fetch('http://localhost:3001/documents/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Upload failed');
      }

      const result = await response.json();
      setFile(null);
      setTitle('');
      onUploadSuccess?.();
      
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  return (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" mb={2}>
          <Upload size={24} style={{ marginRight: 8 }} />
          <Typography variant="h6">Upload Document</Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} icon={<AlertCircle size={20} />}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleUpload}>
          <input
            type="file"
            id="document-upload"
            accept={acceptedTypes.join(',')}
            onChange={handleFileSelect}
            style={{ display: 'none' }}
            disabled={uploading}
          />
          
          <label htmlFor="document-upload">
            <Button
              variant="outlined"
              component="span"
              startIcon={<FileText size={20} />}
              disabled={uploading}
              fullWidth
              sx={{ mb: 2, py: 2 }}
            >
              {file ? file.name : 'Choose File'}
            </Button>
          </label>

          {file && (
            <>
              <Box display="flex" gap={1} mb={2} flexWrap="wrap">
                <Chip 
                  label={`${(file.size / 1024 / 1024).toFixed(2)} MB`} 
                  size="small" 
                  color="primary" 
                />
                <Chip 
                  label={file.type || 'Unknown type'} 
                  size="small" 
                  color="secondary" 
                />
              </Box>

              <TextField
                fullWidth
                label="Document Title (Optional)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={uploading}
                sx={{ mb: 2 }}
                helperText="Leave empty to use filename"
              />

              {uploading && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary" mb={1}>
                    Uploading and processing...
                  </Typography>
                  <LinearProgress />
                </Box>
              )}

              <Button
                type="submit"
                variant="contained"
                disabled={uploading}
                fullWidth
                size="large"
              >
                {uploading ? 'Processing...' : 'Upload Document'}
              </Button>
            </>
          )}
        </Box>

        <Typography variant="caption" color="text.secondary" mt={2} display="block">
          Supported formats: PDF, DOCX, TXT, XLSX (max 50MB)
        </Typography>
      </CardContent>
    </Card>
  );
}
```

### Document List with MUI Data Grid
```typescript
// app/components/documents/DocumentList.tsx
'use client';
import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import { DataGrid, GridColDef, GridActionsCellItem } from '@mui/x-data-grid';
import {
  MoreVertical,
  Eye,
  Trash2,
  Brain,
  Sparkles,
  Download,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';

interface Document {
  id: number;
  title: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  summary?: string;
  createdAt: string;
  updatedAt: string;
}

export default function DocumentList({ refreshTrigger }: { refreshTrigger?: number }) {
  const { token } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });
  const [rowCount, setRowCount] = useState(0);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; document?: Document }>({
    open: false,
  });

  const fetchDocuments = async () => {
    if (!token) return;

    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:3001/documents?page=${paginationModel.page + 1}&limit=${paginationModel.pageSize}&sortBy=createdAt&sortOrder=desc`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) throw new Error('Failed to fetch documents');

      const data = await response.json();
      setDocuments(data.data);
      setRowCount(data.pagination.total);
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [paginationModel, token, refreshTrigger]);

  const handleSummarize = async (documentId: number) => {
    try {
      const response = await fetch(
        `http://localhost:3001/documents/${documentId}/summarize`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) throw new Error('Failed to generate summary');

      await fetchDocuments(); // Refresh list
    } catch (error) {
      console.error('Error generating summary:', error);
    }
  };

  const handleGenerateEmbeddings = async (documentId: number) => {
    try {
      const response = await fetch(
        `http://localhost:3001/documents/${documentId}/embeddings`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) throw new Error('Failed to generate embeddings');

      await fetchDocuments(); // Refresh list
    } catch (error) {
      console.error('Error generating embeddings:', error);
    }
  };

  const handleDelete = async () => {
    if (!deleteDialog.document) return;

    try {
      const response = await fetch(
        `http://localhost:3001/documents/${deleteDialog.document.id}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) throw new Error('Failed to delete document');

      await fetchDocuments(); // Refresh list
    } catch (error) {
      console.error('Error deleting document:', error);
    } finally {
      setDeleteDialog({ open: false });
    }
  };

  const columns: GridColDef[] = [
    {
      field: 'title',
      headerName: 'Title',
      flex: 1,
      minWidth: 200,
    },
    {
      field: 'fileType',
      headerName: 'Type',
      width: 100,
      renderCell: (params) => (
        <Chip
          label={params.value?.split('/')[1]?.toUpperCase() || 'Unknown'}
          size="small"
          variant="outlined"
        />
      ),
    },
    {
      field: 'fileSize',
      headerName: 'Size',
      width: 100,
      renderCell: (params) => `${(params.value / 1024 / 1024).toFixed(2)} MB`,
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (params) => {
        const color = {
          PENDING: 'default',
          PROCESSING: 'info',
          COMPLETED: 'success',
          FAILED: 'error',
        }[params.value] as 'default' | 'info' | 'success' | 'error';

        return <Chip label={params.value} size="small" color={color} />;
      },
    },
    {
      field: 'createdAt',
      headerName: 'Created',
      width: 120,
      renderCell: (params) => formatDistanceToNow(new Date(params.value), { addSuffix: true }),
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 120,
      getActions: (params) => [
        <GridActionsCellItem
          icon={<Eye size={18} />}
          label="View"
          onClick={() => {
            // Navigate to document detail page
            window.open(`/documents/${params.row.id}`, '_blank');
          }}
        />,
        <GridActionsCellItem
          icon={<Brain size={18} />}
          label="Summarize"
          onClick={() => handleSummarize(params.row.id)}
          disabled={!params.row.extractedText}
        />,
        <GridActionsCellItem
          icon={<Sparkles size={18} />}
          label="Generate Embeddings"
          onClick={() => handleGenerateEmbeddings(params.row.id)}
          disabled={!params.row.extractedText}
        />,
        <GridActionsCellItem
          icon={<Trash2 size={18} />}
          label="Delete"
          onClick={() => setDeleteDialog({ open: true, document: params.row })}
        />,
      ],
    },
  ];

  return (
    <>
      <Card>
        <CardContent>
          <Box display="flex" justifyContent="between" alignItems="center" mb={2}>
            <Typography variant="h6">Your Documents</Typography>
            <Button onClick={fetchDocuments} variant="outlined" size="small">
              Refresh
            </Button>
          </Box>

          <DataGrid
            rows={documents}
            columns={columns}
            loading={loading}
            paginationMode="server"
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            rowCount={rowCount}
            pageSizeOptions={[5, 10, 25]}
            disableRowSelectionOnClick
            sx={{ height: 400 }}
          />
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false })}
      >
        <DialogTitle>Delete Document</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete "{deleteDialog.document?.title}"? 
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false })}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
```

## 💬 Chat Interface with MUI

### Chat Component
```typescript
// app/components/chat/ChatInterface.tsx
'use client';
import { useState, useEffect, useRef } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  Drawer,
  AppBar,
  Toolbar,
  IconButton,
  Paper,
  Avatar,
  Chip,
} from '@mui/material';
import {
  Send,
  Plus,
  MessageCircle,
  Bot,
  User,
  Menu as MenuIcon,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface ChatSession {
  id: number;
  sessionName: string;
  documentId: number;
  createdAt: string;
}

interface Message {
  id: number;
  content: string;
  role: 'USER' | 'AI';
  createdAt: string;
}

export default function ChatInterface({ documentId }: { documentId: number }) {
  const { token } = useAuth();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const fetchSessions = async () => {
    if (!token) return;

    try {
      const response = await fetch(
        `http://localhost:3001/chat/sessions?documentId=${documentId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) throw new Error('Failed to fetch sessions');

      const data = await response.json();
      setSessions(data.data);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    }
  };

  const createSession = async () => {
    if (!token) return;

    try {
      const response = await fetch('http://localhost:3001/chat/sessions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documentId,
          title: `Chat ${new Date().toLocaleString()}`,
        }),
      });

      if (!response.ok) throw new Error('Failed to create session');

      const session = await response.json();
      setSessions(prev => [session, ...prev]);
      setCurrentSession(session);
      setMessages([]);
    } catch (error) {
      console.error('Error creating session:', error);
    }
  };

  const loadSession = async (sessionId: number) => {
    if (!token) return;

    try {
      const response = await fetch(
        `http://localhost:3001/chat/sessions/${sessionId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) throw new Error('Failed to load session');

      const sessionData = await response.json();
      setCurrentSession(sessionData);
      setMessages(sessionData.messages || []);
    } catch (error) {
      console.error('Error loading session:', error);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentSession || sending) return;

    const messageContent = newMessage.trim();
    setNewMessage('');
    setSending(true);

    // Add user message immediately
    const userMessage: Message = {
      id: Date.now(),
      content: messageContent,
      role: 'USER',
      createdAt: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMessage]);

    try {
      const response = await fetch(
        `http://localhost:3001/chat/sessions/${currentSession.id}/messages`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ content: messageContent }),
        }
      );

      if (!response.ok) throw new Error('Failed to send message');

      const result = await response.json();
      
      // Replace the temporary user message and add AI response
      setMessages(prev => [
        ...prev.slice(0, -1),
        result.userMessage,
        result.aiResponse
      ]);
    } catch (error) {
      console.error('Error sending message:', error);
      // Remove the temporary message on error
      setMessages(prev => prev.slice(0, -1));
      setNewMessage(messageContent); // Restore message
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, [documentId, token]);

  const sidebar = (
    <Box sx={{ width: 300, p: 2 }}>
      <Button
        fullWidth
        variant="contained"
        startIcon={<Plus size={20} />}
        onClick={createSession}
        sx={{ mb: 2 }}
      >
        New Chat
      </Button>

      <Typography variant="h6" gutterBottom>
        Chat Sessions
      </Typography>

      <List>
        {sessions.map((session) => (
          <ListItem
            key={session.id}
            button
            selected={currentSession?.id === session.id}
            onClick={() => loadSession(session.id)}
            sx={{
              borderRadius: 1,
              mb: 1,
              '&.Mui-selected': {
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                '&:hover': {
                  bgcolor: 'primary.dark',
                },
              },
            }}
          >
            <ListItemText
              primary={session.sessionName}
              secondary={new Date(session.createdAt).toLocaleDateString()}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      {/* Sidebar */}
      <Drawer
        variant="persistent"
        anchor="left"
        open={sidebarOpen}
        sx={{
          '& .MuiDrawer-paper': {
            position: 'relative',
            width: 300,
          },
        }}
      >
        {sidebar}
      </Drawer>

      {/* Main Chat Area */}
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <AppBar position="static" color="default" elevation={1}>
          <Toolbar>
            <IconButton onClick={() => setSidebarOpen(!sidebarOpen)} edge="start">
              <MenuIcon />
            </IconButton>
            <MessageCircle size={24} style={{ marginLeft: 8, marginRight: 8 }} />
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              {currentSession?.sessionName || 'Select a chat session'}
            </Typography>
          </Toolbar>
        </AppBar>

        {/* Messages */}
        <Box
          sx={{
            flexGrow: 1,
            overflow: 'auto',
            p: 2,
            bgcolor: 'background.default',
          }}
        >
          {messages.map((message) => (
            <Box
              key={message.id}
              sx={{
                display: 'flex',
                mb: 2,
                justifyContent: message.role === 'USER' ? 'flex-end' : 'flex-start',
              }}
            >
              {message.role === 'AI' && (
                <Avatar sx={{ mr: 1, bgcolor: 'primary.main' }}>
                  <Bot size={20} />
                </Avatar>
              )}
              
              <Paper
                sx={{
                  p: 2,
                  maxWidth: '70%',
                  bgcolor: message.role === 'USER' ? 'primary.main' : 'background.paper',
                  color: message.role === 'USER' ? 'primary.contrastText' : 'text.primary',
                }}
              >
                <Typography variant="body1">{message.content}</Typography>
                <Typography
                  variant="caption"
                  sx={{
                    opacity: 0.7,
                    display: 'block',
                    mt: 1,
                  }}
                >
                  {new Date(message.createdAt).toLocaleTimeString()}
                </Typography>
              </Paper>

              {message.role === 'USER' && (
                <Avatar sx={{ ml: 1, bgcolor: 'secondary.main' }}>
                  <User size={20} />
                </Avatar>
              )}
            </Box>
          ))}
          
          {sending && (
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar sx={{ mr: 1, bgcolor: 'primary.main' }}>
                <Bot size={20} />
              </Avatar>
              <Chip label="AI is typing..." size="small" />
            </Box>
          )}
          
          <div ref={messagesEndRef} />
        </Box>

        {/* Message Input */}
        {currentSession && (
          <Paper
            component="form"
            onSubmit={sendMessage}
            sx={{
              p: 2,
              display: 'flex',
              alignItems: 'flex-end',
              gap: 1,
              borderRadius: 0,
            }}
          >
            <TextField
              fullWidth
              multiline
              maxRows={4}
              placeholder="Ask a question about this document..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              disabled={sending}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage(e);
                }
              }}
            />
            <Button
              type="submit"
              variant="contained"
              disabled={!newMessage.trim() || sending}
              sx={{ minWidth: 56, height: 56 }}
            >
              <Send size={20} />
            </Button>
          </Paper>
        )}
      </Box>
    </Box>
  );
}
```

## 🔍 Search Component

### Semantic Document Search
```typescript
// app/components/search/DocumentSearch.tsx
'use client';
import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  List,
  ListItem,
  ListItemText,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Search, FileText } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface SearchResult {
  id: number;
  title: string;
  fileName: string;
  similarity: number;
  extractedText: string;
  createdAt: string;
}

export default function DocumentSearch() {
  const { token } = useAuth();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || !token) return;

    setSearching(true);
    setError('');
    setResults([]);

    try {
      const response = await fetch('http://localhost:3001/documents/search', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: query.trim(),
          limit: 10,
        }),
      });

      if (!response.ok) {
        throw new Error('Search failed');
      }

      const data = await response.json();
      setResults(data.results);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Search failed');
    } finally {
      setSearching(false);
    }
  };

  return (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" mb={2}>
          <Search size={24} style={{ marginRight: 8 }} />
          <Typography variant="h6">Semantic Document Search</Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSearch} sx={{ mb: 3 }}>
          <Box display="flex" gap={1}>
            <TextField
              fullWidth
              placeholder="Search documents by meaning, not just keywords..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              disabled={searching}
              multiline
              maxRows={3}
            />
            <Button
              type="submit"
              variant="contained"
              disabled={!query.trim() || searching}
              sx={{ minWidth: 120 }}
            >
              {searching ? <CircularProgress size={20} /> : 'Search'}
            </Button>
          </Box>
        </Box>

        {results.length > 0 && (
          <>
            <Typography variant="h6" gutterBottom>
              Search Results ({results.length})
            </Typography>
            
            <List>
              {results.map((result) => (
                <ListItem
                  key={result.id}
                  sx={{
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 1,
                    mb: 1,
                    flexDirection: 'column',
                    alignItems: 'stretch',
                  }}
                >
                  <Box display="flex" alignItems="center" width="100%" mb={1}>
                    <FileText size={20} style={{ marginRight: 8 }} />
                    <Typography variant="subtitle1" sx={{ flexGrow: 1 }}>
                      {result.title}
                    </Typography>
                    <Chip
                      label={`${(result.similarity * 100).toFixed(1)}% match`}
                      size="small"
                      color="primary"
                    />
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" noWrap>
                    {result.extractedText.substring(0, 200)}...
                  </Typography>
                  
                  <Typography variant="caption" color="text.secondary" mt={1}>
                    Created: {new Date(result.createdAt).toLocaleDateString()}
                  </Typography>
                </ListItem>
              ))}
            </List>
          </>
        )}

        {searching && (
          <Box textAlign="center" py={4}>
            <CircularProgress />
            <Typography variant="body2" color="text.secondary" mt={2}>
              Searching through your documents...
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
```

## 📱 Next.js Layout & Navigation

### Main Layout
```typescript
// app/layout.tsx
import type { Metadata } from 'next';
import CustomThemeProvider from './providers/ThemeProvider';
import { AuthProvider } from './contexts/AuthContext';

export const metadata: Metadata = {
  title: 'AI Research Paper Summarizer',
  description: 'Intelligent document analysis and summarization',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <CustomThemeProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </CustomThemeProvider>
      </body>
    </html>
  );
}
```

### Dashboard Layout
```typescript
// app/dashboard/layout.tsx
'use client';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  FileText,
  MessageCircle,
  Search,
  Upload,
  Settings,
  LogOut,
  User,
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';

const drawerWidth = 240;

const menuItems = [
  { title: 'Documents', icon: FileText, path: '/dashboard/documents' },
  { title: 'Upload', icon: Upload, path: '/dashboard/upload' },
  { title: 'Search', icon: Search, path: '/dashboard/search' },
  { title: 'Chat', icon: MessageCircle, path: '/dashboard/chat' },
  { title: 'Settings', icon: Settings, path: '/dashboard/settings' },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleClose();
  };

  return (
    <Box sx={{ display: 'flex' }}>
      {/* App Bar */}
      <AppBar
        position="fixed"
        sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
      >
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            AI Research Paper Summarizer
          </Typography>
          
          <Box display="flex" alignItems="center">
            <Typography variant="body2" sx={{ mr: 2 }}>
              {user?.name}
            </Typography>
            <IconButton onClick={handleMenu} color="inherit">
              <Avatar sx={{ width: 32, height: 32 }}>
                <User size={18} />
              </Avatar>
            </IconButton>
            
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <MenuItem onClick={() => router.push('/dashboard/profile')}>
                <ListItemIcon>
                  <User size={20} />
                </ListItemIcon>
                Profile
              </MenuItem>
              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <LogOut size={20} />
                </ListItemIcon>
                Logout
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto' }}>
          <List>
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.path;
              
              return (
                <ListItem key={item.title} disablePadding>
                  <ListItemButton
                    selected={isActive}
                    onClick={() => router.push(item.path)}
                  >
                    <ListItemIcon>
                      <Icon size={20} />
                    </ListItemIcon>
                    <ListItemText primary={item.title} />
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>
        </Box>
      </Drawer>

      {/* Main Content */}
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
}
```

## 🛡️ Error Handling & Loading States

### Error Boundary
```typescript
// app/components/ErrorBoundary.tsx
'use client';
import React from 'react';
import { Alert, AlertTitle, Box, Button } from '@mui/material';
import { RefreshCw } from 'lucide-react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends React.Component<
  React.PropsWithChildren<{}>,
  ErrorBoundaryState
> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box sx={{ p: 4 }}>
          <Alert severity="error">
            <AlertTitle>Something went wrong</AlertTitle>
            {this.state.error?.message || 'An unexpected error occurred'}
            <Box mt={2}>
              <Button
                variant="outlined"
                startIcon={<RefreshCw size={16} />}
                onClick={() => window.location.reload()}
              >
                Reload Page
              </Button>
            </Box>
          </Alert>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
```

This comprehensive guide provides everything needed to build a modern Next.js frontend with MUI components and Lucide React icons that seamlessly integrates with your AI Research Paper Summarizer backend API. The components are production-ready with proper error handling, loading states, and responsive design patterns.
