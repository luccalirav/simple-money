import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatarCentavos } from "@/lib/dinheiro";
import { exigirPerfilAtivo } from "@/lib/sessao";
import { BotaoSair } from "./botao-sair";

export default async function Home() {
  const { perfil } = await exigirPerfilAtivo();

  const { _sum } = await prisma.bankAccount.aggregate({
    where: { profileId: perfil.id },
    _sum: { balanceCents: true },
  });
  const total = _sum.balanceCents ?? 0;

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

      <div className="flex flex-wrap gap-2">
        <Link href="/contas" className="rounded bg-black px-3 py-1 text-sm text-white">Contas bancárias</Link>
        <Link href="/perfis" className="rounded border px-3 py-1 text-sm">Trocar perfil</Link>
        <BotaoSair />
      </div>
    </main>
  );
}