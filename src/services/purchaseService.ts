// services/purchaseService.ts
interface FiltroBusquedaCompraDto {
  estados?: string[]
  fechaDesde?: string
  fechaHasta?: string
  montoMin?: number
  montoMax?: number
}

interface PageableRequest {
  page: number
  size: number
  sort?: string
}

interface PageResponse<T> {
  content: T[]
  pageable: {
    pageNumber: number
    pageSize: number
  }
  totalElements: number
  totalPages: number
  last: boolean
  first: boolean
  empty: boolean
}

// Estructura real de la compra según la imagen
interface CompraDto {
  id: number
  fechaCompra: string // LocalDateTime se serializa como string
  estado: string // TipoEstadoCompra
  paymentId: string
  orderId: string
  precioTotal: number // double
}

class PurchaseService {
  // Cambia esta URL a la correcta de tu backend
  private baseUrl = "http://192.168.1.2:8080"
  private timeout = 15000 // 15 segundos de timeout

  private getHeaders(token?: string) {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
    }

    if (token) {
      headers["Authorization"] = `Bearer ${token}`
    }

    return headers
  }

  private buildQueryParams(params: Record<string, any>): string {
    const searchParams = new URLSearchParams()

    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== "") {
        if (Array.isArray(value)) {
          value.forEach((item) => searchParams.append(key, item.toString()))
        } else {
          searchParams.append(key, value.toString())
        }
      }
    })

    return searchParams.toString()
  }

  // Método para hacer peticiones con timeout
  private async fetchWithTimeout<T>(url: string, options: RequestInit, timeoutMs: number = this.timeout): Promise<T> {
    console.log(`🔄 Iniciando petición a ${url}`)

    // Crear un AbortController para poder cancelar la petición
    const controller = new AbortController()
    const { signal } = controller

    // Configurar el timeout
    const timeoutId = setTimeout(() => {
      controller.abort()
      console.log(`⏱️ Timeout después de ${timeoutMs}ms para ${url}`)
    }, timeoutMs)

    try {
      // Hacer la petición con el signal del AbortController
      const response = await fetch(url, {
        ...options,
        signal,
      })

      // Limpiar el timeout ya que la petición se completó
      clearTimeout(timeoutId)

      console.log(`📊 Respuesta recibida: ${response.status}`)

      // Manejar errores HTTP
      if (!response.ok) {
        const errorText = await response.text()
        console.error(`❌ Error ${response.status}: ${errorText}`)

        // Mensajes de error específicos según el código de estado
        switch (response.status) {
          case 401:
            throw new Error("Sesión expirada. Por favor, inicia sesión nuevamente.")
          case 403:
            throw new Error("No tienes permisos para acceder a esta información.")
          case 404:
            throw new Error("El recurso solicitado no existe.")
          case 500:
            throw new Error("Error en el servidor. Por favor, inténtalo más tarde.")
          default:
            throw new Error(`Error ${response.status}: ${response.statusText}`)
        }
      }

      // Parsear la respuesta como JSON
      const data = await response.json()
      return data as T
    } catch (error: any) {
      // Limpiar el timeout en caso de error
      clearTimeout(timeoutId)

      // Manejar errores específicos
      if (error.name === "AbortError") {
        console.error("⏱️ La petición fue abortada por timeout")
        throw new Error("La petición tardó demasiado tiempo. Por favor, inténtalo de nuevo.")
      }

      if (error.message.includes("Failed to fetch") || error.message.includes("Network request failed")) {
        console.error("🌐 Error de red:", error)
        throw new Error("No se pudo conectar con el servidor. Verifica tu conexión a internet.")
      }

      // Re-lanzar otros errores
      console.error("💥 Error en fetchWithTimeout:", error)
      throw error
    }
  }

  async obtenerHistorialCompras(
    clienteId: number,
    actorUsername: string,
    filtro: FiltroBusquedaCompraDto,
    pageable: PageableRequest,
    token?: string,
  ): Promise<PageResponse<CompraDto>> {
    try {
      console.log("🔄 Obteniendo historial de compras")
      console.log("📋 Parámetros:", { clienteId, actorUsername, filtro, pageable })

      // Verificar parámetros obligatorios
      if (!clienteId) {
        throw new Error("ID de cliente es requerido")
      }
      if (!actorUsername) {
        throw new Error("Nombre de usuario es requerido")
      }
      if (!token) {
        throw new Error("Token de autenticación es requerido")
      }

      const queryParams = this.buildQueryParams({
        clienteId,
        actorUsername,
        page: pageable.page,
        size: pageable.size,
        sort: pageable.sort || "fechaCompra,desc",
      })

      const url = `${this.baseUrl}/api/compras/historial?${queryParams}`
      console.log("🔗 URL:", url)

      return await this.fetchWithTimeout<PageResponse<CompraDto>>(
        url,
        {
          method: "POST",
          headers: this.getHeaders(token),
          body: JSON.stringify(filtro),
        },
        this.timeout,
      )
    } catch (error) {
      console.error("❌ Error en obtenerHistorialCompras:", error)
      throw error
    }
  }

  async obtenerCompras(
    filtro: FiltroBusquedaCompraDto,
    pageable: PageableRequest,
    token?: string,
  ): Promise<PageResponse<CompraDto>> {
    try {
      console.log("🔄 Obteniendo todas las compras")
      console.log("📋 Parámetros:", { filtro, pageable })

      const queryParams = this.buildQueryParams({
        page: pageable.page,
        size: pageable.size,
        sort: pageable.sort || "fechaCompra,desc",
      })

      const url = `${this.baseUrl}/api/compras?${queryParams}`
      console.log("🔗 URL:", url)

      return await this.fetchWithTimeout<PageResponse<CompraDto>>(
        url,
        {
          method: "POST",
          headers: this.getHeaders(token),
          body: JSON.stringify(filtro),
        },
        this.timeout,
      )
    } catch (error) {
      console.error("❌ Error en obtenerCompras:", error)
      throw error
    }
  }
}

export const purchaseService = new PurchaseService()
export type { CompraDto, FiltroBusquedaCompraDto, PageResponse, PageableRequest }
