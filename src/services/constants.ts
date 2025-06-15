// ✅ Estados de compra que coinciden exactamente con el backend
export const ESTADOS_COMPRA = [
  { label: "Todos", value: "TODOS" },
  { label: "Pendiente", value: "PENDIENTE" },
  { label: "Completada", value: "COMPLETADA" },
  { label: "Reembolsada", value: "REEMBOLSADA" },
  { label: "Parcialmente Reembolsada", value: "PARCIALMENTE_REEMBOLSADA" },
  { label: "Cancelada", value: "CANCELADA" },
]

// ✅ NUEVO: Estados de pasaje que coinciden exactamente con el backend
export const ESTADOS_PASAJE = [
  { label: "Todos", value: "TODOS" },
  { label: "Confirmado", value: "CONFIRMADO" },
  { label: "Pendiente", value: "PENDIENTE" },
  { label: "Cancelado", value: "CANCELADO" },
  { label: "Devuelto", value: "DEVUELTO" },
]

export const API_BASE_URL = "http://192.168.1.2:8080"

export const API_ROUTES = {
  // Rutas de autenticación
  LOGIN: "/auth/login",
  REGISTER: "/auth/register",
  VERIFY_EMAIL: "/auth/verify-email",
  RECOVER_PASSWORD: "/auth/recover-password",

  // Rutas de compras
  COMPRAS_CLIENTE: "/compras/cliente",
  COMPRAS_DETALLE: "/compras",
  COMPRAS_PDF: "/compras",

  // ✅ NUEVO: Rutas de pasajes
  PASAJES_CLIENTE: "/pasajes/cliente",
  PASAJES_PDF: "/pasajes",

  // ✅ ACTUALIZADO: Rutas de localidades (endpoints correctos del backend)
  LOCALIDADES_ALL: "/localidades/all",
  LOCALIDADES_ORIGENES_POSIBLES: "/localidades/origenes-posibles",
  LOCALIDADES_DESTINOS_POSIBLES: "/localidades/destinos-posibles",
  LOCALIDADES_DETALLE: "/localidades",

  // ✅ NUEVO: Rutas adicionales que podrían ser útiles
  VIAJES_BUSCAR: "/viajes/buscar",
  VIAJES_DETALLE: "/viajes",
  ASIENTOS_DISPONIBLES: "/viajes/{id}/asientos-disponibles",
}
