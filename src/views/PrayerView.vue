<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import axios from 'axios'
import { MapPin, RefreshCw, Navigation } from 'lucide-vue-next'
import { useGeolocation } from '@/composables/useGeolocation'
import { usePrayerTimes } from '@/composables/usePrayerTimes'
import { usePrayerStore } from '@/stores/prayerStore'
import QiblaCompass from '@/components/prayer/QiblaCompass.vue'

const { isSupported, coords, error: geoError, isLocating, locate } = useGeolocation()
const { times, loading: timesLoading, error: timesError, fetchPrayerTimes } = usePrayerTimes()
const store = usePrayerStore()

// Jakarta fallback
const DEFAULT_LAT = -6.2088
const DEFAULT_LNG = 106.8456

const currentTime = ref(new Date())
let timerStr: ReturnType<typeof setInterval>

const showCitySelector = ref(false)
const citySearchQuery = ref('')
const searchResults = ref<{ id: string, lokasi: string }[]>([])
const isSearching = ref(false)

const handleCitySearch = async () => {
  if (citySearchQuery.value.length < 3) {
    searchResults.value = []
    return
  }
  isSearching.value = true
  try {
    const res = await axios.get(`https://api.myquran.com/v2/sholat/kota/cari/${citySearchQuery.value}`)
    if (res.data.status) {
      searchResults.value = res.data.data
    } else {
      searchResults.value = []
    }
  } catch (err) {
    searchResults.value = []
  } finally {
    isSearching.value = false
  }
}

const selectCity = async (id: string, name: string) => {
  store.setLocation(store.latitude, store.longitude, name, id)
  showCitySelector.value = false
  await fetchPrayerTimes(id)
}

const loadPrayerTimes = async () => {
  if (store.isAutoLocation && isSupported) {
    const pos = await locate().catch(()=>null)
    if (pos) store.setLocation(pos.latitude, pos.longitude, store.locationName, store.cityId)
  }
  await fetchPrayerTimes(store.cityId)
}

onMounted(() => {
  loadPrayerTimes()
  timerStr = setInterval(() => {
    currentTime.value = new Date()
  }, 1000)
})

onUnmounted(() => {
  if (timerStr) clearInterval(timerStr)
})

// determine next prayer
interface NextPrayerInfo {
  name: string
  timeStr: string
  diffMs: number
}

const nextPrayer = computed<NextPrayerInfo | null>(() => {
  if (!times.value) return null
  
  const now = currentTime.value
  const orderedKeys = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'] as const
  
  for (const name of orderedKeys) {
    const timeString = times.value[name]
    const [h, m] = timeString.split(':')
    const prayerDate = new Date(now)
    prayerDate.setHours(parseInt(h), parseInt(m), 0, 0)
    
    if (prayerDate > now) {
      return {
        name,
        timeStr: timeString,
        diffMs: prayerDate.getTime() - now.getTime()
      }
    }
  }
  
  // If all passed, next is subuh tomorrow
  const timeString = times.value['Fajr']
  const [h, m] = timeString.split(':')
  const tomorrowFajr = new Date(now)
  tomorrowFajr.setDate(tomorrowFajr.getDate() + 1)
  tomorrowFajr.setHours(parseInt(h), parseInt(m), 0, 0)
  
  return {
    name: 'Fajr',
    timeStr: timeString,
    diffMs: tomorrowFajr.getTime() - now.getTime()
  }
})

const countdownFormatted = computed(() => {
  if (!nextPrayer.value) return '--:--:--'
  const diffMs = nextPrayer.value.diffMs
  const h = Math.floor(diffMs / 3600000).toString().padStart(2, '0')
  const m = Math.floor((diffMs % 3600000) / 60000).toString().padStart(2, '0')
  const s = Math.floor((diffMs % 60000) / 1000).toString().padStart(2, '0')
  return `${h}:${m}:${s}`
})

const getPrayerNameID = (name: string) => {
  const map: Record<string, string> = {
    Fajr: 'Subuh',
    Sunrise: 'Matahari Terbit',
    Dhuhr: 'Dzuhur',
    Asr: 'Ashar',
    Maghrib: 'Maghrib',
    Isha: 'Isya'
  }
  return map[name] || name
}

const prayerList = computed(() => {
  if (!times.value) return []
  return [
    { key: 'Fajr', name: 'Subuh', time: times.value.Fajr },
    { key: 'Sunrise', name: 'Terbit', time: times.value.Sunrise },
    { key: 'Dhuhr', name: 'Dzuhur', time: times.value.Dhuhr },
    { key: 'Asr', name: 'Ashar', time: times.value.Asr },
    { key: 'Maghrib', name: 'Maghrib', time: times.value.Maghrib },
    { key: 'Isha', name: 'Isya', time: times.value.Isha },
  ]
})
</script>

