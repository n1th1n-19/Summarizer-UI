'use client';
import { Box, Typography } from '@mui/material';
import ChatInterface from '@/components/chat/ChatInterface';

export default function ChatPage() {
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Chat with Documents
      </Typography>
      
      <ChatInterface />
    </Box>
  );
}