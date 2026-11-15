import * as ImagePicker from "expo-image-picker";

import { pickImageFromLibrary } from "./pickImageFromLibrary";

jest.mock("expo-image-picker", () => ({
  requestMediaLibraryPermissionsAsync: jest.fn(),
  launchImageLibraryAsync: jest.fn(),
}));

const mockedPicker = jest.mocked(ImagePicker);

describe("pickImageFromLibrary", () => {
  beforeEach(() => {
    mockedPicker.requestMediaLibraryPermissionsAsync.mockResolvedValue({
      granted: true,
    } as ImagePicker.MediaLibraryPermissionResponse);
  });

  it("no recomprime la imagen, para que un GIF siga animado", async () => {
    mockedPicker.launchImageLibraryAsync.mockResolvedValue({
      canceled: false,
      assets: [
        {
          uri: "file:///cache/icon.gif",
          mimeType: "image/gif",
          width: 128,
          height: 128,
        },
      ],
    } as ImagePicker.ImagePickerResult);

    const picked = await pickImageFromLibrary("elegir un ícono");

    expect(mockedPicker.launchImageLibraryAsync).toHaveBeenCalledWith({
      mediaTypes: ["images"],
      quality: 1,
    });
    expect(picked?.mimeType).toBe("image/gif");
  });

  it("corrige el MIME image/jpg", async () => {
    mockedPicker.launchImageLibraryAsync.mockResolvedValue({
      canceled: false,
      assets: [
        {
          uri: "file:///cache/a.jpg",
          mimeType: "image/jpg",
          width: 1,
          height: 1,
        },
      ],
    } as ImagePicker.ImagePickerResult);

    expect((await pickImageFromLibrary("elegir"))?.mimeType).toBe("image/jpeg");
  });
});
