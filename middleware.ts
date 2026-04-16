import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 1. Defina as rotas que precisam de proteção (usuário logado)
const protectedRoutes = ['/', '/cards'];

// 2. Defina as rotas exclusivas para visitantes (usuário NÃO logado)
const authRoutes = ['/login', '/signup'];

export function middleware(request: NextRequest) {
    // Busca o token nos cookies da requisição
    // Nota: Certifique-se de que sua rota de API de login salva o JWT em um cookie com este exato nome
    const token = request.cookies.get('token')?.value;
    const { pathname } = request.nextUrl;

    // Debbug
    console.log("Rota acessada:", pathname, "| Token:", token ? "Existe" : "Undefined");

    // Lógica corrigida: Se a rota for '/', exige match exato. Se for outra, usa startsWith.
    const isProtectedRoute = protectedRoutes.some(route => 
        route === '/' ? pathname === '/' : pathname.startsWith(route)
    );

    const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));

    // Regra A: Usuário sem token tentando acessar página protegida -> Redireciona para o Login
    if (isProtectedRoute && !token) {
        const loginUrl = new URL('/login', request.url);
        return NextResponse.redirect(loginUrl);
    }

    // Regra B: Usuário já logado tentando acessar tela de Login ou Signup -> Redireciona para o Dashboard
    if (isAuthRoute && token) {
        const dashboardUrl = new URL('/dashboard', request.url);
        return NextResponse.redirect(dashboardUrl);
    }

    // Se não cair em nenhuma restrição, deixa a navegação seguir normalmente para renderizar a página
    return NextResponse.next();
}

// 3. Configuração do Matcher
// Isso evita que o middleware rode desnecessariamente em arquivos estáticos (imagens, CSS, fontes) ou rotas de API
export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};