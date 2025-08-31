'use client';
import { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  Paper,
  Avatar,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Stack,
  Divider,
  IconButton,
  Fade,
  Skeleton,
} from '@mui/material';
import {
  Send,
  Plus,
  MessageCircle,
  Bot,
  User,
  FileText,
  Clock,
  ChevronDown,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
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

  // Debug messages state
  useEffect(() => {
    console.log('Messages state updated:', messages.length, messages);
  }, [messages]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Deduplicate messages by ID
  const deduplicateMessages = (messages: Message[]) => {
    return messages.filter((msg, index, arr) => 
      arr.findIndex(m => m.id === msg.id) === index
    );
  };

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
      const fetchedSessions = data.data || [];
      console.log('Fetched sessions:', fetchedSessions);
      setSessions(fetchedSessions);
      
      // Automatically select the first (most recent) session if available
      if (fetchedSessions.length > 0) {
        console.log('Auto-selecting session:', fetchedSessions[0]);
        setCurrentSession(fetchedSessions[0]);
      }
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
    } catch (error) {
      console.error('Error creating session:', error);
    }
  };

  const loadSessionMessages = async (sessionId: number) => {
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
      console.log('Session data:', sessionData);
      console.log('Raw messages from session:', sessionData.messages);
      console.log('Messages array exists?', Array.isArray(sessionData.messages));
      
      // Try different possible message paths in the response
      const rawMessages = sessionData.messages || sessionData.data?.messages || [];
      console.log('Raw messages to process:', rawMessages);
      
      // Transform database messages to UI format
      const transformedMessages: Message[] = [];
      rawMessages.forEach((dbMessage: any) => {
        // Add user message
        if (dbMessage.message) {
          transformedMessages.push({
            id: dbMessage.id * 2, // Ensure unique IDs
            content: dbMessage.message,
            role: 'USER',
            createdAt: dbMessage.createdAt,
          });
        }
        
        // Add AI response
        if (dbMessage.response) {
          transformedMessages.push({
            id: dbMessage.id * 2 + 1, // Ensure unique IDs
            content: dbMessage.response,
            role: 'AI',
            createdAt: dbMessage.createdAt,
          });
        }
      });
      
      const messages = deduplicateMessages(transformedMessages);
      console.log('Transformed messages:', messages);
      setMessages(messages);
    } catch (error) {
      console.error('Error loading session messages:', error);
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
    setMessages((prev) => deduplicateMessages([...prev, userMessage]));

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
      console.log('API response result:', result);
      console.log('userMessage:', result.userMessage);
      console.log('aiResponse:', result.aiResponse);
      
      // Transform the API response to UI format
      const transformedUserMessage: Message = {
        id: result.userMessage?.id || Date.now(),
        content: result.userMessage?.message || result.userMessage?.content,
        role: 'USER',
        createdAt: result.userMessage?.createdAt || new Date().toISOString(),
      };
      console.log('Transformed user message:', transformedUserMessage);
      
      const transformedAIMessage: Message = {
        id: result.aiResponse?.id || Date.now() + 1,
        content: result.aiResponse?.response || result.aiResponse?.content,
        role: 'AI',
        createdAt: result.aiResponse?.createdAt || new Date().toISOString(),
      };
      console.log('Transformed AI message:', transformedAIMessage);
      
      // Replace the temporary user message and add AI response
      setMessages((prev) => deduplicateMessages([
        ...prev.slice(0, -1),
        transformedUserMessage,
        transformedAIMessage
      ]));
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

  useEffect(() => {
    console.log('currentSession changed:', currentSession);
    if (currentSession) {
      console.log('Loading messages for session:', currentSession.id);
      loadSessionMessages(currentSession.id);
    }
  }, [currentSession]);

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {currentSession ? (
        <>
          {/* Messages Area - Claude style centered layout */}
          <Box
            sx={{
              flexGrow: 1,
              overflow: 'auto',
              backgroundColor: '#ffffff',
            }}
          >
            <Box
              sx={{
                maxWidth: '48rem',
                mx: 'auto',
                px: 4,
                py: 6,
              }}
            >
              {messages.length === 0 ? (
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '50vh',
                    textAlign: 'center',
                  }}
                >
                  <Typography 
                    variant="h4" 
                    sx={{ 
                      fontWeight: 600,
                      color: '#0f172a',
                      mb: 2,
                    }}
                  >
                    How can I help you today?
                  </Typography>
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      color: '#64748b',
                      fontSize: '1.125rem',
                      maxWidth: '32rem',
                    }}
                  >
                    Ask me anything about your document. I can help you understand, analyze, and extract insights.
                  </Typography>
                </Box>
              ) : (
                <Stack spacing={6}>
                  {messages.map((message, index) => (
                    <Box key={index}>
                      {/* User Message */}
                      {message.role === 'USER' && (
                        <Box sx={{ mb: 4 }}>
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 2,
                              mb: 2,
                            }}
                          >
                            <Box
                              sx={{
                                width: 24,
                                height: 24,
                                borderRadius: '50%',
                                backgroundColor: '#ab6800',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              <User size={14} color="#ffffff" />
                            </Box>
                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight: 600,
                                color: '#0f172a',
                                fontSize: '0.875rem',
                              }}
                            >
                              You
                            </Typography>
                          </Box>
                          <Typography
                            variant="body1"
                            sx={{
                              color: '#0f172a',
                              fontSize: '1rem',
                              lineHeight: 1.75,
                              whiteSpace: 'pre-wrap',
                            }}
                          >
                            {message.content}
                          </Typography>
                        </Box>
                      )}

                      {/* AI Message */}
                      {message.role === 'AI' && (
                        <Box>
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 2,
                              mb: 2,
                            }}
                          >
                            <Box
                              sx={{
                                width: 24,
                                height: 24,
                                borderRadius: '50%',
                                backgroundColor: '#ab6800',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              <Bot size={14} color="#ffffff" />
                            </Box>
                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight: 600,
                                color: '#0f172a',
                                fontSize: '0.875rem',
                              }}
                            >
                              Claude
                            </Typography>
                          </Box>
                          <Box
                            sx={{
                              color: '#0f172a',
                              fontSize: '1rem',
                              lineHeight: 1.75,
                              '& p': { margin: '0 0 1rem 0' },
                              '& p:last-child': { marginBottom: 0 },
                              '& ul, & ol': { paddingLeft: '1.5rem', margin: '0.5rem 0' },
                              '& li': { marginBottom: '0.25rem' },
                              '& strong': { fontWeight: 600 },
                              '& em': { fontStyle: 'italic' },
                              '& code': { 
                                backgroundColor: '#f1f5f9', 
                                padding: '0.125rem 0.25rem', 
                                borderRadius: '0.25rem',
                                fontFamily: 'monospace',
                                fontSize: '0.875em'
                              },
                              '& pre': { 
                                backgroundColor: '#f1f5f9', 
                                padding: '1rem', 
                                borderRadius: '0.5rem',
                                overflow: 'auto',
                                margin: '1rem 0'
                              },
                              '& h1, & h2, & h3, & h4, & h5, & h6': {
                                fontWeight: 600,
                                marginTop: '1.5rem',
                                marginBottom: '0.5rem'
                              },
                              '& blockquote': {
                                borderLeft: '4px solid #e2e8f0',
                                paddingLeft: '1rem',
                                margin: '1rem 0',
                                fontStyle: 'italic'
                              }
                            }}
                          >
                            <ReactMarkdown>{message.content}</ReactMarkdown>
                          </Box>
                        </Box>
                      )}
                    </Box>
                  ))}
                  
                  {/* Typing indicator */}
                  {sending && (
                    <Box>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 2,
                          mb: 2,
                        }}
                      >
                        <Box
                          sx={{
                            width: 24,
                            height: 24,
                            borderRadius: '50%',
                            backgroundColor: '#ab6800',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Bot size={14} color="#ffffff" />
                        </Box>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 600,
                            color: '#0f172a',
                            fontSize: '0.875rem',
                          }}
                        >
                          Claude
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {[0, 1, 2].map((i) => (
                          <Box
                            key={i}
                            sx={{
                              width: 8,
                              height: 8,
                              borderRadius: '50%',
                              backgroundColor: '#cbd5e1',
                              animation: 'pulse 1.4s ease-in-out infinite',
                              animationDelay: `${i * 0.2}s`,
                              '@keyframes pulse': {
                                '0%, 80%, 100%': {
                                  opacity: 0.3,
                                },
                                '40%': {
                                  opacity: 1,
                                },
                              },
                            }}
                          />
                        ))}
                      </Box>
                    </Box>
                  )}
                  
                  <div ref={messagesEndRef} />
                </Stack>
              )}
            </Box>
          </Box>

          {/* Input Area - Claude style */}
          <Box
            sx={{
              borderTop: '1px solid #e2e8f0',
              backgroundColor: '#ffffff',
              px: 4,
              py: 4,
            }}
          >
            <Box sx={{ maxWidth: '48rem', mx: 'auto' }}>
              <Box
                component="form"
                onSubmit={sendMessage}
                sx={{
                  position: 'relative',
                  border: '1px solid #e2e8f0',
                  borderRadius: 2,
                  backgroundColor: '#ffffff',
                  '&:focus-within': {
                    borderColor: '#ab6800',
                    boxShadow: '0 0 0 3px rgba(171, 104, 0, 0.1)',
                  },
                }}
              >
                <TextField
                  fullWidth
                  multiline
                  maxRows={8}
                  placeholder={
                    selectedDocumentId 
                      ? "Ask a question about this document..." 
                      : "Please select a document first to start chatting"
                  }
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  disabled={sending || !selectedDocumentId}
                  variant="standard"
                  InputProps={{
                    disableUnderline: true,
                    sx: {
                      px: 3,
                      py: 3,
                      fontSize: '1rem',
                      lineHeight: 1.5,
                      '& input': {
                        fontSize: '1rem',
                      },
                    },
                  }}
                  sx={{
                    '& .MuiInputBase-root': {
                      minHeight: 56,
                    },
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey && !sending && selectedDocumentId) {
                      e.preventDefault();
                      sendMessage(e);
                    }
                  }}
                />
                <IconButton
                  type="submit"
                  disabled={!newMessage.trim() || sending || !selectedDocumentId}
                  sx={{
                    position: 'absolute',
                    bottom: 12,
                    right: 12,
                    backgroundColor: '#ab6800',
                    color: '#ffffff',
                    width: 32,
                    height: 32,
                    '&:hover': {
                      backgroundColor: '#92400e',
                    },
                    '&:disabled': {
                      backgroundColor: '#e2e8f0',
                      color: '#94a3b8',
                    },
                  }}
                >
                  <Send size={16} />
                </IconButton>
              </Box>

              {/* Document Selection */}
              <Box sx={{ mt: 3 }}>
                <FormControl size="small" sx={{ minWidth: 200 }}>
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
                {selectedDocumentId && (
                  <Button
                    variant="text"
                    startIcon={<Plus size={16} />}
                    onClick={createSession}
                    sx={{
                      ml: 2,
                      color: '#ab6800',
                      '&:hover': {
                        backgroundColor: '#fef3c7',
                      },
                    }}
                  >
                    New Conversation
                  </Button>
                )}
              </Box>
            </Box>
          </Box>
        </>
      ) : (
        <Box
          sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            p: 4,
          }}
        >
          <Typography 
            variant="h3" 
            sx={{ 
              fontWeight: 600,
              color: '#0f172a',
              mb: 3,
            }}
          >
            Welcome to AI Chat
          </Typography>
          <Typography 
            variant="body1" 
            sx={{ 
              color: '#64748b',
              fontSize: '1.125rem',
              maxWidth: '32rem',
              mb: 4,
            }}
          >
            Select a document and start a conversation to chat with AI about your content.
          </Typography>
          
          <FormControl sx={{ minWidth: 300, mb: 3 }}>
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
          
          {selectedDocumentId && (
            <Button
              variant="contained"
              startIcon={<Plus size={20} />}
              onClick={createSession}
              sx={{
                backgroundColor: '#ab6800',
                '&:hover': {
                  backgroundColor: '#92400e',
                },
              }}
            >
              Start New Conversation
            </Button>
          )}
        </Box>
      )}
    </Box>
  );
}