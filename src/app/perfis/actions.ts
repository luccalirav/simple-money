"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CORES } from "@/lib/cores";
import { COOKIE_PERFIL, exigirSessao } from "@/lib/sessao";

export async function selecionarPerfil(formData: FormData) {
  const session = await exigirSessao();
  const id = String(formData.get("perfilId") ?? "");

  const perfil = await prisma.profile.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!perfil) redirect("/perfis");

  (await cookies()).set(COOKIE_PERFIL, perfil.id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
  redirect("/");
}

export async function criarPerfil(formData: FormData) {
  const session = await exigirSessao();
  const nome = String(formData.get("nome") ?? "").trim();
  const cor = String(formData.get("cor") ?? "");

  if (!nome || nome.length > 40) redirect("/perfis");

  await prisma.profile.create({
    data: {
      userId: session.user.id,
      name: nome,
      color: CORES.includes(cor) ? cor : CORES[0],
    },
  });
  redirect("/perfis");
}