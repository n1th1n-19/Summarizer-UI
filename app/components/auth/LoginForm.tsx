'use client';
import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Button,
  Typography,
  Alert,
} from '@mui/material';
import { useRouter } from 'next/navigation';

export default function LoginForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');


  const handleGoogleLogin = () => {
    setLoading(true);
    setApiError('');
    
    try {
      window.location.href = 'http://localhost:5000/auth/google';
    } catch (error) {
      setApiError('Failed to redirect to Google authentication');
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
          <Typography variant="h4" component="h1" gutterBottom textAlign="center">
            Sign In
          </Typography>
          <Typography variant="body2" color="text.secondary" textAlign="center" mb={3}>
            Access your AI Research Paper Summarizer
          </Typography>

          {apiError && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {apiError}
            </Alert>
          )}

          <Button
            fullWidth
            variant="contained"
            size="large"
            onClick={handleGoogleLogin}
            disabled={loading}
            sx={{ mt: 2, py: 1.5 }}
          >
            {loading ? 'Redirecting to Google...' : 'Continue with Google'}
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
}