import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatarCentavos } from "@/lib/dinheiro";
import { hojeISO } from "@/lib/transacoes";
import { exigirPerfilAtivo } from "@/lib/sessao";
import { BotaoSair } from "./botao-sair";

export default async function Home() {
  const { perfil } = await exigirPerfilAtivo();

  const { _sum } = await prisma.bankAccount.aggregate({
    where: { profileId: perfil.id },
    _sum: { balanceCents: true },
  });
  const total = _sum.balanceCents ?? 0;

  const vencidas = await prisma.bill.count({
    where: { profileId: perfil.id, paidAt: null, dueDate: { lt: new Date(`${hojeISO()}T00:00:00.000Z`) } },
  });

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-4 p-6">
      <div className="flex items-center gap-3">
        <span
          className="flex h-10 w-10 items-center justify-center rounded-lg font-bold text-white"
          style={{ backgroundColor: perfil.color }}
        >
          {perfil.name.charAt(0).toUpperCase()}
        </span>
        <h1 className="text-xl font-semibold">Perfil: {perfil.name}</h1>
      </div>

      <p>
        Saldo nas contas: <strong>{formatarCentavos(total)}</strong>
      </p>

      {vencidas > 0 && (
        <Link href="/contas-a-pagar" className="rounded bg-red-100 p-2 text-sm text-red-700">
          ⚠ {vencidas} {vencidas === 1 ? "conta vencida" : "contas vencidas"}
        </Link>
      )}

      <div className="flex flex-wrap gap-2">
        <Link href="/contas" className="rounded bg-black px-3 py-1 text-sm text-white">Contas bancárias</Link>
        <Link href="/transacoes" className="rounded bg-black px-3 py-1 text-sm text-white">Transações</Link>
        <Link href="/contas-a-pagar" className="rounded bg-black px-3 py-1 text-sm text-white">Contas a pagar</Link>
        <Link href="/rascunho" className="rounded bg-black px-3 py-1 text-sm text-white">Rascunho</Link>
        <Link href="/perfis" className="rounded border px-3 py-1 text-sm">Trocar perfil</Link>
        <BotaoSair />
      </div>
    </main>
  );
}