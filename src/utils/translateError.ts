export function translateError(err: any): string {
  const code = err?.code || ""
  const message = err?.message || ""

  switch (code) {
    case "user_already_exists":
      return "Este email ya está registrado."
    case "invalid_credentials":
      return "Email o contraseña incorrectos."
    case "weak_password":
      return "La contraseña es demasiado débil."
    case "email_not_confirmed":
      return "Debes confirmar tu email antes de ingresar."
  }

  if (message.includes("Invalid login credentials")) {
    return "Email o contraseña incorrectos."
  }

  if (message.includes("Email rate limit exceeded")) {
    return "Demasiados intentos. Intenta nuevamente más tarde."
  }

  return "Ocurrió un error inesperado."
}
