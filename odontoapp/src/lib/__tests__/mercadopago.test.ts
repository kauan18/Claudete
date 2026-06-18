import { describe, it, expect, afterEach } from "vitest";
import crypto from "crypto";
import { verifyWebhookSignature, mapPreapprovalStatus } from "@/lib/mercadopago";

const SECRET = "test-secret";

function sign(dataId: string, requestId: string, ts: string, secret = SECRET) {
  const manifest = `id:${dataId};request-id:${requestId};ts:${ts};`;
  return crypto.createHmac("sha256", secret).update(manifest).digest("hex");
}

describe("verifyWebhookSignature", () => {
  const prev = process.env.MP_WEBHOOK_SECRET;
  afterEach(() => {
    if (prev === undefined) delete process.env.MP_WEBHOOK_SECRET;
    else process.env.MP_WEBHOOK_SECRET = prev;
  });

  it("sem segredo configurado não bloqueia (a defesa real é a reconsulta autoritativa)", () => {
    delete process.env.MP_WEBHOOK_SECRET;
    expect(verifyWebhookSignature({ xSignature: "ts=1,v1=abc", xRequestId: "r", dataId: "1" })).toBe(true);
  });

  it("assinatura válida passa", () => {
    process.env.MP_WEBHOOK_SECRET = SECRET;
    const ts = "1742505638683";
    const v1 = sign("12345", "req-1", ts);
    expect(verifyWebhookSignature({ xSignature: `ts=${ts},v1=${v1}`, xRequestId: "req-1", dataId: "12345" })).toBe(true);
  });

  it("assinatura adulterada (segredo errado) falha", () => {
    process.env.MP_WEBHOOK_SECRET = SECRET;
    const ts = "1742505638683";
    const v1 = sign("12345", "req-1", ts, "segredo-errado");
    expect(verifyWebhookSignature({ xSignature: `ts=${ts},v1=${v1}`, xRequestId: "req-1", dataId: "12345" })).toBe(false);
  });

  it("dataId divergente falha (impede replay com outro id)", () => {
    process.env.MP_WEBHOOK_SECRET = SECRET;
    const ts = "1742505638683";
    const v1 = sign("12345", "req-1", ts);
    expect(verifyWebhookSignature({ xSignature: `ts=${ts},v1=${v1}`, xRequestId: "req-1", dataId: "99999" })).toBe(false);
  });

  it("sem header de assinatura falha quando há segredo", () => {
    process.env.MP_WEBHOOK_SECRET = SECRET;
    expect(verifyWebhookSignature({ xSignature: null, xRequestId: "r", dataId: "1" })).toBe(false);
  });
});

describe("mapPreapprovalStatus", () => {
  it("mapeia os status do Mercado Pago", () => {
    expect(mapPreapprovalStatus("authorized")).toBe("authorized");
    expect(mapPreapprovalStatus("paused")).toBe("paused");
    expect(mapPreapprovalStatus("cancelled")).toBe("cancelled");
    expect(mapPreapprovalStatus("pending")).toBe("pending");
    expect(mapPreapprovalStatus("qualquer-outro")).toBe("pending");
  });
});
