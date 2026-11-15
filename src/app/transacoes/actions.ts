"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { reaisParaCentavos } from "@/lib/dinheiro";
import { exigirPerfilAtivo } from "@/lib/sessao";
import { efeitoNoSaldo, ehTipoTransacao, parseData } from "@/lib/transacoes";

export async function criarTransacao(formData: FormData) {
  const { perfil } = await exigirPerfilAtivo();

  const contaId = String(formData.get("contaId") ?? "");
  const tipo = String(formData.get("tipo") ?? "");
  const descricao = String(formData.get("descricao") ?? "").trim();
  const valor = reaisParaCentavos(String(formData.get("valor") ?? ""));
  const data = parseData(String(formData.get("data") ?? ""));

  if (!ehTipoTransacao(tipo)) redirect("/transacoes?erro=tipo");
  if (!descricao || descricao.length > 100) redirect("/transacoes?erro=descricao");
  if (valor === null || valor <= 0) redirect("/transacoes?erro=valor");
  if (!data) redirect("/transacoes?erro=data");

  // Só aceita contas do perfil ativo
  const conta = await prisma.bankAccount.findFirst({ where: { id: contaId, profileId: perfil.id } });
  if (!conta) redirect("/transacoes?erro=conta");

  await prisma.$transaction([
    prisma.transaction.create({
      data: { bankAccountId: conta.id, type: tipo, amountCents: valor, description: descricao, date: data },
    }),
    prisma.bankAccount.update({
      where: { id: conta.id },
      data: { balanceCents: { increment: efeitoNoSaldo(tipo, valor) } },
    }),
  ]);
  redirect("/transacoes");
}

export async function excluirTransacao(formData: FormData) {
  const { perfil } = await exigirPerfilAtivo();

  const id = String(formData.get("transacaoId") ?? "");
  const transacao = await prisma.transaction.findFirst({
    where: { id, bankAccount: { profileId: perfil.id } },
  });
  if (!transacao) redirect("/transacoes");

  // Excluir desfaz o efeito no saldo
  await prisma.$transaction([
    prisma.transaction.delete({ where: { id: transacao.id } }),
    prisma.bankAccount.update({
      where: { id: transacao.bankAccountId },
      data: { balanceCents: { decrement: efeitoNoSaldo(transacao.type, transacao.amountCents) } },
    }),
  ]);
  redirect("/transacoes");
}
