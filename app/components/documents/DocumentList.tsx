'use client';
import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import { DataGrid, GridColDef, GridActionsCellItem } from '@mui/x-data-grid';
import {
  Eye,
  Trash2,
  Brain,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';

interface Document {
  id: number;
  title: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  summary?: string;
  createdAt: string;
  updatedAt: string;
  extractedText?: string;
}

export default function DocumentList({ refreshTrigger }: { refreshTrigger?: number }) {
  const { token } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });
  const [rowCount, setRowCount] = useState(0);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; document?: Document }>({
    open: false,
  });

  const fetchDocuments = async () => {
    if (!token) return;

    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:3001/documents?page=${paginationModel.page + 1}&limit=${paginationModel.pageSize}&sortBy=createdAt&sortOrder=desc`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) throw new Error('Failed to fetch documents');

      const data = await response.json();
      setDocuments(data.data || []);
      setRowCount(data.pagination?.total || 0);
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [paginationModel, token, refreshTrigger]);

  const handleSummarize = async (documentId: number) => {
    try {
      const response = await fetch(
        `http://localhost:3001/documents/${documentId}/summarize`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) throw new Error('Failed to generate summary');

      await fetchDocuments(); // Refresh list
    } catch (error) {
      console.error('Error generating summary:', error);
    }
  };

  const handleGenerateEmbeddings = async (documentId: number) => {
    try {
      const response = await fetch(
        `http://localhost:3001/documents/${documentId}/embeddings`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) throw new Error('Failed to generate embeddings');

      await fetchDocuments(); // Refresh list
    } catch (error) {
      console.error('Error generating embeddings:', error);
    }
  };

  const handleDelete = async () => {
    if (!deleteDialog.document) return;

    try {
      const response = await fetch(
        `http://localhost:3001/documents/${deleteDialog.document.id}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) throw new Error('Failed to delete document');

      await fetchDocuments(); // Refresh list
    } catch (error) {
      console.error('Error deleting document:', error);
    } finally {
      setDeleteDialog({ open: false });
    }
  };

  const columns: GridColDef<Document>[] = [
    {
      field: 'title',
      headerName: 'Title',
      flex: 1,
      minWidth: 200,
    },
    {
      field: 'fileType',
      headerName: 'Type',
      width: 100,
      renderCell: (params) => (
        <Chip
          label={params.value?.split('/')[1]?.toUpperCase() || 'Unknown'}
          size="small"
          variant="outlined"
        />
      ),
    },
    {
      field: 'fileSize',
      headerName: 'Size',
      width: 100,
      renderCell: (params) => `${(params.value / 1024 / 1024).toFixed(2)} MB`,
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (params) => {
        const statusColors = {
          PENDING: 'default',
          PROCESSING: 'info',
          COMPLETED: 'success',
          FAILED: 'error',
        } as const;
        
        const color = statusColors[params.value as keyof typeof statusColors] || 'default';

        return <Chip label={params.value} size="small" color={color as 'default' | 'info' | 'success' | 'error'} />;
      },
    },
    {
      field: 'createdAt',
      headerName: 'Created',
      width: 120,
      renderCell: (params) => formatDistanceToNow(new Date(params.value), { addSuffix: true }),
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 120,
      getActions: (params) => [
        <GridActionsCellItem
          key="view"
          icon={<Eye size={18} />}
          label="View"
          onClick={() => {
            // Navigate to document detail page
            window.open(`/documents/${params.row.id}`, '_blank');
          }}
        />,
        <GridActionsCellItem
          key="summarize"
          icon={<Brain size={18} />}
          label="Summarize"
          onClick={() => handleSummarize(params.row.id)}
          disabled={!params.row.extractedText}
        />,
        <GridActionsCellItem
          key="embeddings"
          icon={<Sparkles size={18} />}
          label="Generate Embeddings"
          onClick={() => handleGenerateEmbeddings(params.row.id)}
          disabled={!params.row.extractedText}
        />,
        <GridActionsCellItem
          key="delete"
          icon={<Trash2 size={18} />}
          label="Delete"
          onClick={() => setDeleteDialog({ open: true, document: params.row })}
        />,
      ],
    },
  ];

  return (
    <>
      <Card>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">Your Documents</Typography>
            <Button onClick={fetchDocuments} variant="outlined" size="small">
              Refresh
            </Button>
          </Box>

          <DataGrid
            rows={documents}
            columns={columns}
            loading={loading}
            paginationMode="server"
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            rowCount={rowCount}
            pageSizeOptions={[5, 10, 25]}
            disableRowSelectionOnClick
            sx={{ height: 400 }}
          />
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false })}
      >
        <DialogTitle>Delete Document</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete &quot;{deleteDialog.document?.title}&quot;? 
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false })}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}