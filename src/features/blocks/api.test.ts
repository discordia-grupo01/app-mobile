import { apiFetch } from "../../lib/api-client";

import { blockUser, listBlocks, unblockUser } from "./api";

jest.mock("../../lib/api-client", () => ({ apiFetch: jest.fn() }));

const mockedFetch = apiFetch as jest.MockedFunction<typeof apiFetch>;

function failure(code: string, status = 400) {
  return { ok: false as const, status, code, message: "x" };
}

beforeEach(() => mockedFetch.mockReset());

describe("listBlocks", () => {
  it("devuelve solo los ids de los bloqueados", async () => {
    mockedFetch.mockResolvedValue({
      ok: true,
      status: 200,
      data: { blocks: [{ user_id: "u2", created_at: "2026-10-01T00:00:00Z" }] },
    });

    expect(await listBlocks()).toEqual({ ok: true, blockedUserIds: ["u2"] });
  });
});

describe("blockUser", () => {
  it("manda el id en el cuerpo, no en la URL", async () => {
    mockedFetch.mockResolvedValue({ ok: true, status: 204, data: undefined });

    expect(await blockUser("u2")).toEqual({ ok: true });
    expect(mockedFetch).toHaveBeenCalledWith("/v1/blocks", {
      method: "POST",
      body: JSON.stringify({ user_id: "u2" }),
    });
  });

  it("traduce el codigo de error del back", async () => {
    mockedFetch.mockResolvedValue(failure("USER_NOT_FOUND", 404));

    expect(await blockUser("u2")).toEqual({
      ok: false,
      message: "Este usuario no existe.",
    });
  });

  it("con un codigo desconocido usa el texto generico de bloquear", async () => {
    mockedFetch.mockResolvedValue(failure("BOOM", 500));

    const result = await blockUser("u2");

    expect(result).toEqual({
      ok: false,
      message: expect.stringContaining("bloquear al usuario"),
    });
  });
});

describe("unblockUser", () => {
  it("desbloquea por DELETE con el id en la URL", async () => {
    mockedFetch.mockResolvedValue({ ok: true, status: 204, data: undefined });

    expect(await unblockUser("u2")).toEqual({ ok: true });
    expect(mockedFetch).toHaveBeenCalledWith("/v1/blocks/u2", {
      method: "DELETE",
    });
  });
});
