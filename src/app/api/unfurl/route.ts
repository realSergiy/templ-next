import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

const parseOGTags = (html: string) => {
  const ogTitle = (/<meta\s+property=["']og:title["']\s+content=["']([^"']+)["']/i.exec(html))?.[1];
  const ogDescription = (/<meta\s+property=["']og:description["']\s+content=["']([^"']+)["']/i.exec(html))?.[1];
  const ogImage = (/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i.exec(html))?.[1];

  const title = ogTitle || (/<title>([^<]+)<\/title>/i.exec(html))?.[1] || '';
  const description =
    ogDescription ||
    (/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i.exec(html))?.[1] ||
    '';

  return {
    title: title.slice(0, 100),
    description: description.slice(0, 200),
    image: ogImage || null,
  };
};

export async function GET(request: NextRequest) {
  const ip =
    request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
  const { allowed, remaining } = checkRateLimit(ip);

  if (!allowed) {
    return NextResponse.json(
      { error: 'Rate limit exceeded. Please try again later.' },
      {
        status: 429,
        headers: { 'X-RateLimit-Remaining': '0' },
      },
    );
  }

  const url = request.nextUrl.searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 });
  }

  try {
    new URL(url);
  } catch {
    return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
  }

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; RoadmapBot/1.0)',
      },
      signal: AbortSignal.timeout(5000),
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const html = await response.text();
    const ogData = parseOGTags(html);

    return NextResponse.json(ogData, {
      headers: {
        'X-RateLimit-Remaining': remaining.toString(),
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (e) {
    console.error('Error fetching OG data:', e);
    return NextResponse.json(
      {
        title: new URL(url).hostname,
        description: 'Failed to fetch page metadata',
        image: null,
      },
      {
        status: 200,
        headers: {
          'X-RateLimit-Remaining': remaining.toString(),
        },
      },
    );
  }
}
