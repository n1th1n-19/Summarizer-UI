'use client';
import { Button } from '@mui/material';
import { LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

interface LogoutButtonProps {
  variant?: 'contained' | 'outlined' | 'text';
  size?: 'small' | 'medium' | 'large';
  showIcon?: boolean;
}

export default function LogoutButton({ 
  variant = 'outlined', 
  size = 'medium',
  showIcon = true 
}: LogoutButtonProps) {
  const { logout, isAuthenticated } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      // Call backend logout endpoint if user is authenticated
      if (isAuthenticated) {
        const token = localStorage.getItem('authToken');
        if (token) {
          await fetch('http://localhost:5000/auth/logout', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }).catch(() => {
            // Ignore errors - we're logging out anyway
            console.log('Backend logout call failed, continuing with local logout');
          });
        }
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always perform local logout
      logout();
      router.push('/login');
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleLogout}
      startIcon={showIcon ? <LogOut size={18} /> : undefined}
      color="secondary"
    >
      Logout
    </Button>
  );
}