import type { LoginErrors, LoginValues } from "./types";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateLogin(values: LoginValues): LoginErrors {
  const errors: LoginErrors = {};

  const email = values.email.trim();
  if (email === "") {
    errors.email = "Ingresa tu correo electronico";
  } else if (!EMAIL_REGEX.test(email)) {
    errors.email = "El correo electronico no es valido";
  }

  if (values.password === "") {
    errors.password = "Ingresa tu contrasena";
  }

  return errors;
}

export function hasErrors(errors: LoginErrors): boolean {
  return Object.keys(errors).length > 0;
}
