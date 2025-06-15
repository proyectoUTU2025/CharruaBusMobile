"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../context/AuthContext"
import { useUser } from "./useUser"
import { pasajeService, type PasajeDto } from "../services/pasajeService"

interface UseTicketDetailReturn {
  ticket: PasajeDto | null
  loading: boolean
  error: string | null
  refetch: () => void
}

export const useTicketDetail = (ticketId: number): UseTicketDetailReturn => {
  const { token } = useAuth()
  const { user } = useUser()
  const [ticket, setTicket] = useState<PasajeDto | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTicketDetail = async () => {
    if (!token || !user?.id || !ticketId) {
      setError("Información de usuario no disponible")
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      // Como no hay endpoint específico para obtener un pasaje por ID,
      // obtenemos el historial filtrado por ID (simulación)
      const response = await pasajeService.obtenerHistorialPasajes(
        Number.parseInt(user.id),
        user.email,
        {
          estados: [], // Todos los estados
        },
        {
          page: 0,
          size: 100, // Tamaño grande para asegurar que encontremos el pasaje
          sort: "viajeAsiento.viaje.fechaHoraSalida,desc",
        },
        token,
      )

      // Buscar el pasaje específico en los resultados
      const foundTicket = response.content.find((p) => p.id === ticketId)

      if (foundTicket) {
        setTicket(foundTicket)
      } else {
        setError("Pasaje no encontrado")
      }
    } catch (error: any) {
      console.error("Error obteniendo detalle del pasaje:", error)
      setError(error.message || "Error al cargar el detalle del pasaje")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTicketDetail()
  }, [ticketId, token, user])

  const refetch = () => {
    fetchTicketDetail()
  }

  return {
    ticket,
    loading,
    error,
    refetch,
  }
}
