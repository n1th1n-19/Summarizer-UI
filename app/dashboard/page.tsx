'use client';
import { 
  Box, 
  Typography, 
  Button, 
  Stack,
} from '@mui/material';
import { 
  Upload, 
  FileText, 
  MessageCircle, 
  Plus,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuth();

  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        px: 4,
        backgroundColor: '#ffffff',
      }}
    >
      <Stack spacing={6} alignItems="center" sx={{ maxWidth: '42rem' }}>
        {/* Welcome Message */}
        <Stack spacing={3} alignItems="center">
          <Typography 
            variant="h2" 
            sx={{ 
              fontWeight: 700,
              color: '#0f172a',
              fontSize: '3rem',
              lineHeight: 1.2,
            }}
          >
            Hello, {user?.name?.split(' ')[0] || 'there'}
          </Typography>
          <Typography 
            variant="body1" 
            sx={{ 
              color: '#64748b',
              fontSize: '1.25rem',
              lineHeight: 1.6,
              maxWidth: '36rem',
            }}
          >
            I'm your AI research assistant. Upload documents and I'll help you understand, analyze, and extract insights from your content.
          </Typography>
        </Stack>

        {/* Action Buttons */}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} alignItems="center">
          <Button
            variant="contained"
            size="large"
            startIcon={<Upload size={20} />}
            onClick={() => router.push('/dashboard/upload')}
            sx={{
              backgroundColor: '#ab6800',
              color: '#ffffff',
              fontWeight: 600,
              py: 2,
              px: 4,
              minWidth: 180,
              '&:hover': {
                backgroundColor: '#92400e',
              },
            }}
          >
            Upload Document
          </Button>
          
          <Button
            variant="outlined"
            size="large"
            startIcon={<FileText size={20} />}
            onClick={() => router.push('/dashboard/documents')}
            sx={{
              borderColor: '#e2e8f0',
              color: '#0f172a',
              fontWeight: 500,
              py: 2,
              px: 4,
              minWidth: 180,
              '&:hover': {
                borderColor: '#ab6800',
                backgroundColor: '#fef3c7',
              },
            }}
          >
            Browse Documents
          </Button>
        </Stack>

        {/* Additional Options */}
        <Stack direction="row" spacing={4} sx={{ mt: 4 }}>
          <Button
            variant="text"
            startIcon={<MessageCircle size={18} />}
            onClick={() => router.push('/dashboard/chat')}
            sx={{
              color: '#64748b',
              fontWeight: 500,
              '&:hover': {
                color: '#ab6800',
                backgroundColor: '#fef3c7',
              },
            }}
          >
            Start Chat
          </Button>
          
          <Button
            variant="text"
            startIcon={<Plus size={18} />}
            onClick={() => router.push('/dashboard/upload')}
            sx={{
              color: '#64748b',
              fontWeight: 500,
              '&:hover': {
                color: '#ab6800',
                backgroundColor: '#fef3c7',
              },
            }}
          >
            New Conversation
          </Button>
        </Stack>

        {/* Help Text */}
        <Typography 
          variant="body2" 
          sx={{ 
            color: '#94a3b8',
            fontSize: '0.875rem',
            maxWidth: '28rem',
            mt: 4,
          }}
        >
          Upload PDFs, research papers, or documents to get started. I can summarize content, answer questions, and help you explore ideas.
        </Typography>
      </Stack>
    </Box>
  );
}