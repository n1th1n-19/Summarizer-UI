'use client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to documents page as default
    router.push('/dashboard/documents');
  }, [router]);

  return null;
}