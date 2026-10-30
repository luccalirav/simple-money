// Limite do tipo Int do PostgreSQL (cerca de R$ 21 milhões)
const LIMITE_CENTAVOS = 2_000_000_000;

const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

/** Converte texto como "1.250,50", "R$ 10" ou "-30" em centavos. Retorna null se inválido. */
export function reaisParaCentavos(texto: string): number | null {
  const limpo = texto.replace(/R\$/gi, "").replace(/\s/g, "");
  if (!/^-?(\d{1,3}(\.\d{3})*|\d+)(,\d{1,2})?$/.test(limpo)) return null;

  const negativo = limpo.startsWith("-");
  const [inteiro, decimal = ""] = limpo.replace("-", "").replace(/\./g, "").split(",");
  const centavos = Number(inteiro) * 100 + Number(decimal.padEnd(2, "0"));

  if (centavos > LIMITE_CENTAVOS) return null;
  return negativo && centavos !== 0 ? -centavos : centavos;
}

export function formatarCentavos(centavos: number): string {
  return brl.format(centavos / 100);
}