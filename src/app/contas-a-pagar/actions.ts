"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { reaisParaCentavos } from "@/lib/dinheiro";
import { exigirPerfilAtivo } from "@/lib/sessao";
import { parseData } from "@/lib/transacoes";

const ROTA = "/contas-a-pagar";

export async function criarContaAPagar(formData: FormData) {
  const { perfil } = await exigirPerfilAtivo();

  const descricao = String(formData.get("descricao") ?? "").trim();
  const valor = reaisParaCentavos(String(formData.get("valor") ?? ""));
  const vencimento = parseData(String(formData.get("vencimento") ?? ""));

  if (!descricao || descricao.length > 100) redirect(`${ROTA}?erro=descricao`);
  if (valor === null || valor <= 0) redirect(`${ROTA}?erro=valor`);
  if (!vencimento) redirect(`${ROTA}?erro=data`);

  await prisma.bill.create({
    data: { profileId: perfil.id, description: descricao, amountCents: valor, dueDate: vencimento },
  });
  redirect(ROTA);
}

export async function alternarPaga(formData: FormData) {
  const { perfil } = await exigirPerfilAtivo();

  const id = String(formData.get("contaId") ?? "");
  const conta = await prisma.bill.findFirst({ where: { id, profileId: perfil.id } });
  if (conta) {
    await prisma.bill.update({
      where: { id: conta.id },
      data: { paidAt: conta.paidAt ? null : new Date() },
    });
  }
  redirect(ROTA);
}

export async function excluirContaAPagar(formData: FormData) {
  const { perfil } = await exigirPerfilAtivo();

  const id = String(formData.get("contaId") ?? "");
  await prisma.bill.deleteMany({ where: { id, profileId: perfil.id } });
  redirect(ROTA);
}
