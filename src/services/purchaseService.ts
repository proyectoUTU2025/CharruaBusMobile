"use client"

import { API_BASE_URL, API_ROUTES } from "./constants" // ✅ CORREGIDO: Ruta de importación

// ✅ CORREGIDO: Enum actualizado para coincidir EXACTAMENTE con el backend
export enum TipoEstadoCompra {
  PENDIENTE = "PENDIENTE",
  COMPLETADA = "COMPLETADA", // ✅ CORREGIDO: Era CONFIRMADA, debe ser COMPLETADA
  REEMBOLSADA = "REEMBOLSADA",
  PARCIALMENTE_REEMBOLSADA = "PARCIALMENTE_REEMBOLSADA",
  CANCELADA = "CANCELADA",
  // ✅ REMOVIDO: EXPIRADA no existe en el backend
}

// ✅ MANTENIDO: Interfaz CompraDto que coincide EXACTAMENTE con el backend
export interface CompraDto {
  id: number // Long id (convertido a number en JSON)
  fechaCompra: string // LocalDateTime fechaCompra (convertido a string en JSON)
  precioActual: number // BigDecimal precioActual (convertido a number en JSON)
  precioOriginal: number // BigDecimal precioOriginal (convertido a number en JSON)
  vendedorId: number // Long vendedorId (convertido a number en JSON)
  clienteId: number // Long clienteId (convertido a number en JSON)
  cantidadPasajes: number // int cantidadPasajes
  estado: TipoEstadoCompra | string // TipoEstadoCompra estado
}

// ✅ MANTENIDO: Interfaz DetalleCompraDto basada en CompraDto + campos adicionales
export interface DetalleCompraDto {
  id: number
  fechaCompra: string
  precioActual: number
  precioOriginal: number
  vendedorId: number
  clienteId: number
  cantidadPasajes: number
  estado: TipoEstadoCompra | string

  // Campos adicionales que podrían estar en el detalle
  pasajes: PasajeDto[]
}

export interface PasajeDto {
  id: number
  precio: number
  descuento: number
  subtotal: number
  estadoPasaje: string
  viajeAsiento: {
    id: number
    asiento: {
      numero: number
      tipo: string
    }
    viaje: {
      id: number
      fechaHoraSalida: string
      fechaHoraLlegada: string
    }
  }
  paradaOrigen: {
    id: number
    localidad: {
      nombre: string
      departamento: string
    }
  }
  paradaDestino: {
    id: number
    localidad: {
      nombre: string
      departamento: string
    }
  }
}

export interface FiltroBusquedaCompraDto {
  estados?: string[]
  fechaDesde?: string
  fechaHasta?: string
  montoMin?: number
  montoMax?: number
}

export interface PageableDto {
  page: number
  size: number
  sort: string
}

export interface PageResponseDto<T> {
  content: T[]
  pageable: {
    pageNumber: number
    pageSize: number
  }
  totalElements: number
  totalPages: number
  last: boolean
  first: boolean
}

// ✅ NUEVO: Funciones para formatear fechas al formato LocalDateTime que espera el backend
const formatFechaDesde = (dateString: string): string => {
  // Si ya tiene formato completo, devolverla tal como está
  if (dateString.includes("T")) {
    return dateString
  }
  // Para fechaDesde: agregar 00:00:00 (inicio del día)
  return `${dateString}T00:00:00`
}

const formatFechaHasta = (dateString: string): string => {
  // Si ya tiene formato completo, devolverla tal como está
  if (dateString.includes("T")) {
    return dateString
  }
  // Para fechaHasta: agregar 23:59:59 (final del día)
  return `${dateString}T23:59:59`
}

// ✅ CORREGIDO: Funciones utilitarias actualizadas con los estados correctos
export const getStatusColor = (status: string): string => {
  switch (status.toUpperCase()) {
    case TipoEstadoCompra.COMPLETADA: // ✅ CORREGIDO: Ahora es COMPLETADA
      return "#4CAF50" // Verde
    case TipoEstadoCompra.PENDIENTE:
      return "#FF9800" // Naranja
    case TipoEstadoCompra.CANCELADA:
      return "#F44336" // Rojo
    case TipoEstadoCompra.REEMBOLSADA:
      return "#9C27B0" // Púrpura
    case TipoEstadoCompra.PARCIALMENTE_REEMBOLSADA:
      return "#673AB7" // Púrpura oscuro
    default:
      return "#79747E" // Gris
  }
}

