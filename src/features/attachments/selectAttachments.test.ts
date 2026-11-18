import {
  ATTACHMENT_UNSUPPORTED_TYPE,
  ATTACHMENTS_LIMIT_REACHED,
} from "@discordia/client-shared";

import { attachmentPickerTypes, selectAttachments } from "./selectAttachments";

const MB = 1024 * 1024;

function file(uri: string, mimeType: string, size = MB) {
  return { uri, mimeType, size };
}

describe("attachmentPickerTypes", () => {
  it("sin Premium el selector no ofrece GIF", () => {
    expect(attachmentPickerTypes({ premium: false })).not.toContain(
      "image/gif",
    );
  });

  it("con Premium el selector ofrece GIF", () => {
    expect(attachmentPickerTypes({ premium: true })).toContain("image/gif");
  });
});

describe("selectAttachments en un mensaje directo", () => {
  it("sin Premium rechaza un GIF sin ofrecer nada", () => {
    const gif = file("a.gif", "image/gif");
    expect(selectAttachments([], [gif], { premium: false })).toEqual({
      accepted: [],
      error: ATTACHMENT_UNSUPPORTED_TYPE,
      offer: null,
    });
  });

  it("sin Premium rechaza un PDF de más de 10 MB y ofrece Premium", () => {
    const pdf = file("a.pdf", "application/pdf", 11 * MB);
    expect(selectAttachments([], [pdf], { premium: false })).toEqual({
      accepted: [],
      error: "Pesa 11 MB. El límite es 10 MB.",
      offer: "premium",
    });
  });

  it("con Premium acepta un GIF y un PDF de 40 MB", () => {
    const gif = file("a.gif", "image/gif");
    const pdf = file("a.pdf", "application/pdf", 40 * MB);
    expect(selectAttachments([], [gif, pdf], { premium: true })).toEqual({
      accepted: [gif, pdf],
      error: undefined,
      offer: null,
    });
  });

  it("con Premium rechaza uno de 51 MB sin ofrecer nada y deja pasar los demás", () => {
    const big = file("big.pdf", "application/pdf", 51 * MB);
    const png = file("a.png", "image/png");
    expect(selectAttachments([], [big, png], { premium: true })).toEqual({
      accepted: [png],
      error: "Pesa 51 MB. El límite es 50 MB.",
      offer: null,
    });
  });

  it("ignora los archivos que ya estaban adjuntos", () => {
    const png = file("a.png", "image/png");
    expect(selectAttachments([png], [png], { premium: false })).toEqual({
      accepted: [],
      error: undefined,
      offer: null,
    });
  });

  it("no agrega nada si se pasa del tope por mensaje", () => {
    const current = [1, 2, 3, 4].map((n) => file(`${n}.png`, "image/png"));
    const picked = [file("5.png", "image/png"), file("6.png", "image/png")];
    expect(selectAttachments(current, picked, { premium: true })).toEqual({
      accepted: [],
      error: ATTACHMENTS_LIMIT_REACHED,
      offer: null,
    });
  });
});

describe("selectAttachments en un servidor", () => {
  const pdf18 = file("a.pdf", "application/pdf", 18 * MB);

  it("en nivel 0 o 1 rechaza 18 MB y ofrece el nivel 2", () => {
    for (const serverLevel of [0, 1] as const) {
      expect(
        selectAttachments([], [pdf18], { premium: false, serverLevel }),
      ).toEqual({
        accepted: [],
        error: "Pesa 18 MB. En este servidor el límite es 10 MB.",
        offer: "boost",
      });
    }
  });

  it("en nivel 2 o 3 acepta 18 MB", () => {
    for (const serverLevel of [2, 3] as const) {
      expect(
        selectAttachments([], [pdf18], { premium: false, serverLevel }),
      ).toEqual({ accepted: [pdf18], error: undefined, offer: null });
    }
  });

  it("en nivel 2 rechaza 30 MB sin ofrecer nada", () => {
    const pdf30 = file("b.pdf", "application/pdf", 30 * MB);
    expect(
      selectAttachments([], [pdf30], { premium: false, serverLevel: 2 }),
    ).toEqual({
      accepted: [],
      error: "Pesa 30 MB. En este servidor el límite es 25 MB.",
      offer: null,
    });
  });

  it("con Premium acepta 40 MB en cualquier nivel", () => {
    const pdf40 = file("c.pdf", "application/pdf", 40 * MB);
    expect(
      selectAttachments([], [pdf40], { premium: true, serverLevel: 0 }),
    ).toEqual({ accepted: [pdf40], error: undefined, offer: null });
  });
});
