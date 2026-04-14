import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 1. Defina as rotas que precisam de proteção (usuário logado)
const protectedRoutes = ['/dashboard', '/cards'];

// 2. Defina as rotas exclusivas para visitantes (usuário NÃO logado)
const authRoutes = ['/login', '/signup'];

export function middleware(request: NextRequest) {
    // Busca o token nos cookies da requisição
    // Nota: Lembre-se de nomear seu cookie como 'token' na rota de Login
    const token = request.cookies.get('token')?.value;
    const { pathname } = request.nextUrl;

    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
    const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));

    // Regra A: Usuário sem token tentando acessar página protegida -> Redireciona para o Login
    if (isProtectedRoute && !token) {
        const loginUrl = new URL('/login', request.url);
        return NextResponse.redirect(loginUrl);
    }

    // Regra B: Usuário já logado tentando acessar tela de Login ou Signup -> Redireciona para Dashboard
    if (isAuthRoute && token) {
        const dashboardUrl = new URL('/dashboard', request.url);
        return NextResponse.redirect(dashboardUrl);
    }

    // Se não cair em nenhuma restrição, deixa a navegação seguir normalmente
    return NextResponse.next();
}

// 3. Configuração do Matcher
// Isso evita que o middleware rode desnecessariamente em arquivos estáticos (imagens, CSS, fontes)
export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};