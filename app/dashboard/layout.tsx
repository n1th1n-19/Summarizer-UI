'use client';
import {
  Box,
  IconButton,
  Menu,
  MenuItem,
  Typography,
  Button,
} from '@mui/material';
import {
  MessageSquare,
  Menu as MenuIcon,
  Plus,
  Settings,
  LogOut,
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import ErrorBoundary from '@/components/ErrorBoundary';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
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
    router.push('/login');
  };

  return (
    <ProtectedRoute>
      <ErrorBoundary>
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
          {/* Claude-style Top Header */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              px: 3,
              py: 2,
              borderBottom: '1px solid #e2e8f0',
              backgroundColor: '#ffffff',
            }}
          >
            {/* Left side - Logo/Title */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <IconButton
                onClick={() => setMenuOpen(!menuOpen)}
                sx={{ color: '#64748b' }}
              >
                <MenuIcon size={20} />
              </IconButton>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  color: '#0f172a',
                  fontSize: '1.125rem',
                }}
              >
                AI Summarizer
              </Typography>
            </Box>

            {/* Right side - User menu */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Button
                variant="outlined"
                startIcon={<Plus size={16} />}
                onClick={() => router.push('/dashboard/upload')}
                sx={{
                  borderColor: '#e2e8f0',
                  color: '#0f172a',
                  '&:hover': {
                    borderColor: '#ab6800',
                    backgroundColor: '#fef3c7',
                  },
                }}
              >
                New Document
              </Button>
              
              <IconButton onClick={handleMenu} sx={{ color: '#64748b' }}>
                <Settings size={20} />
              </IconButton>

              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                PaperProps={{
                  sx: {
                    mt: 1,
                    minWidth: 200,
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    borderRadius: 2,
                  },
                }}
              >
                <Box sx={{ px: 3, py: 2, borderBottom: '1px solid #e2e8f0' }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {user?.name}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.75rem' }}>
                    {user?.email}
                  </Typography>
                </Box>
                <MenuItem onClick={() => router.push('/dashboard/settings')} sx={{ py: 2 }}>
                  <Settings size={16} style={{ marginRight: 12 }} />
                  Settings
                </MenuItem>
                <MenuItem onClick={handleLogout} sx={{ py: 2 }}>
                  <LogOut size={16} style={{ marginRight: 12 }} />
                  Log out
                </MenuItem>
              </Menu>
            </Box>
          </Box>

          {/* Main Content Area - Claude-style centered layout */}
          <Box
            component="main"
            sx={{
              flexGrow: 1,
              backgroundColor: '#ffffff',
              overflow: 'auto',
              position: 'relative',
            }}
          >
            {children}
          </Box>

          {/* Simple Side Navigation Drawer */}
          {menuOpen && (
            <Box
              sx={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                zIndex: 1200,
              }}
              onClick={() => setMenuOpen(false)}
            >
              <Box
                sx={{
                  width: 280,
                  height: '100%',
                  backgroundColor: '#ffffff',
                  borderRight: '1px solid #e2e8f0',
                  p: 3,
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                  Navigation
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {[
                    { title: 'Home', path: '/dashboard' },
                    { title: 'Documents', path: '/dashboard/documents' },
                    { title: 'Chat', path: '/dashboard/chat' },
                    { title: 'Search', path: '/dashboard/search' },
                    { title: 'Upload', path: '/dashboard/upload' },
                  ].map((item) => (
                    <Button
                      key={item.title}
                      variant={pathname === item.path ? 'contained' : 'text'}
                      onClick={() => {
                        router.push(item.path);
                        setMenuOpen(false);
                      }}
                      sx={{
                        justifyContent: 'flex-start',
                        py: 1.5,
                        px: 2,
                        color: pathname === item.path ? '#ffffff' : '#0f172a',
                        backgroundColor: pathname === item.path ? '#ab6800' : 'transparent',
                        '&:hover': {
                          backgroundColor: pathname === item.path ? '#92400e' : '#f8fafc',
                        },
                      }}
                    >
                      {item.title}
                    </Button>
                  ))}
                </Box>
              </Box>
            </Box>
          )}
        </Box>
      </ErrorBoundary>
    </ProtectedRoute>
  );
}