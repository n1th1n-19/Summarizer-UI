'use client';
import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  LinearProgress,
  Chip,
} from '@mui/material';
import { Upload, FileText, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function DocumentUpload({ onUploadSuccess }: { onUploadSuccess?: () => void }) {
  const { token } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);

  const acceptedTypes = ['.pdf', '.docx', '.txt', '.xlsx'];
  const maxSize = 50 * 1024 * 1024; // 50MB

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Validate file size
    if (selectedFile.size > maxSize) {
      setError('File size must be less than 50MB');
      return;
    }

    // Validate file type
    const fileExtension = '.' + selectedFile.name.split('.').pop()?.toLowerCase();
    if (!acceptedTypes.includes(fileExtension)) {
      setError('File type not supported. Please upload PDF, DOCX, TXT, or XLSX files.');
      return;
    }

    setFile(selectedFile);
    setTitle(selectedFile.name.split('.')[0]);
    setError('');
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !token) return;

    setUploading(true);
    setProgress(0);
    setError('');

    const formData = new FormData();
    formData.append('document', file);
    if (title) formData.append('title', title);

    try {
      const response = await fetch('http://localhost:5000/documents/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Upload failed');
      }

      const result = await response.json();
      setFile(null);
      setTitle('');
      onUploadSuccess?.();
      
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  return (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" mb={2}>
          <Upload size={24} style={{ marginRight: 8 }} />
          <Typography variant="h6">Upload Document</Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} icon={<AlertCircle size={20} />}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleUpload}>
          <input
            type="file"
            id="document-upload"
            accept={acceptedTypes.join(',')}
            onChange={handleFileSelect}
            style={{ display: 'none' }}
            disabled={uploading}
          />
          
          <label htmlFor="document-upload">
            <Button
              variant="outlined"
              component="span"
              startIcon={<FileText size={20} />}
              disabled={uploading}
              fullWidth
              sx={{ mb: 2, py: 2 }}
            >
              {file ? file.name : 'Choose File'}
            </Button>
          </label>

          {file && (
            <>
              <Box display="flex" gap={1} mb={2} flexWrap="wrap">
                <Chip 
                  label={`${(file.size / 1024 / 1024).toFixed(2)} MB`} 
                  size="small" 
                  color="primary" 
                />
                <Chip 
                  label={file.type || 'Unknown type'} 
                  size="small" 
                  color="secondary" 
                />
              </Box>

              <TextField
                fullWidth
                label="Document Title (Optional)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={uploading}
                sx={{ mb: 2 }}
                helperText="Leave empty to use filename"
              />

              {uploading && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary" mb={1}>
                    Uploading and processing...
                  </Typography>
                  <LinearProgress />
                </Box>
              )}

              <Button
                type="submit"
                variant="contained"
                disabled={uploading}
                fullWidth
                size="large"
              >
                {uploading ? 'Processing...' : 'Upload Document'}
              </Button>
            </>
          )}
        </Box>

        <Typography variant="caption" color="text.secondary" mt={2} display="block">
          Supported formats: PDF, DOCX, TXT, XLSX (max 50MB)
        </Typography>
      </CardContent>
    </Card>
  );
}