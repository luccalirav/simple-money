"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { reaisParaCentavos } from "@/lib/dinheiro";
import { exigirPerfilAtivo } from "@/lib/sessao";
import { parseData } from "@/lib/transacoes";

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

// "Passa a limpo": cada linha marcada vira uma despesa na conta escolhida
// e sai do rascunho. As demais ficam no caderno.
export async function lancarComoTransacoes(formData: FormData) {
  const { perfil } = await exigirPerfilAtivo();

  const contaId = String(formData.get("contaId") ?? "");
  const data = parseData(String(formData.get("data") ?? ""));
  if (!data) redirect("/rascunho?erro=data");

  const conta = await prisma.bankAccount.findFirst({ where: { id: contaId, profileId: perfil.id } });
  if (!conta) redirect("/rascunho?erro=conta");

  // Só as linhas marcadas (e do perfil ativo, e com valor)
  const ids = formData.getAll("linha").map(String);
  const linhas = await prisma.draftEntry.findMany({
    where: { id: { in: ids }, profileId: perfil.id, amountCents: { gt: 0 } },
  });
  if (linhas.length === 0) redirect("/rascunho?erro=vazio");

  const total = linhas.reduce((soma, l) => soma + l.amountCents, 0);
  await prisma.$transaction([
    prisma.transaction.createMany({
      data: linhas.map((l) => ({
        bankAccountId: conta.id,
        type: "EXPENSE" as const,
        amountCents: l.amountCents,
        description: l.label,
        date: data,
      })),
    }),
    prisma.bankAccount.update({
      where: { id: conta.id },
      data: { balanceCents: { decrement: total } },
    }),
    prisma.draftEntry.deleteMany({ where: { id: { in: linhas.map((l) => l.id) } } }),
  ]);
  redirect("/transacoes");
}
