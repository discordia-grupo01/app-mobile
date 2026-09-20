/**
 * La logica de validacion se testea en `client-shared`. Este test existe por
 * otra razon: es la unica prueba automatica de que el paquete **resuelve y
 * corre** bajo Metro/Hermes, que es lo que mas facil se rompe (el paquete se
 * publica como dependencia de git, sin registry en el medio).
 *
 * Si alguna vez falla por un mensaje que no coincide, lo que hay que mirar es
 * si la version instalada es la que dice el `package.json` (ver "Trampa #10"
 * en `shared-migration/README.md`), no el texto.
 */
import {
  hasErrors,
  SHARED_VERSION,
  validateLogin,
  validateUserName,
} from "@discordia/client-shared";

describe("integracion con client-shared", () => {
  it("resuelve el paquete y expone la version", () => {
    expect(SHARED_VERSION).toMatch(/^\d+\.\d+\.\d+$/);
  });

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

  it("marca email y password vacíos, en voseo y con tildes", () => {
    const errors = validateLogin({ email: "", password: "" });
    expect(errors.email).toBe("Ingresá tu correo electrónico");
    expect(errors.password).toBe("Ingresá tu contraseña");
    expect(hasErrors(errors)).toBe(true);
  });

  /**
   * El backend (`normalizeProfileName` en identify-service) no tiene minimo:
   * rechaza vacio y corta en 100. Antes las dos apps exigian 3 a 32 por su
   * cuenta, asi que rechazaban nombres que la API aceptaba.
   */
  it("sigue la regla de nombre del backend, no la que tenia la app", () => {
    expect(validateUserName("Jo")).toBeUndefined();
    expect(validateUserName("a".repeat(100))).toBeUndefined();
    expect(validateUserName("a".repeat(101))).toBeDefined();
    expect(validateUserName("   ")).toBe("Ingresá un nombre de usuario");
  });
});
