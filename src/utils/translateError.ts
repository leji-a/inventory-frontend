export function translateError(err: any): string {
  const code = err?.code || ""
  const message = err?.message || ""

  // Códigos específicos de Supabase
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

  // Mensajes de error del backend API
  const lowerMessage = message.toLowerCase()

  // Errores de períodos
  if (lowerMessage.includes("no active period")) {
    return "No hay un período activo en este momento."
  }
  if (lowerMessage.includes("period not found")) {
    return "No se encontró el período especificado."
  }
  if (lowerMessage.includes("period already closed")) {
    return "Este período ya está cerrado."
  }
  if (lowerMessage.includes("period already active")) {
    return "Ya existe un período activo."
  }

  // Errores de productos
  if (lowerMessage.includes("product not found")) {
    return "No se encontró el producto."
  }
  if (lowerMessage.includes("product already exists")) {
    return "Ya existe un producto con ese nombre."
  }

  // Errores de categorías
  if (lowerMessage.includes("category not found")) {
    return "No se encontró la categoría."
  }
  if (lowerMessage.includes("category already exists")) {
    return "Ya existe una categoría con ese nombre."
  }
  if (lowerMessage.includes("category in use")) {
    return "No se puede eliminar la categoría porque está en uso."
  }

  // Errores de registros
  if (lowerMessage.includes("record not found")) {
    return "No se encontró el registro."
  }
  if (lowerMessage.includes("record already exists")) {
    return "Ya existe un registro para este producto en este período."
  }

  // Errores de autenticación
  if (lowerMessage.includes("invalid login credentials")) {
    return "Email o contraseña incorrectos."
  }
  if (lowerMessage.includes("email rate limit exceeded")) {
    return "Demasiados intentos. Intenta nuevamente más tarde."
  }
  if (lowerMessage.includes("unauthorized") || lowerMessage.includes("not authenticated")) {
    return "No tienes autorización para realizar esta acción."
  }

  // Errores de validación
  if (lowerMessage.includes("invalid email")) {
    return "El email ingresado no es válido."
  }
  if (lowerMessage.includes("required field") || lowerMessage.includes("is required")) {
    return "Falta completar campos obligatorios."
  }
  if (lowerMessage.includes("invalid format")) {
    return "El formato de los datos no es válido."
  }

  // Errores de red
  if (lowerMessage.includes("network") || lowerMessage.includes("fetch failed")) {
    return "Error de conexión. Verifica tu internet."
  }
  if (lowerMessage.includes("timeout")) {
    return "La solicitud tardó demasiado. Intenta nuevamente."
  }

  // Errores de servidor
  if (lowerMessage.includes("internal server error") || lowerMessage.includes("500")) {
    return "Error en el servidor. Intenta nuevamente más tarde."
  }
  if (lowerMessage.includes("service unavailable") || lowerMessage.includes("503")) {
    return "Servicio no disponible temporalmente."
  }

  // Errores de imágenes
  if (lowerMessage.includes("file too large")) {
    return "El archivo es demasiado grande. Máximo 5MB."
  }
  if (lowerMessage.includes("invalid file type")) {
    return "Tipo de archivo no permitido. Usa JPG, PNG o WEBP."
  }

  // Si no coincide con ningún patrón, devolver mensaje genérico
  // pero intentar limpiar el mensaje original
  if (message.length < 100) {
    return `Error: ${message}`
  }

  return "Ocurrió un error inesperado. Intenta nuevamente."
}

// Función auxiliar para extraer el mensaje de error de diferentes estructuras
export function extractErrorMessage(error: unknown): string {
  if (!error) return "Error desconocido"
  
  if (typeof error === "string") return error
  
  if (error instanceof Error) return error.message
  
  if (typeof error === "object") {
    const err = error as any
    
    // Estructura común de errores de API
    if (err.message) return err.message
    if (err.error) return err.error
    if (err.msg) return err.msg
    
    // Errores con respuesta JSON
    if (err.response?.data?.message) return err.response.data.message
    if (err.response?.data?.error) return err.response.data.error
  }
  
  return "Error desconocido"
}

// Función para usar en toda la app
export function handleError(error: unknown): string {
  const message = extractErrorMessage(error)
  return translateError({ message })
}

// Para usar en bloques catchh
export function getErrorMessage(err: any): string {
  return translateError(err)
}