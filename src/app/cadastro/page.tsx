"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";

export default function CadastroPage() {
  const router = useRouter();
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function enviar(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setErro("");
    setCarregando(true);
    const dados = new FormData(e.currentTarget);

    const { error } = await authClient.signUp.email({
      name: String(dados.get("nome")),
      email: String(dados.get("email")),
      password: String(dados.get("senha")),
    });

    setCarregando(false);
    if (error) {
      setErro(error.message ?? "Não foi possível criar a conta.");
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-4 p-6">
      <h1 className="text-2xl font-semibold">Criar conta</h1>
      <form onSubmit={enviar} className="flex flex-col gap-3">
        <input name="nome" placeholder="Seu nome" required className="rounded border p-2" />
        <input name="email" type="email" placeholder="Email" required className="rounded border p-2" />
        <input
          name="senha"
          type="password"
          placeholder="Senha (mínimo 10 caracteres)"
          minLength={10}
          required
          className="rounded border p-2"
        />
        {erro && <p className="text-sm text-red-600">{erro}</p>}
        <button disabled={carregando} className="rounded bg-black p-2 text-white disabled:opacity-50">
          {carregando ? "Criando..." : "Criar conta"}
        </button>
      </form>
      <Link href="/entrar" className="text-sm underline">Já tenho conta</Link>
    </main>
  );
}