import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { isValidCpf, isValidEvidence, isValidGrade, isValidPassword } from "./domainRules.ts";

describe("regras de domínio", () => {
  it("valida CPF e rejeita sequências repetidas ou dígitos incorretos", () => {
    assert.equal(isValidCpf("529.982.247-25"), true);
    assert.equal(isValidCpf("111.111.111-11"), false);
    assert.equal(isValidCpf("529.982.247-24"), false);
  });

  it("exige senha com maiúscula, minúscula, número, símbolo e 8 caracteres", () => {
    assert.equal(isValidPassword("Horizonte#2026"), true);
    assert.equal(isValidPassword("horizonte2026"), false);
    assert.equal(isValidPassword("Ab1!"), false);
  });

  it("aceita notas no intervalo inclusivo de zero a dez", () => {
    assert.equal(isValidGrade(0), true);
    assert.equal(isValidGrade("7.5"), true);
    assert.equal(isValidGrade(10), true);
    assert.equal(isValidGrade(-0.1), false);
    assert.equal(isValidGrade(10.1), false);
  });

  it("limita anexos a PDF e imagens permitidas de até 5 MB", () => {
    assert.equal(isValidEvidence("application/pdf", 1024), true);
    assert.equal(isValidEvidence("image/png", 5 * 1024 * 1024), true);
    assert.equal(isValidEvidence("text/plain", 1024), false);
    assert.equal(isValidEvidence("image/jpeg", 5 * 1024 * 1024 + 1), false);
  });
});
