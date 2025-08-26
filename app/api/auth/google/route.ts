import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Redirect to the backend Google OAuth endpoint
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  return NextResponse.redirect(`${backendUrl}/auth/google`);
}