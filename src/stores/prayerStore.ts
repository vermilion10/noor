import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { PrayerTimes } from '@/composables/usePrayerTimes'

export const usePrayerStore = defineStore('prayer', () => {
  const isAutoLocation = ref(true)
  const latitude = ref<number | null>(null)
  const longitude = ref<number | null>(null)
  const cityId = ref<string>('1301') // default Jakarta
  const locationName = ref('Lokasi Saat Ini')
  const locationMeta = ref('')
  
  const cachedDate = ref('')
  const cachedTimes = ref<PrayerTimes | null>(null)

  function setLocation(lat: number | null, lng: number | null, name: string = 'Lokasi Terdeteksi', id?: string) {
    latitude.value = lat
    longitude.value = lng
    locationName.value = name
    if (id) cityId.value = id
  }

  function setCachedTimes(times: PrayerTimes, date: string) {
    cachedTimes.value = times
    cachedDate.value = date
  }

  return {
    isAutoLocation,
    latitude,
    longitude,
    cityId,
    locationName,
    locationMeta,
    cachedDate,
    cachedTimes,
    setLocation,
    setCachedTimes
  }
}, {
  persist: true
})
