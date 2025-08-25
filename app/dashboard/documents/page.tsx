'use client';
import { useState } from 'react';
import { Box, Typography } from '@mui/material';
import DocumentList from '@/components/documents/DocumentList';
import DocumentUpload from '@/components/documents/DocumentUpload';

export default function DocumentsPage() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleUploadSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Documents
      </Typography>
      
      <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
        <Box sx={{ flex: { md: '1 1 33%' } }}>
          <DocumentUpload onUploadSuccess={handleUploadSuccess} />
        </Box>
        <Box sx={{ flex: { md: '1 1 67%' } }}>
          <DocumentList refreshTrigger={refreshTrigger} />
        </Box>
      </Box>
    </Box>
  );
}