import { parseReadMarks } from "./readMarksStorage";

jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

describe("parseReadMarks", () => {
  it("se queda solo con fechas válidas", () => {
    expect(
      parseReadMarks(
        JSON.stringify({
          "channel:c1": "2026-11-04T12:00:00.000Z",
          "dm:x": "no es fecha",
          "*": 3,
        }),
      ),
    ).toEqual({ "channel:c1": "2026-11-04T12:00:00.000Z" });
  });

  it("con basura o vacío devuelve sin marcas", () => {
    expect(parseReadMarks(null)).toEqual({});
    expect(parseReadMarks("{roto")).toEqual({});
    expect(parseReadMarks("[1,2]")).toEqual({});
  });
});
