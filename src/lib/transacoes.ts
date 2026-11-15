export const TIPOS_TRANSACAO = {
  INCOME: "Receita",
  EXPENSE: "Despesa",
} as const;

export type TipoTransacao = keyof typeof TIPOS_TRANSACAO;

export function ehTipoTransacao(valor: string): valor is TipoTransacao {
  return Object.keys(TIPOS_TRANSACAO).includes(valor);
}

/** Quanto a transação altera o saldo da conta (receita soma, despesa subtrai). */
export function efeitoNoSaldo(tipo: TipoTransacao, centavos: number): number {
  return tipo === "INCOME" ? centavos : -centavos;
}

/** Converte "2026-11-15" (input type=date) em Date UTC. Retorna null se inválida. */
export function parseData(texto: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(texto)) return null;
  const data = new Date(`${texto}T00:00:00.000Z`);
  if (Number.isNaN(data.getTime()) || data.toISOString().slice(0, 10) !== texto) return null;
  return data;
}

export function formatarData(data: Date): string {
  return data.toLocaleDateString("pt-BR", { timeZone: "UTC" });
}

export function hojeISO(): string {
  return new Date().toLocaleDateString("sv-SE"); // AAAA-MM-DD no fuso local
}

export type SituacaoConta = "paga" | "vencida" | "hoje" | "proxima";

/** Situação de uma conta a pagar em relação a hoje (datas em AAAA-MM-DD). */
export function situacaoConta(vencimento: Date, paga: boolean, hoje: string = hojeISO()): SituacaoConta {
  if (paga) return "paga";
  const venc = vencimento.toISOString().slice(0, 10);
  if (venc < hoje) return "vencida";
  if (venc === hoje) return "hoje";
  return "proxima";
}
