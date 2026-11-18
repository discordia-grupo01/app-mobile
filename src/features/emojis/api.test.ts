import {
  EMOJI_NAME_INVALID,
  EMOJI_NAME_TAKEN,
  EMOJIS_LOAD_FAILED,
  NO_PERMISSION_EMOJIS,
} from "@discordia/client-shared";

import { apiFetch } from "../../lib/api-client";
import { getToken } from "../../lib/storage";
import {
  deleteServerEmoji,
  fetchCustomEmojis,
  listServerEmojis,
  resolveEmojiImageUrl,
  uploadServerEmoji,
} from "./api";

jest.mock("../../lib/api-client", () => ({
  apiFetch: jest.fn(),
  refreshAccessToken: jest.fn(),
}));

jest.mock("../../lib/storage", () => ({
  getToken: jest.fn(),
}));

jest.mock("expo/fetch", () => ({
  fetch: jest.fn(),
}));

jest.mock("expo-file-system", () => {
  return {
    File: jest.fn().mockImplementation((uri) => new Blob([uri])),
  };
});

const mockedApiFetch = apiFetch as jest.MockedFunction<typeof apiFetch>;
const mockedGetToken = getToken as jest.MockedFunction<typeof getToken>;
// eslint-disable-next-line @typescript-eslint/no-require-imports
const mockedExpoFetch = require("expo/fetch").fetch as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
  mockedGetToken.mockResolvedValue("test-token");
});

describe("resolveEmojiImageUrl", () => {
  it("resuelve urls relativas", () => {
    expect(resolveEmojiImageUrl("/v1/servers/s1/emojis/1/image")).toContain(
      "/v1/servers/s1/emojis/1/image",
    );
  });

  it("devuelve string vacio si es nulo", () => {
    expect(resolveEmojiImageUrl(null)).toBe("");
  });
});

describe("listServerEmojis", () => {
  it("devuelve la pagina si la llamada es exitosa", async () => {
    const page = {
      emojis: [
        {
          id: "e1",
          server_id: "s1",
          name: "mate",
          animated: false,
          image_url: "/emojis/mate.png",
          created_by: "u1",
          created_at: "2026-11-17T20:00:00Z",
        },
      ],
      max_emojis: 50,
    };
    mockedApiFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      data: page,
    });

    const result = await listServerEmojis("s1");
    expect(result).toEqual({ ok: true, page });
    expect(mockedApiFetch).toHaveBeenCalledWith("/v1/servers/s1/emojis", {
      method: "GET",
    });
  });

  it("devuelve error si la llamada falla", async () => {
    mockedApiFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      code: 500,
      message: "Server error",
    });

    const result = await listServerEmojis("s1");
    expect(result).toEqual({ ok: false, message: EMOJIS_LOAD_FAILED });
  });
});

describe("uploadServerEmoji", () => {
  it("sube el emoji exitosamente", async () => {
    const emoji = {
      id: "e1",
      server_id: "s1",
      name: "mate",
      animated: false,
      image_url: "/emojis/mate.png",
      created_by: "u1",
      created_at: "2026-11-17T20:00:00Z",
    };

    mockedExpoFetch.mockResolvedValueOnce({
      status: 201,
      text: async () => JSON.stringify(emoji),
    });

    const result = await uploadServerEmoji("s1", {
      name: "mate",
      uri: "file://path/to/mate.png",
      mimeType: "image/png",
    });

    expect(result).toEqual({ ok: true, emoji });
    expect(mockedExpoFetch).toHaveBeenCalled();
  });

  it("mapea errores por campo cuando el backend devuelve 400 por nombre invalido", async () => {
    mockedExpoFetch.mockResolvedValueOnce({
      status: 400,
      text: async () =>
        JSON.stringify({
          error: {
            code: 400,
            message: "Bad request",
            details: { field: "name", reason: "emoji_name_invalid" },
          },
        }),
    });

    const result = await uploadServerEmoji("s1", {
      name: "m",
      uri: "file://path/to/mate.png",
      mimeType: "image/png",
    });

    expect(result).toEqual({
      ok: false,
      field: "name",
      message: EMOJI_NAME_INVALID,
    });
  });

  it("mapea conflicto de nombre tomado (409)", async () => {
    mockedExpoFetch.mockResolvedValueOnce({
      status: 409,
      text: async () =>
        JSON.stringify({
          error: {
            code: 409,
            message: "Conflict",
            details: { field: "name", reason: "emoji_name_taken" },
          },
        }),
    });

    const result = await uploadServerEmoji("s1", {
      name: "mate",
      uri: "file://path/to/mate.png",
      mimeType: "image/png",
    });

    expect(result).toEqual({
      ok: false,
      field: "name",
      message: EMOJI_NAME_TAKEN,
    });
  });

  it("mapea error 403 de permisos al formulario", async () => {
    mockedExpoFetch.mockResolvedValueOnce({
      status: 403,
      text: async () =>
        JSON.stringify({
          error: {
            code: 403,
            message: "Forbidden",
          },
        }),
    });

    const result = await uploadServerEmoji("s1", {
      name: "mate",
      uri: "file://path/to/mate.png",
      mimeType: "image/png",
    });

    expect(result).toEqual({
      ok: false,
      field: "form",
      message: NO_PERMISSION_EMOJIS,
    });
  });
});

describe("deleteServerEmoji", () => {
  it("elimina el emoji correctamente", async () => {
    mockedApiFetch.mockResolvedValueOnce({
      ok: true,
      status: 204,
      data: undefined,
    });

    const result = await deleteServerEmoji("s1", "e1");
    expect(result).toEqual({ ok: true });
    expect(mockedApiFetch).toHaveBeenCalledWith("/v1/servers/s1/emojis/e1", {
      method: "DELETE",
    });
  });
});

describe("fetchCustomEmojis", () => {
  it("devuelve lista de emojis por id", async () => {
    const emojis = [
      {
        id: "e1",
        server_id: "s1",
        name: "mate",
        animated: false,
        image_url: "/emojis/mate.png",
      },
    ];
    mockedApiFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      data: { emojis },
    });

    const result = await fetchCustomEmojis(["e1"]);
    expect(result).toEqual({ ok: true, emojis });
  });

  it("si la lista de ids esta vacia devuelve array vacio sin llamar a la api", async () => {
    const result = await fetchCustomEmojis([]);
    expect(result).toEqual({ ok: true, emojis: [] });
    expect(mockedApiFetch).not.toHaveBeenCalled();
  });
});
