"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { reaisParaCentavos } from "@/lib/dinheiro";
import { exigirPerfilAtivo } from "@/lib/sessao";

function lerLinha(formData: FormData) {
  const nome = String(formData.get("nome") ?? "").trim();
  const texto = String(formData.get("valor") ?? "").trim();
  const valor = texto === "" ? 0 : reaisParaCentavos(texto);
  if (!nome || nome.length > 100) redirect("/rascunho?erro=nome");
  if (valor === null) redirect("/rascunho?erro=valor");
  return { nome, valor };
}

export async function adicionarLinha(formData: FormData) {
  const { perfil } = await exigirPerfilAtivo();
  const { nome, valor } = lerLinha(formData);
  await prisma.draftEntry.create({ data: { profileId: perfil.id, label: nome, amountCents: valor } });
  redirect("/rascunho");
}

export async function salvarLinha(formData: FormData) {
  const { perfil } = await exigirPerfilAtivo();
  const id = String(formData.get("linhaId") ?? "");
  const { nome, valor } = lerLinha(formData);
  await prisma.draftEntry.updateMany({
    where: { id, profileId: perfil.id },
    data: { label: nome, amountCents: valor },
  });
  redirect("/rascunho");
}

export async function excluirLinha(formData: FormData) {
  const { perfil } = await exigirPerfilAtivo();
  const id = String(formData.get("linhaId") ?? "");
  await prisma.draftEntry.deleteMany({ where: { id, profileId: perfil.id } });
  redirect("/rascunho");
}

export async function limparRascunho() {
  const { perfil } = await exigirPerfilAtivo();
  await prisma.draftEntry.deleteMany({ where: { profileId: perfil.id } });
  redirect("/rascunho");
}
