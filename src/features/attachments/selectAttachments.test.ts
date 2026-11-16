import {
  ATTACHMENT_TOO_LARGE,
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

describe("selectAttachments", () => {
  it("sin Premium rechaza un GIF", () => {
    const gif = file("a.gif", "image/gif");
    expect(selectAttachments([], [gif], { premium: false })).toEqual({
      accepted: [],
      error: ATTACHMENT_UNSUPPORTED_TYPE,
    });
  });

  it("sin Premium rechaza un PDF de más de 10 MB", () => {
    const pdf = file("a.pdf", "application/pdf", 11 * MB);
    expect(selectAttachments([], [pdf], { premium: false })).toEqual({
      accepted: [],
      error: ATTACHMENT_TOO_LARGE,
    });
  });

  it("con Premium acepta un GIF y un PDF de 40 MB", () => {
    const gif = file("a.gif", "image/gif");
    const pdf = file("a.pdf", "application/pdf", 40 * MB);
    expect(selectAttachments([], [gif, pdf], { premium: true })).toEqual({
      accepted: [gif, pdf],
      error: undefined,
    });
  });

  it("con Premium rechaza uno de 51 MB y deja pasar los demás", () => {
    const big = file("big.pdf", "application/pdf", 51 * MB);
    const png = file("a.png", "image/png");
    expect(selectAttachments([], [big, png], { premium: true })).toEqual({
      accepted: [png],
      error: ATTACHMENT_TOO_LARGE,
    });
  });

  it("ignora los archivos que ya estaban adjuntos", () => {
    const png = file("a.png", "image/png");
    expect(selectAttachments([png], [png], { premium: false })).toEqual({
      accepted: [],
      error: undefined,
    });
  });

  it("no agrega nada si se pasa del tope por mensaje", () => {
    const current = [1, 2, 3, 4].map((n) => file(`${n}.png`, "image/png"));
    const picked = [file("5.png", "image/png"), file("6.png", "image/png")];
    expect(selectAttachments(current, picked, { premium: true })).toEqual({
      accepted: [],
      error: ATTACHMENTS_LIMIT_REACHED,
    });
  });
});
