import {
  MESSAGE_SEARCH_PAGE_FAILED,
  MESSAGE_SEARCH_RATE_LIMITED,
  SESSION_EXPIRED_MESSAGE,
} from "@discordia/client-shared";

import { apiFetch } from "../../lib/api-client";

import { searchMessages } from "./api";

jest.mock("../../lib/api-client", () => ({ apiFetch: jest.fn() }));

const mockedFetch = apiFetch as jest.MockedFunction<typeof apiFetch>;

const MESSAGE = {
  id: "m1",
  channel_id: "c1",
  server_id: "s1",
  user_id: "u1",
  content: "deploy listo",
  inserted_at: "2026-10-25T03:00:00.000Z",
};

beforeEach(() => mockedFetch.mockReset());

describe("searchMessages", () => {
  it("arma la query y pasa la respuesta a camelCase", async () => {
    mockedFetch.mockResolvedValue({
      ok: true,
      status: 200,
      data: {
        messages: [MESSAGE],
        next_cursor: "m1",
        total: 30,
        total_capped: false,
      },
    });

    const result = await searchMessages(
      "s1",
      { text: " deploy ", authorId: "u1" },
      "m9",
    );

    expect(mockedFetch).toHaveBeenCalledWith(
      "/v1/servers/s1/messages/search?limit=25&q=deploy&author_id=u1&before=m9",
      { method: "GET" },
    );
    expect(result).toEqual({
      ok: true,
      messages: [MESSAGE],
      nextCursor: "m1",
      total: 30,
      totalCapped: false,
    });
  });

  it("traduce los errores del back y el rate limit del gateway", async () => {
    mockedFetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      code: "INVALID_CURSOR",
      message: "x",
    });
    mockedFetch.mockResolvedValueOnce({
      ok: false,
      status: 429,
      code: "UNKNOWN_ERROR",
      message: "x",
    });
    mockedFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      code: "UNAUTHORIZED",
      message: "x",
    });

    const query = { text: "deploy", authorId: null };
    expect(await searchMessages("s1", query)).toEqual({
      ok: false,
      message: MESSAGE_SEARCH_PAGE_FAILED,
    });
    expect(await searchMessages("s1", query)).toEqual({
      ok: false,
      message: MESSAGE_SEARCH_RATE_LIMITED,
    });
    expect(await searchMessages("s1", query)).toEqual({
      ok: false,
      message: SESSION_EXPIRED_MESSAGE,
    });
  });
});
