import { describe, expect, it } from "vitest";
import { efeitoNoSaldo, parseData, situacaoConta } from "./transacoes";

describe("efeitoNoSaldo", () => {
  it("receita soma e despesa subtrai", () => {
    expect(efeitoNoSaldo("INCOME", 500)).toBe(500);
    expect(efeitoNoSaldo("EXPENSE", 500)).toBe(-500);
  });
});

describe("parseData", () => {
  it("aceita datas válidas", () => {
    expect(parseData("2026-11-15")?.toISOString()).toBe("2026-11-15T00:00:00.000Z");
  });
  it.each(["", "15/11/2026", "2026-02-30", "2026-13-01"])("rejeita %s", (t) => {
    expect(parseData(t)).toBeNull();
  });
});

describe("situacaoConta", () => {
  const venc = (t: string) => new Date(`${t}T00:00:00.000Z`);
  it("classifica pela data de vencimento", () => {
    expect(situacaoConta(venc("2026-11-14"), false, "2026-11-15")).toBe("vencida");
    expect(situacaoConta(venc("2026-11-15"), false, "2026-11-15")).toBe("hoje");
    expect(situacaoConta(venc("2026-11-20"), false, "2026-11-15")).toBe("proxima");
    expect(situacaoConta(venc("2026-11-01"), true, "2026-11-15")).toBe("paga");
  });
});