export const getStatusText = (status: string): string => {
  switch (status.toUpperCase()) {
    case TipoEstadoCompra.COMPLETADA: // ✅ CORREGIDO: Ahora es COMPLETADA
      return "Completada"
    case TipoEstadoCompra.PENDIENTE:
      return "Pendiente"
    case TipoEstadoCompra.CANCELADA:
      return "Cancelada"
    case TipoEstadoCompra.REEMBOLSADA:
      return "Reembolsada"
    case TipoEstadoCompra.PARCIALMENTE_REEMBOLSADA:
      return "Parcialmente Reembolsada"
    default:
      return status
  }
}

export const getStatusIcon = (status: string): string => {
  switch (status.toUpperCase()) {
    case TipoEstadoCompra.COMPLETADA: // ✅ CORREGIDO: Ahora es COMPLETADA
      return "check-circle"
    case TipoEstadoCompra.PENDIENTE:
      return "schedule"
    case TipoEstadoCompra.CANCELADA:
      return "cancel"
    case TipoEstadoCompra.REEMBOLSADA:
      return "undo"
    case TipoEstadoCompra.PARCIALMENTE_REEMBOLSADA:
      return "restore"
    default:
      return "help"
  }
}

// ✅ CORREGIDO: Función para verificar si se puede generar PDF
export const canGeneratePdf = (status: string): boolean => {
  return [TipoEstadoCompra.COMPLETADA, TipoEstadoCompra.REEMBOLSADA].includes(status.toUpperCase() as TipoEstadoCompra)
}

// ✅ MANTENIDO: Función para obtener el descuento aplicado
export const getDiscountAmount = (precioOriginal: number, precioActual: number): number => {
  return precioOriginal - precioActual
}

// ✅ MANTENIDO: Función para obtener el porcentaje de descuento
export const getDiscountPercentage = (precioOriginal: number, precioActual: number): number => {
  if (precioOriginal === 0) return 0
  return Math.round(((precioOriginal - precioActual) / precioOriginal) * 100)
}

