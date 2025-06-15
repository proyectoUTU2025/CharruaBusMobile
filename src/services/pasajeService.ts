// ✅ ACTUALIZADO: Usar las constantes de rutas
import { API_BASE_URL, API_ROUTES } from "./constants"
// Importar las utilidades de PDF
import { handlePdfDownload } from "../utils/pdfUtils"

interface PasajeDto {
  id: number
  fechaCompra: string
  precioTotal: number
  estado: string
  origen: string
  destino: string
  clienteId: number
}

interface PageResponseDto<T> {
  content: T[]
  totalElements: number
  totalPages: number
  size: number
  number: number
  sort: string | null
  first: boolean
  last: boolean
  empty: boolean
}

interface FiltroBusquedaPasajeDto {
  estados: string[]
  fechaDesde: string
  fechaHasta: string
  origenId?: number
  destinoId?: number
}

interface PageableDto {
  page: number
  size: number
  sort: string
}

enum EstadoPasaje {
  PENDIENTE = "PENDIENTE",
  CONFIRMADO = "CONFIRMADO",
  CANCELADO = "CANCELADO",
  UTILIZADO = "UTILIZADO",
}

// Formatear la fecha desde para que sea compatible con el backend (yyyy-MM-dd)
const formatFechaDesde = (fecha: string): string => {
  const date = new Date(fecha)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

// Formatear la fecha hasta para que sea compatible con el backend (yyyy-MM-dd)
const formatFechaHasta = (fecha: string): string => {
  const date = new Date(fecha)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate() + 1).padStart(2, "0") // Sumar un día
  return `${year}-${month}-${day}`
}

class PasajeService {
  private getAuthHeaders(token: string) {
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    }
  }

  // ✅ ACTUALIZADO: Usar la ruta constante
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

      // ✅ ACTUALIZADO: Usar la ruta constante
      const url = `${API_BASE_URL}${API_ROUTES.PASAJES_CLIENTE}/${clienteId}?${params.toString()}`
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

  // ✅ ACTUALIZADO: Usar la ruta constante
  async generarPdfPasaje(pasajeId: number, token: string): Promise<void> {
    try {
      console.log("🎫 === GENERANDO PDF DE PASAJE ===")
      console.log("🆔 Pasaje ID:", pasajeId)

      const url = `${API_BASE_URL}${API_ROUTES.PASAJES_PDF}/${pasajeId}/pdf`
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
