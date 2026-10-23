import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { BotaoSair } from "./botao-sair";

export default async function Home() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/entrar");
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-4 p-6">
      <h1 className="text-2xl font-semibold">Olá, {session.user.name}!</h1>
      <p className="text-sm text-gray-600">Você está logado. Em breve: escolha de perfil.</p>
      <BotaoSair />
    </main>
  );
}