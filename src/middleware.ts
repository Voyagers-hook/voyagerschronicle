import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

function getProjectRef(): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  return url.match(/https:\/\/([^.]+)\./)?.[1] ?? '';
}

function injectTokenFromHeader(request: NextRequest): void {
  const token = request.headers.get('x-sb-token');
  if (!token) return;
  const hasCookie = request.cookies.getAll().some((c) => c.name.includes('auth-token'));
  if (hasCookie) return;
  request.cookies.set(`sb-${getProjectRef()}-auth-token`, token);
}

function isPreviewRequest(request: NextRequest): boolean {
  // Rocket preview iframe injects this header
  const referer = request.headers.get('referer') ?? '';
  const host = request.headers.get('host') ?? '';
  // Allow bypass when accessed from builtwithrocket.new platform or via ?preview=1
  const isRocketPlatform =
    referer.includes('builtwithrocket.new') ||
    referer.includes('rocket.new') ||
    request.nextUrl.searchParams.get('preview') === '1';
  // Also bypass when the app itself is the host (direct preview URL)
  const isSelfHosted = host.includes('builtwithrocket.new');
  return isRocketPlatform || isSelfHosted;
}

export async function middleware(request: NextRequest) {
  // Skip auth gate entirely in preview/dev mode so all pages are accessible
  if (isPreviewRequest(request)) {
    return NextResponse.next({ request });
  }

  injectTokenFromHeader(request);
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            supabaseResponse.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  const protectedPaths = [
    '/adventure-home', '/card-collection', '/card-opening', '/trading',
    '/quiz', '/leaderboard', '/fun-facts', '/rewards', '/catch-log',
    '/settings', '/admin', '/admin-analytics',
  ];

  const isProtected = protectedPaths.some(p => request.nextUrl.pathname.startsWith(p));

  if (!user && isProtected) {
    const url = request.nextUrl.clone();
    url.pathname = '/login-screen';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
