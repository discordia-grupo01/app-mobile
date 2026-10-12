import { deleteChannelOverride, setChannelOverride } from "./api";
import { applyOverrideChanges, mergeFailedRoles } from "./useChannelOverrides";

jest.mock("./api", () => ({
  deleteChannelOverride: jest.fn(),
  listChannelOverrides: jest.fn(),
  setChannelOverride: jest.fn(),
}));

const mockedSet = setChannelOverride as jest.MockedFunction<
  typeof setChannelOverride
>;
const mockedDelete = deleteChannelOverride as jest.MockedFunction<
  typeof deleteChannelOverride
>;

beforeEach(() => {
  mockedSet.mockReset();
  mockedDelete.mockReset();
});

describe("applyOverrideChanges", () => {
  it("manda un PUT o un DELETE por cambio, en orden", async () => {
    mockedSet.mockResolvedValue({ ok: true, override: null });
    mockedDelete.mockResolvedValue({ ok: true });

    const failures = await applyOverrideChanges("c1", [
      { kind: "put", roleId: "r1", allow: ["SEND_MESSAGES"], deny: [] },
      { kind: "delete", roleId: "r2" },
    ]);

    expect(failures).toEqual([]);
    expect(mockedSet).toHaveBeenCalledWith("c1", "r1", {
      allow: ["SEND_MESSAGES"],
      deny: [],
    });
    expect(mockedDelete).toHaveBeenCalledWith("c1", "r2");
  });

  it("sigue con el resto si uno falla y devuelve los que fallaron", async () => {
    mockedSet
      .mockResolvedValueOnce({
        ok: false,
        message: "Sin permiso",
        permissionDenied: true,
      })
      .mockResolvedValueOnce({ ok: true, override: null });

    const failures = await applyOverrideChanges("c1", [
      { kind: "put", roleId: "r1", allow: [], deny: ["CONNECT"] },
      { kind: "put", roleId: "r2", allow: [], deny: ["CONNECT"] },
    ]);

    expect(mockedSet).toHaveBeenCalledTimes(2);
    expect(failures).toEqual([
      { roleId: "r1", message: "Sin permiso", permissionDenied: true },
    ]);
  });
});

describe("mergeFailedRoles", () => {
  it("toma lo del back salvo los roles que fallaron", () => {
    const fresh = { everyone: {}, r1: { CONNECT: "deny" as const } };
    const draft = {
      everyone: { VIEW_CHANNELS: "deny" as const },
      r1: { CONNECT: "allow" as const },
    };

    expect(mergeFailedRoles(fresh, draft, ["everyone"])).toEqual({
      everyone: { VIEW_CHANNELS: "deny" },
      r1: { CONNECT: "deny" },
    });
  });

  it("un rol que fallo y ya no estaba en el borrador se saca", () => {
    const fresh = { everyone: {}, r1: { CONNECT: "deny" as const } };
    const draft = { everyone: {} };

    expect(mergeFailedRoles(fresh, draft, ["r1"])).toEqual({ everyone: {} });
  });
});
