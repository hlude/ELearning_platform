// Example for Next.js middleware.ts or API response headers
import { NextResponse } from 'next/server';
import type { NextRequest } from 'request'; // or 'next/server'

export function middleware(request: NextRequest) {
  const origin = request.headers.get('origin') || '';
  
  // Allow Lovable preview/production domains and local development
  const allowedOrigins = [
    'https://id-preview--[YOUR-LOVABLE-PROJECT-ID].lovable.app', // Replace with your exact Lovable preview URL domain
    'https://lovable.dev',
    'http://localhost:5173',
    'http://localhost:3000'
  ];

  const response = NextResponse.next();

  // If the incoming origin matches or you want a blanket wildcard for preview testing:
  response.headers.set('Access-Control-Allow-Origin', '*'); // Or use dynamic check for strict security
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (request.method === 'OPTIONS') {
    return new NextResponse(null, { status: 204, headers: response.headers });
  }

  return response;
}

export const config = {
  matcher: '/api/:path*',
};