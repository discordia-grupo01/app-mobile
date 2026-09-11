import type {
  ForgotPasswordErrors,
  ForgotPasswordValues,
  LoginErrors,
  LoginValues,
  RegisterErrors,
  RegisterValues,
} from "./types";

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

/** Nombre de usuario: entre 3 y 32 caracteres (mismo rango que web-client). */
const NAME_MIN = 3;
const NAME_MAX = 32;

/** El backend exige 8+ caracteres con mayuscula, minuscula y numero. */
const PASSWORD_MIN = 8;
const HAS_UPPERCASE = /[A-Z]/;
const HAS_LOWERCASE = /[a-z]/;
const HAS_DIGIT = /\d/;

export function validateRegister(values: RegisterValues): RegisterErrors {
  const errors: RegisterErrors = {};

  const name = values.name.trim();
  if (name === "") {
    errors.name = "Ingresa un nombre de usuario";
  } else if (name.length < NAME_MIN) {
    errors.name = `El nombre debe tener al menos ${NAME_MIN} caracteres`;
  } else if (name.length > NAME_MAX) {
    errors.name = `El nombre no puede superar los ${NAME_MAX} caracteres`;
  }

  const email = values.email.trim();
  if (email === "") {
    errors.email = "Ingresa tu correo electronico";
  } else if (!EMAIL_REGEX.test(email)) {
    errors.email = "El correo electronico no es valido";
  }

  const { password } = values;
  if (password === "") {
    errors.password = "Ingresa una contrasena";
  } else if (
    password.length < PASSWORD_MIN ||
    !HAS_UPPERCASE.test(password) ||
    !HAS_LOWERCASE.test(password) ||
    !HAS_DIGIT.test(password)
  ) {
    errors.password =
      "Usa 8+ caracteres con una mayuscula, una minuscula y un numero";
  }

  return errors;
}

export function validateForgotPassword(
  values: ForgotPasswordValues,
): ForgotPasswordErrors {
  const errors: ForgotPasswordErrors = {};

  const email = values.email.trim();
  if (email === "") {
    errors.email = "Ingresa tu correo electronico";
  } else if (!EMAIL_REGEX.test(email)) {
    errors.email = "El correo electronico no es valido";
  }

  return errors;
}

export function hasErrors(
  errors: LoginErrors | RegisterErrors | ForgotPasswordErrors,
): boolean {
  return Object.values(errors).some((value) => value !== undefined);
}
