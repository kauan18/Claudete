import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Rotas públicas com match EXATO (não usar prefixo — senão "/" liberaria tudo)
const PUBLIC_EXACT = ["/", "/login", "/privacidade"];
// Rotas públicas por prefixo. Inclui as APIs anônimas (agendamento, disponibilidade)
// e o cron (que se autentica por CRON_SECRET próprio, não por sessão de usuário).
const PUBLIC_PREFIXES = [
  "/c/",
  "/api/auth",
  "/api/webhooks",
  "/api/appointments",
  "/api/availability",
  "/api/chat",
  "/api/cron",
];

function isPublic(pathname: string) {
  if (PUBLIC_EXACT.includes(pathname)) return true;
  return PUBLIC_PREFIXES.some((p) => pathname.startsWith(p));
}

export default auth(function middleware(req: NextRequest & { auth: { user?: { role?: string } } | null }) {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  // Rotas públicas — libera
  if (isPublic(pathname)) return NextResponse.next();

  // Não autenticado — redireciona para login
  if (!session?.user) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const role = session.user.role;

  // Área super admin — só super_admin
  if (pathname.startsWith("/super-admin") && role !== "super_admin") {
    return NextResponse.redirect(new URL("/admin", req.url));
  }

  // Área admin da clínica
  if (pathname.startsWith("/admin")) {
    if (role === "super_admin") return NextResponse.next();
    if (!["admin_clinica", "recepcao", "dentista"].includes(role ?? "")) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
};
