"use client";

import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export function BotaoSair() {
  const router = useRouter();

  return (
    <button
      className="rounded border px-3 py-1 text-sm"
      onClick={() =>
        authClient.signOut({ fetchOptions: { onSuccess: () => router.push("/entrar") } })
      }
    >
      Sair
    </button>
  );
}