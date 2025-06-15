"use client"

// ✅ ACTUALIZADO: Usar las constantes de rutas
import { API_BASE_URL, API_ROUTES } from "./constants"

export interface Localidad {
  id: number
  nombreConDepartamento: string
}

class LocationService {
  private getAuthHeaders(token: string) {
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    }
  }

  // ✅ ACTUALIZADO: Usar la ruta constante
  async getOrigenesPosibles(token: string): Promise<Localidad[]> {
    try {
      console.log("🌍 === OBTENIENDO ORÍGENES POSIBLES ===")

      const url = `${API_BASE_URL}${API_ROUTES.LOCALIDADES_ORIGENES_POSIBLES}`
      console.log("🌐 URL:", url)

      const response = await fetch(url, {
        method: "GET",
        headers: this.getAuthHeaders(token),
      })

      console.log("📊 Response status:", response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("❌ Error response:", errorText)
        throw new Error(`Error ${response.status}: ${errorText}`)
      }

      const result = await response.json()
      console.log("✅ Orígenes obtenidos:", result.length, "localidades")

      return result
    } catch (error: any) {
      console.error("💥 Error en getOrigenesPosibles:", error)
      if (error.message.includes("fetch") || error.message.includes("Network request failed")) {
        throw new Error("Error de conexión. Verifica tu internet.")
      }
      throw error
    }
  }

  // ✅ ACTUALIZADO: Usar la ruta constante
  async getDestinosPosibles(token: string, origenId: number): Promise<Localidad[]> {
    try {
      console.log("🎯 === OBTENIENDO DESTINOS POSIBLES ===")
      console.log("📍 Origen ID:", origenId)

      const url = `${API_BASE_URL}${API_ROUTES.LOCALIDADES_DESTINOS_POSIBLES}/${origenId}`
      console.log("🌐 URL:", url)

      const response = await fetch(url, {
        method: "GET",
        headers: this.getAuthHeaders(token),
      })

      console.log("📊 Response status:", response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("❌ Error response:", errorText)
        throw new Error(`Error ${response.status}: ${errorText}`)
      }

      const result = await response.json()
      console.log("✅ Destinos obtenidos:", result.length, "localidades")

      return result
    } catch (error: any) {
      console.error("💥 Error en getDestinosPosibles:", error)
      if (error.message.includes("fetch") || error.message.includes("Network request failed")) {
        throw new Error("Error de conexión. Verifica tu internet.")
      }
      throw error
    }
  }

  // ✅ NUEVO: Método para obtener todas las localidades (útil para otros casos)
  async getAllLocalidades(token: string): Promise<Localidad[]> {
    try {
      console.log("🌍 === OBTENIENDO TODAS LAS LOCALIDADES ===")

      const url = `${API_BASE_URL}${API_ROUTES.LOCALIDADES_ALL}`
      console.log("🌐 URL:", url)

      const response = await fetch(url, {
        method: "GET",
        headers: this.getAuthHeaders(token),
      })

      console.log("📊 Response status:", response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("❌ Error response:", errorText)
        throw new Error(`Error ${response.status}: ${errorText}`)
      }

      const result = await response.json()
      console.log("✅ Todas las localidades obtenidas:", result.length, "localidades")

      return result
    } catch (error: any) {
      console.error("💥 Error en getAllLocalidades:", error)
      if (error.message.includes("fetch") || error.message.includes("Network request failed")) {
        throw new Error("Error de conexión. Verifica tu internet.")
      }
      throw error
    }
  }
}

export const locationService = new LocationService()

// Exportar funciones individuales para compatibilidad
export const getOrigenesPosibles = (token: string) => locationService.getOrigenesPosibles(token)
export const getDestinosPosibles = (token: string, origenId: number) =>
  locationService.getDestinosPosibles(token, origenId)
export const getAllLocalidades = (token: string) => locationService.getAllLocalidades(token)

export type { Localidad }
