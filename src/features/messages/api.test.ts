import { apiFetch } from "../../lib/api-client";

import { fetchMessages } from "./api";

jest.mock("../../lib/api-client", () => ({ apiFetch: jest.fn() }));

const mockedFetch = apiFetch as jest.MockedFunction<typeof apiFetch>;

beforeEach(() => mockedFetch.mockReset());

describe("fetchMessages con around", () => {
  it("pide el historial alrededor del mensaje y devuelve los dos cursores", async () => {
    mockedFetch.mockResolvedValue({
      ok: true,
      status: 200,
      data: { messages: [], next_cursor: "m1", newer_cursor: "m9" },
    });

    const result = await fetchMessages("c1", { around: "m5", limit: 50 });

    expect(mockedFetch).toHaveBeenCalledWith(
      "/v1/channels/c1/messages?limit=50&around=m5",
      { method: "GET" },
    );
    expect(result).toEqual({
      ok: true,
      messages: [],
      nextCursor: "m1",
      newerCursor: "m9",
    });
  });

  it("sin around no agrega newerCursor", async () => {
    mockedFetch.mockResolvedValue({
      ok: true,
      status: 200,
      data: { messages: [], next_cursor: null },
    });

    expect(await fetchMessages("c1")).toEqual({
      ok: true,
      messages: [],
      nextCursor: null,
    });
  });
});
