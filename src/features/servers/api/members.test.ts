import { apiFetch } from "../../../lib/api-client";

import { listMembers } from "./members";

jest.mock("../../../lib/api-client", () => ({ apiFetch: jest.fn() }));

const mockedFetch = apiFetch as jest.MockedFunction<typeof apiFetch>;

beforeEach(() => mockedFetch.mockReset());

describe("listMembers", () => {
  it("pide una pagina filtrada por nombre", async () => {
    mockedFetch.mockResolvedValue({
      ok: true,
      status: 200,
      data: { members: [], total: 0, limit: 15, offset: 15 },
    });

    expect(
      await listMembers("s1", { search: "josé", limit: 15, offset: 15 }),
    ).toEqual({ ok: true, members: [], total: 0 });
    expect(mockedFetch).toHaveBeenCalledWith(
      "/v1/servers/s1/members?q=jos%C3%A9&limit=15&offset=15",
      { method: "GET" },
    );
  });

  it("sin filtros no manda query string", async () => {
    mockedFetch.mockResolvedValue({
      ok: true,
      status: 200,
      data: { members: [], total: 0, limit: 20, offset: 0 },
    });

    await listMembers("s1");

    expect(mockedFetch).toHaveBeenCalledWith("/v1/servers/s1/members", {
      method: "GET",
    });
  });
});
