import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const PUBLIC_PATHS = ["/uploads", "/maintenance", "/api", "/auth/signin"];
const ADMIN_PATHS = ["/admin", "/api/admin"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Sempre permite acesso às rotas públicas
  if (PUBLIC_PATHS.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Verifica se é uma rota administrativa
  const isAdminPath = ADMIN_PATHS.some(path => pathname.startsWith(path));

  if (isAdminPath) {
    // Verifica o token do usuário
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

    if (!token) {
      // Redireciona para a página de login se não autenticado
      return NextResponse.redirect(new URL("/auth/signin", request.url));
    }

    // Usuário autenticado e autorizado, permite o acesso
    return NextResponse.next();
  }

  try {
    // Checa configuração do site (exemplo)
    const response = await fetch(new URL("/api/config", request.url));
    if (!response.ok) {
      throw new Error("Failed to fetch site config");
    }

    const config = await response.json();

    // Se o site estiver inativo e não for uma rota pública, redireciona para manutenção
    if (!config?.status) {
      return NextResponse.redirect(new URL("/maintenance", request.url));
    }

    // Site ativo, permite acesso normal
    return NextResponse.next();
  } catch (error) {
    console.error("Erro ao verificar status do site:", error);
    return NextResponse.next();
  }
}

export const config = {
  matcher: ["/((?!api/admin|_next/static|_next/image|favicon.ico|uploads).*)"],
};