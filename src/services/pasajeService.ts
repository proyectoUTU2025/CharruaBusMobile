"use client"

import { API_BASE_URL } from "./constants"
// Importar las utilidades de PDF
import { handlePdfDownload } from "../utils/pdfUtils"

// ✅ Enum de estados de pasaje según el backend
export enum TipoEstadoPasaje {
  CONFIRMADO = "CONFIRMADO",
  CANCELADO = "CANCELADO",
  DEVUELTO = "DEVUELTO",
  PENDIENTE = "PENDIENTE",
}

// ✅ Interfaces que coinciden con el backend
export interface PasajeDto {
  id: number
  precio: number // BigDecimal precio
  descuento: number // BigDecimal descuento
  subtotal: number // BigDecimal subtotal
  estadoPasaje: TipoEstadoPasaje | string
  viajeAsiento: {
    id: number
    asiento: {
      numero: number
      tipo: string
    }
    viaje: {
      id: number
      fechaHoraSalida: string // LocalDateTime
      fechaHoraLlegada: string // LocalDateTime
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
  compra: {
    id: number
    fechaCompra: string
  }
  devolucion?: {
    id: number
    montoReintegrado: number
    fechaDevolucion: string
  }
}

export interface FiltroBusquedaPasajeDto {
  estados?: string[]
  fechaDesde?: string
  fechaHasta?: string
  origenId?: number
  destinoId?: number
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

// ✅ Funciones para formatear fechas al formato LocalDateTime
const formatFechaDesde = (dateString: string): string => {
  if (dateString.includes("T")) {
    return dateString
  }
  return `${dateString}T00:00:00`
}

const formatFechaHasta = (dateString: string): string => {
  if (dateString.includes("T")) {
    return dateString
  }
  return `${dateString}T23:59:59`
}

// ✅ Funciones utilitarias para estados de pasajes
export const getTicketStatusColor = (status: string): string => {
  switch (status.toUpperCase()) {
    case TipoEstadoPasaje.CONFIRMADO:
      return "#4CAF50" // Verde
    case TipoEstadoPasaje.PENDIENTE:
      return "#FF9800" // Naranja
    case TipoEstadoPasaje.CANCELADO:
      return "#F44336" // Rojo
    case TipoEstadoPasaje.DEVUELTO:
      return "#9C27B0" // Púrpura
    default:
      return "#79747E" // Gris
  }
}

export const getTicketStatusText = (status: string): string => {
  switch (status.toUpperCase()) {
    case TipoEstadoPasaje.CONFIRMADO:
      return "Confirmado"
    case TipoEstadoPasaje.PENDIENTE:
      return "Pendiente"
    case TipoEstadoPasaje.CANCELADO:
      return "Cancelado"
    case TipoEstadoPasaje.DEVUELTO:
      return "Devuelto"
    default:
      return status
  }
}

export const getTicketStatusIcon = (status: string): string => {
  switch (status.toUpperCase()) {
    case TipoEstadoPasaje.CONFIRMADO:
      return "check-circle"
    case TipoEstadoPasaje.PENDIENTE:
      return "schedule"
    case TipoEstadoPasaje.CANCELADO:
      return "cancel"
    case TipoEstadoPasaje.DEVUELTO:
      return "undo"
    default:
      return "help"
  }
}

// ✅ Función para verificar si se puede generar PDF
export const canGenerateTicketPdf = (status: string): boolean => {
  return [TipoEstadoPasaje.CONFIRMADO].includes(status.toUpperCase() as TipoEstadoPasaje)
}

// ✅ Función para verificar si tiene descuento (estudiantes/jubilados)
export const hasStudentOrRetiredDiscount = (descuento: number): boolean => {
  return descuento > 0
}

// ✅ Función para obtener el tipo de descuento
export const getDiscountType = (descuento: number): string => {
  if (descuento > 0) {
    return "Estudiante/Jubilado"
  }
  return "Sin descuento"
}

class PasajeService {
  private getAuthHeaders(token: string) {
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    }
  }

  // ✅ Obtener historial de pasajes del cliente
  async obtenerHistorialPasajes(
    clienteId: number,
    email: string,
    filtro: FiltroBusquedaPasajeDto,
    pageable: PageableDto,
    token: string,
  ): Promise<PageResponseDto<PasajeDto>> {
    try {
      console.log("🎫 === OBTENIENDO HISTORIAL DE PASAJES ===")
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

      // ✅ Formatear fechas antes de enviarlas al backend
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

      if (filtro.origenId !== undefined) {
        params.append("origenId", filtro.origenId.toString())
      }
      if (filtro.destinoId !== undefined) {
        params.append("destinoId", filtro.destinoId.toString())
      }

      // ✅ URL usando las constantes actualizadas
      const url = `${API_BASE_URL}/pasajes/cliente/${clienteId}?${params.toString()}`
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
        console.log("✅ Historial de pasajes obtenido:", {
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
      console.error("💥 Error en obtenerHistorialPasajes:", error)
      if (error.message.includes("fetch") || error.message.includes("Network request failed")) {
        throw new Error("Error de conexión. Verifica tu internet.")
      }
      throw error
    }
  }

  // ✅ Generar PDF del pasaje
  async generarPdfPasaje(pasajeId: number, token: string): Promise<void> {
    try {
      console.log("🎫 === GENERANDO PDF DE PASAJE ===")
      console.log("🆔 Pasaje ID:", pasajeId)

      const url = `${API_BASE_URL}/pasajes/${pasajeId}/pdf`
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
      console.log("✅ PDF de pasaje generado, tamaño:", blob.size, "bytes")

      // Usar la utilidad para manejar la descarga
      await handlePdfDownload(blob, `pasaje-${pasajeId}.pdf`)
    } catch (error: any) {
      console.error("💥 Error en generarPdfPasaje:", error)
      if (error.message.includes("fetch") || error.message.includes("Network request failed")) {
        throw new Error("Error de conexión. Verifica tu internet.")
      }
      throw error
    }
  }
}

export const pasajeService = new PasajeService()
