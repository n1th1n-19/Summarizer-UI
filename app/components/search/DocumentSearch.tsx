'use client';
import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  List,
  ListItem,
  ListItemText,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Search, FileText } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface SearchResult {
  id: number;
  title: string;
  fileName: string;
  similarity: number;
  extractedText: string;
  createdAt: string;
}

export default function DocumentSearch() {
  const { token } = useAuth();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || !token) return;

    setSearching(true);
    setError('');
    setResults([]);

    try {
      const response = await fetch('http://localhost:3001/documents/search', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: query.trim(),
          limit: 10,
        }),
      });

      if (!response.ok) {
        throw new Error('Search failed');
      }

      const data = await response.json();
      setResults(data.results || []);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Search failed');
    } finally {
      setSearching(false);
    }
  };

  return (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" mb={2}>
          <Search size={24} style={{ marginRight: 8 }} />
          <Typography variant="h6">Semantic Document Search</Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSearch} sx={{ mb: 3 }}>
          <Box display="flex" gap={1}>
            <TextField
              fullWidth
              placeholder="Search documents by meaning, not just keywords..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              disabled={searching}
              multiline
              maxRows={3}
            />
            <Button
              type="submit"
              variant="contained"
              disabled={!query.trim() || searching}
              sx={{ minWidth: 120 }}
            >
              {searching ? <CircularProgress size={20} /> : 'Search'}
            </Button>
          </Box>
        </Box>

        {results.length > 0 && (
          <>
            <Typography variant="h6" gutterBottom>
              Search Results ({results.length})
            </Typography>
            
            <List>
              {results.map((result) => (
                <ListItem
                  key={result.id}
                  sx={{
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 1,
                    mb: 1,
                    flexDirection: 'column',
                    alignItems: 'stretch',
                  }}
                >
                  <Box display="flex" alignItems="center" width="100%" mb={1}>
                    <FileText size={20} style={{ marginRight: 8 }} />
                    <Typography variant="subtitle1" sx={{ flexGrow: 1 }}>
                      {result.title}
                    </Typography>
                    <Chip
                      label={`${(result.similarity * 100).toFixed(1)}% match`}
                      size="small"
                      color="primary"
                    />
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" noWrap>
                    {result.extractedText.substring(0, 200)}...
                  </Typography>
                  
                  <Typography variant="caption" color="text.secondary" mt={1}>
                    Created: {new Date(result.createdAt).toLocaleDateString()}
                  </Typography>
                </ListItem>
              ))}
            </List>
          </>
        )}

        {searching && (
          <Box textAlign="center" py={4}>
            <CircularProgress />
            <Typography variant="body2" color="text.secondary" mt={2}>
              Searching through your documents...
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}