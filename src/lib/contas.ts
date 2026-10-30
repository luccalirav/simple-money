export const TIPOS_CONTA = {
  CHECKING: "Conta corrente",
  SAVINGS: "Poupança",
  CASH: "Dinheiro",
} as const;

export type TipoConta = keyof typeof TIPOS_CONTA;

export function ehTipoConta(valor: string): valor is TipoConta {
  return Object.keys(TIPOS_CONTA).includes(valor);
}