class PurchaseService {
  private getAuthHeaders(token: string) {
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    }
  }

  // ✅ ACTUALIZADO: Obtener historial de compras del cliente con formato de fechas corregido
  async obtenerHistorialCompras(
    clienteId: number,
    email: string,
    filtro: FiltroBusquedaCompraDto,
    pageable: PageableDto,
    token: string,
  ): Promise<PageResponseDto<CompraDto>> {
    try {
      console.log("🔍 === OBTENIENDO HISTORIAL DE COMPRAS ===")
      console.log("👤 Cliente ID:", clienteId)
      console.log("📧 Email:", email)
      console.log("🔍 Filtros originales:", JSON.stringify(filtro))
      console.log("📄 Pageable:", JSON.stringify(pageable))

      // Construir query parameters
      const params = new URLSearchParams()

      // Parámetros de paginación
      params.append("page", pageable.page.toString())
      params.append("size", pageable.size.toString())
      params.append("sort", pageable.sort)

      // Agregar filtros si existen
      if (filtro.estados && filtro.estados.length > 0) {
        filtro.estados.forEach((estado) => params.append("estados", estado))
        console.log("🏷️ Estados enviados:", filtro.estados)
      }

      // ✅ CORREGIDO: Formatear fechas antes de enviarlas al backend
      if (filtro.fechaDesde) {
        const fechaDesdeFormatted = formatFechaDesde(filtro.fechaDesde)
        params.append("fechaDesde", fechaDesdeFormatted)
        console.log("📅 Fecha desde original:", filtro.fechaDesde)
        console.log("📅 Fecha desde formateada:", fechaDesdeFormatted)
      }

      if (filtro.fechaHasta) {
        const fechaHastaFormatted = formatFechaHasta(filtro.fechaHasta)
        params.append("fechaHasta", fechaHastaFormatted)
        console.log("📅 Fecha hasta original:", filtro.fechaHasta)
        console.log("📅 Fecha hasta formateada:", fechaHastaFormatted)
      }

      if (filtro.montoMin !== undefined) {
        params.append("montoMin", filtro.montoMin.toString())
      }
      if (filtro.montoMax !== undefined) {
        params.append("montoMax", filtro.montoMax.toString())
      }

      // ✅ CORREGIDO: URL usando las constantes actualizadas
      const url = `${API_BASE_URL}${API_ROUTES.COMPRAS_CLIENTE}/${clienteId}?${params.toString()}`
      console.log("🌐 URL completa:", url)

      const response = await fetch(url, {
        method: "GET",
        headers: this.getAuthHeaders(token),
      })

      console.log("📊 Response status:", response.status)

      // Obtener el texto de la respuesta para depuración
      const responseText = await response.text()
      console.log("📄 Response text:", responseText.substring(0, 500) + "...")

      if (!response.ok) {
        console.error("❌ Error response:", responseText)
        throw new Error(`Error ${response.status}: ${responseText}`)
      }

      // Parsear la respuesta JSON
      let result
      try {
        result = JSON.parse(responseText)
        console.log("✅ Historial obtenido:", {
          totalElements: result.totalElements,
          contentLength: result.content?.length || 0,
          firstItem: result.content && result.content.length > 0 ? JSON.stringify(result.content[0]) : "No items",
        })
      } catch (parseError) {
        console.error("❌ Error parsing JSON:", parseError)
        throw new Error("Error al procesar la respuesta del servidor")
      }

      // Verificar si la respuesta tiene la estructura esperada
      if (!result.content) {
        console.error("❌ Estructura de respuesta inesperada:", result)
        throw new Error("El servidor devolvió una estructura de datos inesperada")
      }

      return result
    } catch (error: any) {
      console.error("💥 Error en obtenerHistorialCompras:", error)
      if (error.message.includes("fetch") || error.message.includes("Network request failed")) {
        throw new Error("Error de conexión. Verifica tu internet.")
      }
      throw error
    }
  }

  // ✅ MANTENIDO: Obtener detalle de una compra específica
  async obtenerDetalleCompra(compraId: number, token: string): Promise<DetalleCompraDto> {
    try {
      console.log("🔍 === OBTENIENDO DETALLE DE COMPRA ===")
      console.log("🆔 Compra ID:", compraId)

      // ✅ CORREGIDO: URL usando las constantes actualizadas
      const url = `${API_BASE_URL}${API_ROUTES.COMPRAS_DETALLE}/${compraId}`
      console.log("🌐 URL:", url)

      const response = await fetch(url, {
        method: "GET",
        headers: this.getAuthHeaders(token),
      })

      console.log("📊 Response status:", response.status)

      // Obtener el texto de la respuesta para depuración
      const responseText = await response.text()
      console.log("📄 Response text:", responseText.substring(0, 500) + "...")

      if (!response.ok) {
        console.error("❌ Error response:", responseText)
        throw new Error(`Error ${response.status}: ${responseText}`)
      }

      // Parsear la respuesta JSON
      let result
      try {
        result = JSON.parse(responseText)
        console.log("✅ Detalle obtenido:", {
          id: result.id || (result.data && result.data.id),
          estructura: result.data ? "Con wrapper data" : "Directo",
        })
      } catch (parseError) {
        console.error("❌ Error parsing JSON:", parseError)
        throw new Error("Error al procesar la respuesta del servidor")
      }

      // El backend puede devolver { data: DetalleCompraDto, message: string } o directamente DetalleCompraDto
      const detalleCompra = result.data || result

      // Verificar que tenemos los datos mínimos necesarios
      if (!detalleCompra.id) {
        console.error("❌ Datos de compra incompletos:", detalleCompra)
        throw new Error("Los datos de la compra están incompletos o en un formato inesperado")
      }

      return detalleCompra
    } catch (error: any) {
      console.error("💥 Error en obtenerDetalleCompra:", error)
      if (error.message.includes("fetch") || error.message.includes("Network request failed")) {
        throw new Error("Error de conexión. Verifica tu internet.")
      }
      throw error
    }
  }

  // ✅ MANTENIDO: Generar PDF de la compra
  async generarPdfCompra(compraId: number, token: string): Promise<Blob> {
    try {
      console.log("📄 === GENERANDO PDF DE COMPRA ===")
      console.log("🆔 Compra ID:", compraId)

      // ✅ CORREGIDO: URL usando las constantes actualizadas
      const url = `${API_BASE_URL}${API_ROUTES.COMPRAS_PDF}/${compraId}/pdf`
      console.log("🌐 URL:", url)

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      console.log("📊 Response status:", response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("❌ Error response:", errorText)
        throw new Error(`Error ${response.status}: ${errorText}`)
      }

      const blob = await response.blob()
      console.log("✅ PDF generado, tamaño:", blob.size, "bytes")

      return blob
    } catch (error: any) {
      console.error("💥 Error en generarPdfCompra:", error)
      if (error.message.includes("fetch") || error.message.includes("Network request failed")) {
        throw new Error("Error de conexión. Verifica tu internet.")
      }
      throw error
    }
  }
}

export const purchaseService = new PurchaseService()
