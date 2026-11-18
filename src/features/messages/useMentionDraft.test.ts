import type { CustomEmojiRef } from "@discordia/client-shared";

import { adjustTextForEmojiDeletion } from "./useMentionDraft";

const MATE: CustomEmojiRef = {
  id: "emoji_mate",
  name: "mate",
  animated: false,
};

const FESTEJO: CustomEmojiRef = {
  id: "emoji_festejo",
  name: "festejo",
  animated: true,
};

describe("adjustTextForEmojiDeletion", () => {
  it("no hace nada si no hay emojis elegidos", () => {
    expect(adjustTextForEmojiDeletion("hola", "hol", [])).toBeNull();
  });

  it("no hace nada al escribir texto (longitud mayor o igual)", () => {
    expect(adjustTextForEmojiDeletion("hola", "hola mundo", [MATE])).toBeNull();
    expect(adjustTextForEmojiDeletion("hola", "hola", [MATE])).toBeNull();
  });

  it("borra :name: completo si se borra el ':' final al final del texto", () => {
    const oldText = "hola :mate:";
    const newText = "hola :mate";
    const result = adjustTextForEmojiDeletion(oldText, newText, [MATE]);

    expect(result).toEqual({
      text: "hola ",
      cursor: 5,
    });
  });

  it("borra el emoji cuando es el unico contenido del mensaje", () => {
    const oldText = ":mate:";
    const newText = ":mate";
    const result = adjustTextForEmojiDeletion(oldText, newText, [MATE]);

    expect(result).toEqual({
      text: "",
      cursor: 0,
    });
  });

  it("borra :name: completo si se borra con texto posterior", () => {
    const oldText = "hola :mate: amigo";
    const newText = "hola :mate amigo";
    const result = adjustTextForEmojiDeletion(oldText, newText, [MATE]);

    expect(result).toEqual({
      text: "hola  amigo",
      cursor: 5,
    });
  });

  it("borra :name: completo si se borra una letra dentro del emoji", () => {
    const oldText = "hola :mate: amigo";
    const newText = "hola :mat: amigo";
    const result = adjustTextForEmojiDeletion(oldText, newText, [MATE]);

    expect(result).toEqual({
      text: "hola  amigo",
      cursor: 5,
    });
  });

  it("no afecta si se borra texto que no toca el emoji", () => {
    const oldText = "hola :mate: amigo";
    const newText = "hol :mate: amigo";
    const result = adjustTextForEmojiDeletion(oldText, newText, [MATE]);

    expect(result).toBeNull();
  });

  it("soporta multiples emojis y solo borra el que se toco", () => {
    const oldText = ":mate: y :festejo:";
    const newText = ":mate: y :festejo";
    const result = adjustTextForEmojiDeletion(oldText, newText, [
      MATE,
      FESTEJO,
    ]);

    expect(result).toEqual({
      text: ":mate: y ",
      cursor: 9,
    });
  });
});
