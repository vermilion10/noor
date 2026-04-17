import { ref } from 'vue'
import axios from 'axios'
import { usePrayerStore } from '@/stores/prayerStore'

export interface PrayerTimes {
  Fajr: string
  Dhuhr: string
  Asr: string
  Maghrib: string
  Isha: string
  Sunrise: string
}

export function usePrayerTimes() {
  const store = usePrayerStore()
  const loading = ref(false)
  const error = ref<string | null>(null)
  const times = ref<PrayerTimes | null>(null)

  const fetchPrayerTimes = async (cityId: string) => {
    loading.value = true
    error.value = null
    
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    const today = `${year}-${month}-${day}`
    
    if (store.cachedDate === today && store.cachedTimes && store.locationMeta === cityId) {
      times.value = store.cachedTimes
      loading.value = false
      return
    }

    try {
      const response = await axios.get(`https://api.myquran.com/v2/sholat/jadwal/${cityId}/${year}/${month}/${day}`)

      if (response.data?.status === true) {
        const t = response.data.data.jadwal
        times.value = {
          Fajr: t.subuh,
          Sunrise: t.terbit || t.imsak, 
          Dhuhr: t.dzuhur,
          Asr: t.ashar,
          Maghrib: t.maghrib,
          Isha: t.isya
        }
        
        store.setCachedTimes(times.value, today)
        store.locationMeta = cityId
      }
    } catch (err: any) {
      error.value = err.message || 'Gagal memuat jadwal sholat'
    } finally {
      loading.value = false
    }
  }

  return {
    times,
    loading,
    error,
    fetchPrayerTimes
  }
}
