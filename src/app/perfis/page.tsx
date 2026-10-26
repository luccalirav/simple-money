import { prisma } from "@/lib/prisma";
import { CORES } from "@/lib/cores";
import { exigirSessao } from "@/lib/sessao";
import { criarPerfil, selecionarPerfil } from "./actions";

export default async function PerfisPage() {
  const session = await exigirSessao();

  let perfis = await prisma.profile.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "asc" },
  });

  // Primeira vez: cria o perfil principal com o nome do usuário
  if (perfis.length === 0) {
    const principal = await prisma.profile.create({
      data: { userId: session.user.id, name: session.user.name, isMain: true },
    });
    perfis = [principal];
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center gap-8 p-6">
      <h1 className="text-center text-2xl font-semibold">Quem está usando?</h1>

      <div className="flex flex-wrap justify-center gap-6">
        {perfis.map((perfil) => (
          <form key={perfil.id} action={selecionarPerfil}>
            <input type="hidden" name="perfilId" value={perfil.id} />
            <button className="flex flex-col items-center gap-2">
              <span
                className="flex h-24 w-24 items-center justify-center rounded-lg text-4xl font-bold text-white"
                style={{ backgroundColor: perfil.color }}
              >
                {perfil.name.charAt(0).toUpperCase()}
              </span>
              <span className="text-sm">{perfil.name}</span>
            </button>
          </form>
        ))}
      </div>

      <form action={criarPerfil} className="mx-auto flex w-full max-w-sm flex-col gap-3 rounded border p-4">
        <h2 className="font-medium">Adicionar perfil</h2>
        <input name="nome" placeholder="Nome (ex.: Mãe)" maxLength={40} required className="rounded border p-2" />
        <div className="flex gap-3">
          {CORES.map((cor, i) => (
            <label key={cor}>
              <input type="radio" name="cor" value={cor} defaultChecked={i === 0} className="peer sr-only" />
              <span
                className="block h-8 w-8 cursor-pointer rounded-full peer-checked:ring-2 peer-checked:ring-black peer-checked:ring-offset-2"
                style={{ backgroundColor: cor }}
              />
            </label>
          ))}
        </div>
        <button className="rounded bg-black p-2 text-white">Adicionar</button>
      </form>
    </main>
  );
}