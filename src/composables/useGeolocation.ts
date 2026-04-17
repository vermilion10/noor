import { ref } from 'vue'

export function useGeolocation() {
  const isSupported = 'navigator' in window && 'geolocation' in navigator
  const coords = ref<{ latitude: number; longitude: number } | null>(null)
  const error = ref<string | null>(null)
  const isLocating = ref(false)

  const locate = async (): Promise<{ latitude: number; longitude: number } | null> => {
    if (!isSupported) {
      error.value = 'Geolocation is not supported by your browser'
      return null
    }

    isLocating.value = true
    error.value = null

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          coords.value = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          }
          isLocating.value = false
          resolve(coords.value)
        },
        (err) => {
          let msg = 'Failed to get location'
          switch (err.code) {
            case err.PERMISSION_DENIED:
              msg = 'Akses lokasi ditolak'
              break
            case err.POSITION_UNAVAILABLE:
              msg = 'Informasi lokasi tidak tersedia'
              break
            case err.TIMEOUT:
              msg = 'Waktu permintaan lokasi habis'
              break
          }
          error.value = msg
          isLocating.value = false
          resolve(null)
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      )
    })
  }

  return {
    isSupported,
    coords,
    error,
    isLocating,
    locate
  }
}
