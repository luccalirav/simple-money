import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const COOKIE_PERFIL = "perfil_ativo";

export async function exigirSessao() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/entrar");
  return session;
}

// Use em toda página/ação que mexe em dados de um perfil
export async function exigirPerfilAtivo() {
  const session = await exigirSessao();
  const id = (await cookies()).get(COOKIE_PERFIL)?.value;
  if (!id) redirect("/perfis");

  // O userId na consulta impede usar um perfil que não seja seu
  const perfil = await prisma.profile.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!perfil) redirect("/perfis");

  return { session, perfil };
}