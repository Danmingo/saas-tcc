import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getAuthenticatedProfile } from "@/lib/auth";

export async function proxy(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Variáveis do Supabase não configuradas.");
  }

  const sessionResponse = new NextResponse();
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    global: {
      fetch: (input, init) => fetch(input, { ...init, cache: "no-store" }),
    },
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value, options }) => {
          request.cookies.set(name, value);
          sessionResponse.cookies.set(name, value, options);
        });
        Object.entries(headers).forEach(([name, value]) => {
          sessionResponse.headers.set(name, value);
        });
      },
    },
  });

  const perfil = await getAuthenticatedProfile(supabase);
  const pathname = request.nextUrl.pathname;
  const papelDaRota =
    pathname === "/professor" || pathname.startsWith("/professor/")
      ? "professor"
      : "aluno";

  let response: NextResponse;

  if (!perfil || perfil.papel !== papelDaRota) {
    const url = request.nextUrl.clone();
    url.pathname = perfil ? `/${perfil.papel}/inicio` : "/";
    url.search = "";
    response = NextResponse.redirect(url);
  } else {
    response = NextResponse.next({ request });
  }

  // Mantém a renovação da sessão inclusive nas respostas de redirecionamento.
  sessionResponse.cookies.getAll().forEach((cookie) => {
    response.cookies.set(cookie);
  });
  sessionResponse.headers.forEach((value, name) => {
    if (name !== "set-cookie") response.headers.set(name, value);
  });
  response.headers.set("Cache-Control", "private, no-store");

  return response;
}

export const config = {
  matcher: ["/professor/:path*", "/aluno/:path*"],
};
