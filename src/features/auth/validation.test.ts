import { hasErrors, validateLogin } from "./validation";

describe("validateLogin", () => {
  it("no devuelve errores con credenciales válidas", () => {
    const errors = validateLogin({
      email: "user@example.com",
      password: "password123",
    });
    expect(hasErrors(errors)).toBe(false);
  });

  it("acepta email con espacios alrededor", () => {
    const errors = validateLogin({
      email: "  user@example.com  ",
      password: "password123",
    });
    expect(errors.email).toBeUndefined();
  });

  it("marca email con formato inválido", () => {
    const errors = validateLogin({ email: "no-es-email", password: "x" });
    expect(errors.email).toBe("El correo electronico no es valido");
  });

  it("marca email y password vacíos", () => {
    const errors = validateLogin({ email: "", password: "" });
    expect(errors.email).toBe("Ingresa tu correo electronico");
    expect(errors.password).toBe("Ingresa tu contrasena");
    expect(hasErrors(errors)).toBe(true);
  });
});
