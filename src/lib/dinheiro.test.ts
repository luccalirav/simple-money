import { describe, expect, it } from "vitest";
import { formatarCentavos, reaisParaCentavos } from "./dinheiro";

describe("reaisParaCentavos", () => {
  it.each([
    ["1.250,50", 125050],
    ["1250,5", 125050],
    ["R$ 10", 1000],
    ["0,99", 99],
    ["-30,00", -3000],
    ["1.000", 100000],
    ["0", 0],
  ])("converte %s", (entrada, esperado) => {
    expect(reaisParaCentavos(entrada)).toBe(esperado);
  });

  it.each(["", "abc", "1,234", "1.25", "12,", ",50", "1..000", "99999999999"])(
    "rejeita %j",
    (entrada) => {
      expect(reaisParaCentavos(entrada)).toBeNull();
    },
  );
});

describe("formatarCentavos", () => {
  it("formata em reais", () => {
    expect(formatarCentavos(125050).replace(/\u00a0/g, " ")).toBe("R$ 1.250,50");
  });
});