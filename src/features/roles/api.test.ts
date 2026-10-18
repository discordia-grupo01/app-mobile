import { apiFetch } from "../../lib/api-client";

import { listRoleMembers } from "./api";

jest.mock("../../lib/api-client", () => ({ apiFetch: jest.fn() }));

const mockedFetch = apiFetch as jest.MockedFunction<typeof apiFetch>;

beforeEach(() => mockedFetch.mockReset());

describe("listRoleMembers", () => {
  it("pide una sola pagina de los que NO tienen el rol, con busqueda", async () => {
    mockedFetch.mockResolvedValue({
      ok: true,
      status: 200,
      data: { members: [], total: 26, limit: 15, offset: 0 },
    });

    expect(
      await listRoleMembers("r1", { search: "ana", hasRole: false, limit: 15 }),
    ).toEqual({ ok: true, members: [], total: 26 });
    expect(mockedFetch).toHaveBeenCalledTimes(1);
    expect(mockedFetch).toHaveBeenCalledWith(
      "/v1/roles/r1/members?q=ana&has_role=false&limit=15",
      { method: "GET" },
    );
  });

  it("si falla devuelve el mensaje de error", async () => {
    mockedFetch.mockResolvedValue({
      ok: false,
      status: 403,
      code: "FORBIDDEN",
      message: "x",
    });

    const result = await listRoleMembers("r1");

    expect(result.ok).toBe(false);
  });
});
