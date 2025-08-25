'use client';
import { Box, Typography } from '@mui/material';
import DocumentUpload from '@/components/documents/DocumentUpload';
import { useRouter } from 'next/navigation';

export default function UploadPage() {
  const router = useRouter();

  const handleUploadSuccess = () => {
    // Redirect to documents page after successful upload
    router.push('/dashboard/documents');
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Upload Document
      </Typography>
      
      <Box sx={{ maxWidth: 600 }}>
        <DocumentUpload onUploadSuccess={handleUploadSuccess} />
      </Box>
    </Box>
  );
}