import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Protected Routes
const protectedRoutes = ['/', '/cards'];

// Public Routes
const authRoutes = ['/login', '/signup'];

export function middleware(request: NextRequest) {
    // Fetch token in the cookies
    const token = request.cookies.get('token')?.value;
    const { pathname } = request.nextUrl;

    // Debbug
    console.log("Rota acessada:", pathname, "| Token:", token ? "Existe" : "Undefined");

    // Routing
    const isProtectedRoute = protectedRoutes.some(route => 
        route === '/' ? pathname === '/' : pathname.startsWith(route)
    );

    const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));

    // No token in protectd page
    if (isProtectedRoute && !token) {
        const loginUrl = new URL('/login', request.url);
        return NextResponse.redirect(loginUrl);
    }

    // Logen in in login/signin pages
    if (isAuthRoute && token) {
        const dashboardUrl = new URL('/', request.url);
        return NextResponse.redirect(dashboardUrl);
    }

    // No restrictions
    return NextResponse.next();
}

// 3. Configuração do Matcher
// Isso evita que o middleware rode desnecessariamente em arquivos estáticos (imagens, CSS, fontes) ou rotas de API
export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};