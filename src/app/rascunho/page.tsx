import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatarCentavos } from "@/lib/dinheiro";
import { exigirPerfilAtivo } from "@/lib/sessao";
import { adicionarLinha, excluirLinha, limparRascunho, salvarLinha } from "./actions";

const ERROS = new Map([
  ["nome", "Informe o nome da linha (até 100 caracteres)."],
  ["valor", "Valor inválido. Use o formato 150,00."],
]);

function emReais(centavos: number) {
  return (centavos / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default async function RascunhoPage({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string }>;
}) {
  const { perfil } = await exigirPerfilAtivo();
  const { erro } = await searchParams;
  const mensagemErro = erro ? ERROS.get(erro) : undefined;

  const linhas = await prisma.draftEntry.findMany({
    where: { profileId: perfil.id },
    orderBy: { createdAt: "asc" },
  });
  const total = linhas.reduce((soma, l) => soma + l.amountCents, 0);

  const comAcumulado = linhas.map((l, i) => ({
    ...l,
    acumulado: linhas.slice(0, i + 1).reduce((soma, x) => soma + x.amountCents, 0),
  }));

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Rascunho de {perfil.name}</h1>
        <Link href="/" className="text-sm underline">Voltar</Link>
      </div>

      {mensagemErro && <p className="text-sm text-red-600">{mensagemErro}</p>}

      <div className="flex flex-col gap-1">
        {comAcumulado.length === 0 && <p className="text-sm text-gray-600">Caderno vazio. Anote a primeira linha abaixo.</p>}
        {comAcumulado.map((l) => (
          <div key={l.id} className="flex items-center gap-2">
            <form action={salvarLinha} className="flex flex-1 items-center gap-2">
              <input type="hidden" name="linhaId" value={l.id} />
              <input name="nome" defaultValue={l.label} maxLength={100} required className="min-w-0 flex-1 rounded border p-1 text-sm" />
              <input name="valor" defaultValue={emReais(l.amountCents)} inputMode="decimal" className="w-28 rounded border p-1 text-right text-sm" />
              <span className="w-28 text-right text-xs text-gray-500" title="Soma até esta linha">
                {formatarCentavos(l.acumulado)}
              </span>
              <button className="rounded border px-2 text-sm">Salvar</button>
            </form>
            <form action={excluirLinha}>
              <input type="hidden" name="linhaId" value={l.id} />
              <button className="rounded border px-2 text-sm text-red-600" aria-label="Excluir linha">✕</button>
            </form>
          </div>
        ))}
      </div>

      <form action={adicionarLinha} className="flex items-center gap-2 border-t pt-4">
        <input name="nome" placeholder="Conta (ex.: Luz)" maxLength={100} required className="min-w-0 flex-1 rounded border p-2 text-sm" />
        <input name="valor" placeholder="Valor" inputMode="decimal" className="w-28 rounded border p-2 text-right text-sm" />
        <button className="rounded bg-black px-3 py-2 text-sm text-white">Adicionar</button>
      </form>

      <div className="flex items-center justify-between border-t pt-4">
        <p className="text-lg">
          Total: <strong>{formatarCentavos(total)}</strong>
        </p>
        {linhas.length > 0 && (
          <form action={limparRascunho}>
            <button className="text-sm text-red-600 underline">Limpar tudo</button>
          </form>
        )}
      </div>
    </main>
  );
}
