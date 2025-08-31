'use client';
import { useState } from 'react';
import DocumentList from '@/components/documents/DocumentList';

export default function DocumentsPage() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleUploadSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return <DocumentList refreshTrigger={refreshTrigger} />;
}