'use client';
import { Box, Typography } from '@mui/material';
import DocumentSearch from '@/components/search/DocumentSearch';

export default function SearchPage() {
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Search Documents
      </Typography>
      
      <DocumentSearch />
    </Box>
  );
}