import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const title = request.nextUrl.searchParams.get('title') || 'Link Preview';
  const domain = request.nextUrl.searchParams.get('domain') || 'example.com';

  const svg = `
    <svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
      <rect width="1200" height="630" fill="#f3f4f6"/>
      <rect x="40" y="40" width="1120" height="550" rx="16" fill="white" stroke="#e5e7eb" stroke-width="2"/>
      
      <g transform="translate(80, 200)">
        <rect width="80" height="80" rx="8" fill="#3b82f6"/>
        <path d="M 30 40 L 50 60 L 70 30" stroke="white" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      </g>
      
      <text x="200" y="240" font-family="system-ui, sans-serif" font-size="48" font-weight="bold" fill="#111827">
        ${title.slice(0, 40)}
      </text>
      
      <text x="200" y="290" font-family="system-ui, sans-serif" font-size="28" fill="#6b7280">
        ${domain}
      </text>
      
      <rect x="80" y="400" width="1040" height="2" fill="#e5e7eb"/>
      
      <text x="80" y="480" font-family="system-ui, sans-serif" font-size="24" fill="#9ca3af">
        Generated preview for ${domain}
      </text>
    </svg>
  `;

  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=86400',
    },
  });
}
