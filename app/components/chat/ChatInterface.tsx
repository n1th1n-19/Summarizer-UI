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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
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

interface Document {
  id: number;
  title: string;
  fileName: string;
}

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

export default function ChatInterface() {
  const { token } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocumentId, setSelectedDocumentId] = useState<number | null>(null);
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

  const fetchDocuments = async () => {
    if (!token) return;

    try {
      const response = await fetch('http://localhost:3001/documents', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Failed to fetch documents');

      const data = await response.json();
      setDocuments(data.data || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
    }
  };

  const fetchSessions = async (documentId: number) => {
    if (!token || !documentId) return;

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
      setSessions(data.data || []);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    }
  };

  const createSession = async () => {
    if (!token || !selectedDocumentId) return;

    try {
      const response = await fetch('http://localhost:3001/chat/sessions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documentId: selectedDocumentId,
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
    fetchDocuments();
  }, [token]);

  useEffect(() => {
    if (selectedDocumentId) {
      fetchSessions(selectedDocumentId);
      setCurrentSession(null);
      setMessages([]);
    }
  }, [selectedDocumentId]);

  const sidebar = (
    <Box sx={{ width: 300, p: 2 }}>
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Select Document</InputLabel>
        <Select
          value={selectedDocumentId || ''}
          label="Select Document"
          onChange={(e) => setSelectedDocumentId(e.target.value as number)}
        >
          {documents.map((doc) => (
            <MenuItem key={doc.id} value={doc.id}>
              {doc.title}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Button
        fullWidth
        variant="contained"
        startIcon={<Plus size={20} />}
        onClick={createSession}
        disabled={!selectedDocumentId}
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
            component="div"
            onClick={() => loadSession(session.id)}
            sx={{
              borderRadius: 1,
              mb: 1,
              cursor: 'pointer',
              bgcolor: currentSession?.id === session.id ? 'primary.main' : 'transparent',
              color: currentSession?.id === session.id ? 'primary.contrastText' : 'inherit',
              '&:hover': {
                bgcolor: currentSession?.id === session.id ? 'primary.dark' : 'action.hover',
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
    <Box sx={{ display: 'flex', height: '70vh' }}>
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