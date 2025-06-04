import NetInfo from "@react-native-community/netinfo"

export const checkNetworkConnection = async (): Promise<boolean> => {
  const netInfo = await NetInfo.fetch()
  return netInfo.isConnected ?? false
}

export const waitForConnection = (): Promise<boolean> => {
  return new Promise((resolve) => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      if (state.isConnected) {
        unsubscribe()
        resolve(true)
      }
    })
  })
}

export const handleNetworkError = (error: any): string => {
  if (error.message?.includes("Network request failed")) {
    return "Error de conexión. Verifica tu internet."
  }
  if (error.message?.includes("timeout")) {
    return "La conexión tardó demasiado. Intenta de nuevo."
  }
  return "Error de red. Verifica tu conexión."
}
