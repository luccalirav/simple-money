import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatarCentavos } from "@/lib/dinheiro";
import { exigirPerfilAtivo } from "@/lib/sessao";
import { TIPOS_TRANSACAO, formatarData, hojeISO } from "@/lib/transacoes";
import { criarTransacao, excluirTransacao } from "./actions";

const ERROS = new Map([
  ["tipo", "Tipo inválido."],
  ["descricao", "Informe uma descrição (até 100 caracteres)."],
  ["valor", "Valor inválido. Use o formato 150,00 (maior que zero)."],
  ["data", "Data inválida."],
  ["conta", "Conta não encontrada."],
]);

export default async function TransacoesPage({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string }>;
}) {
  const { perfil } = await exigirPerfilAtivo();
  const { erro } = await searchParams;
  const mensagemErro = erro ? ERROS.get(erro) : undefined;

  const [contas, transacoes] = await Promise.all([
    prisma.bankAccount.findMany({ where: { profileId: perfil.id }, orderBy: { createdAt: "asc" } }),
    prisma.transaction.findMany({
      where: { bankAccount: { profileId: perfil.id } },
      include: { bankAccount: true },
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
      take: 50,
    }),
  ]);

  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Transações de {perfil.name}</h1>
        <Link href="/" className="text-sm underline">Voltar</Link>
      </div>

      {mensagemErro && <p className="text-sm text-red-600">{mensagemErro}</p>}

      {contas.length === 0 ? (
        <p className="text-sm text-gray-600">
          Cadastre uma <Link href="/contas" className="underline">conta bancária</Link> antes de lançar transações.
        </p>
      ) : (
        <form action={criarTransacao} className="flex flex-col gap-3 rounded border p-4">
          <h2 className="font-medium">Nova transação</h2>
          <select name="tipo" defaultValue="EXPENSE" className="rounded border p-2">
            {Object.entries(TIPOS_TRANSACAO).map(([valor, rotulo]) => (
              <option key={valor} value={valor}>{rotulo}</option>
            ))}
          </select>
          <select name="contaId" className="rounded border p-2">
            {contas.map((c) => (
              <option key={c.id} value={c.id}>{c.bankName}{c.nickname ? ` · ${c.nickname}` : ""}</option>
            ))}
          </select>
          <input name="descricao" placeholder="Descrição (ex.: Mercado)" maxLength={100} required className="rounded border p-2" />
          <input name="valor" inputMode="decimal" placeholder="Valor (ex.: 150,00)" required className="rounded border p-2" />
          <input name="data" type="date" defaultValue={hojeISO()} required className="rounded border p-2" />
          <button className="rounded bg-black p-2 text-white">Lançar</button>
        </form>
      )}

      <ul className="flex flex-col gap-2">
        {transacoes.length === 0 && <li className="text-sm text-gray-600">Nenhuma transação ainda.</li>}
        {transacoes.map((t) => (
          <li key={t.id} className="flex items-center justify-between gap-2 rounded border p-3">
            <div>
              <p className="font-medium">{t.description}</p>
              <p className="text-xs text-gray-500">
                {formatarData(t.date)} · {t.bankAccount.bankName}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <p className={t.type === "EXPENSE" ? "font-semibold text-red-600" : "font-semibold text-green-700"}>
                {t.type === "EXPENSE" ? "−" : "+"}
                {formatarCentavos(t.amountCents)}
              </p>
              <form action={excluirTransacao}>
                <input type="hidden" name="transacaoId" value={t.id} />
                <button className="rounded border px-2 text-sm text-red-600">Excluir</button>
              </form>
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
