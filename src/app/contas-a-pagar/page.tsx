import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatarCentavos } from "@/lib/dinheiro";
import { exigirPerfilAtivo } from "@/lib/sessao";
import { formatarData, hojeISO, situacaoConta, type SituacaoConta } from "@/lib/transacoes";
import { alternarPaga, criarContaAPagar, excluirContaAPagar } from "./actions";

const ERROS = new Map([
  ["descricao", "Informe uma descrição (até 100 caracteres)."],
  ["valor", "Valor inválido. Use o formato 150,00 (maior que zero)."],
  ["data", "Data de vencimento inválida."],
]);

const ROTULOS: Record<SituacaoConta, { texto: string; classe: string }> = {
  vencida: { texto: "Vencida", classe: "bg-red-100 text-red-700" },
  hoje: { texto: "Vence hoje", classe: "bg-amber-100 text-amber-800" },
  proxima: { texto: "A vencer", classe: "bg-gray-100 text-gray-700" },
  paga: { texto: "Paga", classe: "bg-green-100 text-green-700" },
};

export default async function ContasAPagarPage({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string }>;
}) {
  const { perfil } = await exigirPerfilAtivo();
  const { erro } = await searchParams;
  const mensagemErro = erro ? ERROS.get(erro) : undefined;

  // Pendentes primeiro (mais antigas no topo), pagas depois
  const todas = await prisma.bill.findMany({
    where: { profileId: perfil.id },
    orderBy: { dueDate: "asc" },
  });
  const hoje = hojeISO();
  const contas = todas.map((c) => ({ ...c, situacao: situacaoConta(c.dueDate, c.paidAt !== null, hoje) }));
  const pendentes = contas.filter((c) => c.situacao !== "paga");
  const pagas = contas.filter((c) => c.situacao === "paga");
  const totalPendente = pendentes.reduce((soma, c) => soma + c.amountCents, 0);

  const linha = (c: (typeof contas)[number]) => (
    <li key={c.id} className="flex items-center justify-between gap-2 rounded border p-3">
      <div>
        <p className={c.situacao === "paga" ? "font-medium line-through text-gray-500" : "font-medium"}>
          {c.description}
        </p>
        <p className="flex items-center gap-2 text-xs text-gray-500">
          Vence em {formatarData(c.dueDate)}
          <span className={`rounded px-1.5 py-0.5 ${ROTULOS[c.situacao].classe}`}>{ROTULOS[c.situacao].texto}</span>
        </p>
      </div>
      <div className="flex items-center gap-2">
        <p className="font-semibold">{formatarCentavos(c.amountCents)}</p>
        <form action={alternarPaga}>
          <input type="hidden" name="contaId" value={c.id} />
          <button className="rounded border px-2 text-sm">{c.situacao === "paga" ? "Desfazer" : "Marcar paga"}</button>
        </form>
        <form action={excluirContaAPagar}>
          <input type="hidden" name="contaId" value={c.id} />
          <button className="rounded border px-2 text-sm text-red-600" aria-label="Excluir">✕</button>
        </form>
      </div>
    </li>
  );

  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Contas a pagar de {perfil.name}</h1>
        <Link href="/" className="text-sm underline">Voltar</Link>
      </div>

      <p className="text-lg">
        Pendente: <strong>{formatarCentavos(totalPendente)}</strong>
      </p>

      {mensagemErro && <p className="text-sm text-red-600">{mensagemErro}</p>}

      <form action={criarContaAPagar} className="flex flex-col gap-3 rounded border p-4">
        <h2 className="font-medium">Nova conta a pagar</h2>
        <input name="descricao" placeholder="Conta (ex.: Luz)" maxLength={100} required className="rounded border p-2" />
        <input name="valor" inputMode="decimal" placeholder="Valor (ex.: 150,00)" required className="rounded border p-2" />
        <label className="flex flex-col gap-1 text-sm text-gray-600">
          Vencimento
          <input name="vencimento" type="date" defaultValue={hoje} required className="rounded border p-2 text-base text-black" />
        </label>
        <button className="rounded bg-black p-2 text-white">Adicionar</button>
      </form>

      <ul className="flex flex-col gap-2">
        {pendentes.length === 0 && <li className="text-sm text-gray-600">Nenhuma conta pendente.</li>}
        {pendentes.map(linha)}
      </ul>

      {pagas.length > 0 && (
        <section className="flex flex-col gap-2">
          <h2 className="text-sm font-medium text-gray-600">Pagas</h2>
          <ul className="flex flex-col gap-2">{pagas.map(linha)}</ul>
        </section>
      )}
    </main>
  );
}
