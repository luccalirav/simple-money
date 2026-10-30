"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ehTipoConta } from "@/lib/contas";
import { reaisParaCentavos } from "@/lib/dinheiro";
import { exigirPerfilAtivo } from "@/lib/sessao";

export async function criarConta(formData: FormData) {
  const { perfil } = await exigirPerfilAtivo();

  const banco = String(formData.get("banco") ?? "").trim();
  const apelido = String(formData.get("apelido") ?? "").trim();
  const tipo = String(formData.get("tipo") ?? "");
  const saldo = reaisParaCentavos(String(formData.get("saldo") || "0"));

  if (!banco || banco.length > 60 || apelido.length > 60) redirect("/contas?erro=nome");
  if (!ehTipoConta(tipo)) redirect("/contas?erro=tipo");
  if (saldo === null) redirect("/contas?erro=saldo");

  await prisma.bankAccount.create({
    data: {
      profileId: perfil.id,
      bankName: banco,
      nickname: apelido || null,
      type: tipo,
      balanceCents: saldo,
    },
  });
  redirect("/contas");
}

export async function atualizarSaldo(formData: FormData) {
  const { perfil } = await exigirPerfilAtivo();

  const id = String(formData.get("contaId") ?? "");
  const saldo = reaisParaCentavos(String(formData.get("saldo") ?? ""));
  if (saldo === null) redirect("/contas?erro=saldo");

  // profileId na condição: só altera contas do perfil ativo
  await prisma.bankAccount.updateMany({
    where: { id, profileId: perfil.id },
    data: { balanceCents: saldo },
  });
  redirect("/contas");
}

export async function excluirConta(formData: FormData) {
  const { perfil } = await exigirPerfilAtivo();

  const id = String(formData.get("contaId") ?? "");
  await prisma.bankAccount.deleteMany({
    where: { id, profileId: perfil.id },
  });
  redirect("/contas");
}