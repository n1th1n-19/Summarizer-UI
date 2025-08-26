'use client';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Box, CircularProgress, Alert, Typography } from '@mui/material';
import { useAuth } from '@/contexts/AuthContext';

export default function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Debug: Log all URL parameters
        const allParams = Array.from(searchParams.entries());
        console.log('All callback parameters:', allParams);
        
        const token = searchParams.get('token');
        const user = searchParams.get('user');
        const errorParam = searchParams.get('error');
        
        // Also check for common OAuth parameter names
        const accessToken = searchParams.get('access_token');
        const userData = searchParams.get('userData');
        const authToken = searchParams.get('authToken');
        
        console.log('Looking for auth data:', { token, user, accessToken, userData, authToken, errorParam });

        if (errorParam) {
          setError(decodeURIComponent(errorParam));
          setLoading(false);
          return;
        }

        // Try different parameter combinations
        const finalToken = token || accessToken || authToken;
        const finalUser = user || userData;

        if (finalToken && finalUser) {
          // Store the token and user data
          const userDataParsed = JSON.parse(decodeURIComponent(finalUser));
          localStorage.setItem('authToken', finalToken);
          localStorage.setItem('user', JSON.stringify(userDataParsed));
          
          // Update auth context
          window.dispatchEvent(new Event('authUpdate'));
          
          // Redirect to dashboard
          router.push('/dashboard');
        } else {
          // Show more detailed error with what we received
          const receivedParams = allParams.map(([key, value]) => `${key}=${value}`).join(', ');
          setError(`Missing authentication data. Received parameters: ${receivedParams || 'none'}`);
          setLoading(false);
        }
      } catch (err) {
        console.error('Auth callback error:', err);
        setError(`Failed to process authentication: ${err instanceof Error ? err.message : 'Unknown error'}`);
        setLoading(false);
      }
    };

    handleCallback();
  }, [searchParams, router]);

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          gap: 2,
        }}
      >
        <CircularProgress />
        <Typography>Completing authentication...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          gap: 2,
          p: 3,
        }}
      >
        <Alert severity="error" sx={{ maxWidth: 400 }}>
          <Typography variant="h6" gutterBottom>
            Authentication Error
          </Typography>
          {error}
        </Alert>
        <Typography 
          variant="body2" 
          color="primary" 
          sx={{ cursor: 'pointer' }}
          onClick={() => router.push('/login')}
        >
          Return to Login
        </Typography>
      </Box>
    );
  }

  return null;
}