<template>
  <div class="px-4 py-4 space-y-6 min-h-screen pb-20">
    <!-- Header with MD3 Location Chip -->
    <header class="py-2 flex justify-between items-center bg-noor-bg sticky top-0 z-10 font-sans">
      <h1 class="text-2xl font-bold text-noor-text">Sholat</h1>
      <button 
        @click="showCitySelector = true" 
        :disabled="isLocating || timesLoading"
        class="bg-noor-surface px-4 py-2 rounded-full flex items-center space-x-2 border border-noor-border text-xs font-semibold uppercase tracking-wider text-noor-primary hover:bg-noor-primary/10 transition-colors"
      >
        <component :is="isLocating ? RefreshCw : MapPin" :size="14" :class="{ 'animate-spin': isLocating }" />
        <span class="truncate max-w-[150px]">{{ store.locationName }}</span>
      </button>
    </header>
    
    <div v-if="geoError || timesError" class="bg-red-500/10 border border-red-500/30 text-red-500 p-4 rounded-2xl text-sm mb-4">
      {{ geoError || timesError }}
    </div>

    <!-- Countdown Hero Card (MD3 Primary Container Style) -->
    <div class="bg-noor-primary p-6 rounded-3xl text-center shadow-[0_8px_30px_rgb(0,0,0,0.12)] relative overflow-hidden transition-all duration-500"
         :class="{ 'opacity-50 blur-sm': timesLoading }">
      <!-- Decor / Background Elements -->
      <div class="absolute -top-20 -right-20 w-48 h-48 bg-white opacity-5 rounded-full blur-2xl"></div>
      <div class="absolute bottom-[-10px] left-[-10px] w-20 h-20 bg-noor-accent opacity-20 rounded-full blur-xl"></div>
      
      <p class="text-white/80 text-sm mb-1 font-medium tracking-wide uppercase">
        Menuju {{ nextPrayer ? getPrayerNameID(nextPrayer.name) : '...' }}
      </p>
      
      <h2 class="text-5xl font-bold text-white tracking-widest my-3 font-mono drop-shadow-lg">
        {{ countdownFormatted }}
      </h2>
      
      <p class="text-noor-subtle/80 bg-noor-bg/20 inline-block px-3 py-1 rounded-full text-xs mt-2 backdrop-blur-md">
        {{ store.locationMeta ? store.locationMeta.replace('_', ' ') : 'Waktu Setempat' }}
      </p>
    </div>

    <!-- Waktu Sholat Table -->
    <div class="space-y-3">
      <h3 class="text-noor-text font-bold text-lg mb-2 pl-2">Jadwal Hari Ini</h3>
      
      <div v-if="timesLoading" class="space-y-3">
        <div v-for="i in 6" :key="i" class="h-16 bg-noor-surface rounded-2xl animate-pulse"></div>
      </div>
      
      <div v-else class="grid gap-3">
        <div 
          v-for="p in prayerList" 
          :key="p.key"
          class="flex justify-between items-center px-6 py-4 rounded-2xl border transition-all"
          :class="[
            nextPrayer?.name === p.key 
              ? 'bg-noor-primary/10 border-noor-primary shadow-sm scale-[1.02]' 
              : 'bg-noor-surface border-noor-border hover:bg-noor-border/20'
          ]"
        >
          <div class="flex items-center space-x-3">
            <div class="w-2 h-2 rounded-full" :class="nextPrayer?.name === p.key ? 'bg-noor-primary animate-pulse' : 'bg-transparent'"></div>
            <span class="font-bold text-noor-text text-lg">{{ p.name }}</span>
          </div>
          <span class="text-noor-text font-mono text-xl" :class="{ 'font-bold text-noor-primary': nextPrayer?.name === p.key }">
            {{ p.time }}
          </span>
        </div>
      </div>
    </div>
    
    <div class="pt-6">
      <h3 class="text-noor-text font-bold text-lg mb-4 pl-2 flex items-center space-x-2">
        <Navigation :size="20" class="text-noor-primary" />
        <span>Kompas Kiblat</span>
      </h3>
      <QiblaCompass :latitude="store.latitude" :longitude="store.longitude" />
    </div>
    
    <!-- City Selection Modal -->
    <div v-if="showCitySelector" class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm" @click.self="showCitySelector = false">
      <div class="bg-noor-surface w-full max-w-lg sm:rounded-[2rem] rounded-t-[2rem] p-6 shadow-2xl border border-noor-border h-[80vh] flex flex-col animate-slide-up">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-xl font-bold text-noor-text">Pilih Kota</h3>
          <button @click="showCitySelector = false" class="p-2 bg-noor-bg rounded-full text-noor-subtle">✕</button>
        </div>
        
        <div class="relative mb-4">
          <input 
            v-model="citySearchQuery"
            @input="handleCitySearch"
            type="text" 
            placeholder="Cari Kota / Kabupaten..."
            class="w-full bg-noor-bg border border-noor-border text-noor-text rounded-full py-3 px-4 focus:outline-none focus:border-noor-primary"
          />
          <div v-if="isSearching" class="absolute right-4 top-3 animate-spin w-5 h-5 border-2 border-noor-primary border-t-transparent rounded-full"></div>
        </div>

        <div class="overflow-y-auto flex-1 space-y-2 pr-2">
          <p v-if="citySearchQuery.length > 0 && searchResults.length === 0 && !isSearching" class="text-center text-noor-subtle py-8">
            Kota tidak ditemukan
          </p>
          <div 
            v-for="city in searchResults" 
            :key="city.id"
            @click="selectCity(city.id, city.lokasi)"
            class="p-4 rounded-2xl border border-noor-border cursor-pointer hover:border-noor-primary hover:bg-noor-primary/5 transition-colors"
          >
            <span class="text-noor-text font-medium">{{ city.lokasi }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-slide-up { animation: slideUp 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
@keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
</style>
