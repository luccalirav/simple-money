import Link from "next/link";
import { exigirPerfilAtivo } from "@/lib/sessao";
import { BotaoSair } from "./botao-sair";

export default async function Home() {
  const { perfil } = await exigirPerfilAtivo();

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
      <p className="text-sm text-gray-600">Em breve: contas bancárias deste perfil.</p>
      <div className="flex gap-2">
        <Link href="/perfis" className="rounded border px-3 py-1 text-sm">Trocar perfil</Link>
        <BotaoSair />
      </div>
    </main>
  );
}