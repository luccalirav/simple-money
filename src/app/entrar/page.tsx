"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";

export default function EntrarPage() {
  const router = useRouter();
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function enviar(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setErro("");
    setCarregando(true);
    const dados = new FormData(e.currentTarget);

    const { error } = await authClient.signIn.email({
      email: String(dados.get("email")),
      password: String(dados.get("senha")),
    });

    setCarregando(false);
    if (error) {
      setErro(error.message ?? "Email ou senha incorretos.");
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-4 p-6">
      <h1 className="text-2xl font-semibold">Entrar</h1>
      <form onSubmit={enviar} className="flex flex-col gap-3">
        <input name="email" type="email" placeholder="Email" required className="rounded border p-2" />
        <input name="senha" type="password" placeholder="Senha" required className="rounded border p-2" />
        {erro && <p className="text-sm text-red-600">{erro}</p>}
        <button disabled={carregando} className="rounded bg-black p-2 text-white disabled:opacity-50">
          {carregando ? "Entrando..." : "Entrar"}
        </button>
      </form>
      <Link href="/cadastro" className="text-sm underline">Criar conta</Link>
    </main>
  );
}