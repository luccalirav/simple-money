import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { TIPOS_CONTA } from "@/lib/contas";
import { formatarCentavos } from "@/lib/dinheiro";
import { exigirPerfilAtivo } from "@/lib/sessao";
import { atualizarSaldo, criarConta, excluirConta } from "./actions";

const ERROS = new Map([
  ["nome", "Informe o nome do banco (até 60 caracteres)."],
  ["tipo", "Tipo de conta inválido."],
  ["saldo", "Saldo inválido. Use o formato 1.250,50."],
]);

export default async function ContasPage({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string }>;
}) {
  const { perfil } = await exigirPerfilAtivo();
  const { erro } = await searchParams;
  const mensagemErro = erro ? ERROS.get(erro) : undefined;

  const contas = await prisma.bankAccount.findMany({
    where: { profileId: perfil.id },
    orderBy: { createdAt: "asc" },
  });
  const total = contas.reduce((soma, conta) => soma + conta.balanceCents, 0);

  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Contas de {perfil.name}</h1>
        <Link href="/" className="text-sm underline">Voltar</Link>
      </div>

      <p className="text-lg">
        Total: <strong>{formatarCentavos(total)}</strong>
      </p>

      {mensagemErro && <p className="text-sm text-red-600">{mensagemErro}</p>}

      <ul className="flex flex-col gap-3">
        {contas.length === 0 && <li className="text-sm text-gray-600">Nenhuma conta ainda.</li>}
        {contas.map((conta) => (
          <li key={conta.id} className="flex flex-col gap-2 rounded border p-3">
            <div className="flex items-baseline justify-between">
              <div>
                <p className="font-medium">
                  {conta.bankName}
                  {conta.nickname && <span className="text-gray-600"> · {conta.nickname}</span>}
                </p>
                <p className="text-xs text-gray-500">{TIPOS_CONTA[conta.type]}</p>
              </div>
              <p className={conta.balanceCents < 0 ? "font-semibold text-red-600" : "font-semibold"}>
                {formatarCentavos(conta.balanceCents)}
              </p>
            </div>

            <div className="flex gap-2">
              <form action={atualizarSaldo} className="flex flex-1 gap-2">
                <input type="hidden" name="contaId" value={conta.id} />
                <input name="saldo" inputMode="decimal" placeholder="Novo saldo" required className="w-full rounded border p-1 text-sm" />
                <button className="rounded border px-2 text-sm">Atualizar</button>
              </form>
              <form action={excluirConta}>
                <input type="hidden" name="contaId" value={conta.id} />
                <button className="rounded border px-2 text-sm text-red-600">Excluir</button>
              </form>
            </div>
          </li>
        ))}
      </ul>

      <form action={criarConta} className="flex flex-col gap-3 rounded border p-4">
        <h2 className="font-medium">Adicionar conta</h2>
        <input name="banco" placeholder="Banco (ex.: Nubank)" maxLength={60} required className="rounded border p-2" />
        <input name="apelido" placeholder="Apelido (opcional)" maxLength={60} className="rounded border p-2" />
        <select name="tipo" defaultValue="CHECKING" className="rounded border p-2">
          {Object.entries(TIPOS_CONTA).map(([valor, rotulo]) => (
            <option key={valor} value={valor}>{rotulo}</option>
          ))}
        </select>
        <input name="saldo" inputMode="decimal" placeholder="Saldo atual (ex.: 1.250,50)" className="rounded border p-2" />
        <button className="rounded bg-black p-2 text-white">Adicionar</button>
      </form>
    </main>
  );
}