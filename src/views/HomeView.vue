<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useOdojStore } from '@/stores/odojStore'
import { usePrayerStore } from '@/stores/prayerStore'
import { useQuranStore } from '@/stores/quranStore'
import { usePrayerTimes } from '@/composables/usePrayerTimes'
import { Activity, Flame, ChevronRight, BookOpen } from 'lucide-vue-next'
import axios from 'axios'

const router = useRouter()
const odojStore = useOdojStore()
const prayerStore = usePrayerStore()
const quranStore = useQuranStore()

const verseOfDay = ref<{ arab: string, terjemahan: string, meta: string } | null>(null)

const fetchVerseOfDay = async () => {
  const todayStr = new Date().toLocaleDateString('en-CA')
  const cached = localStorage.getItem('verseOfDay')
  if (cached) {
    const parsed = JSON.parse(cached)
    if (parsed.date === todayStr) {
      verseOfDay.value = parsed.data
      return
    }
  }

  try {
    const randomAyahNumber = Math.floor(Math.random() * 6236) + 1
    const res = await axios.get(`https://api.alquran.cloud/v1/ayah/${randomAyahNumber}/editions/quran-uthmani,id.indonesian`)
    if (res.data.code === 200) {
      const arabData = res.data.data[0]
      const idData = res.data.data[1]
      
      const v = {
        arab: arabData.text,
        terjemahan: idData.text,
        meta: `${arabData.surah.englishName}: ${arabData.numberInSurah}`
      }
      verseOfDay.value = v
      localStorage.setItem('verseOfDay', JSON.stringify({ date: todayStr, data: v }))
    }
  } catch (err) {
    console.error('Failed to fetch verse of the day', err)
  }
}

onMounted(() => {
  fetchVerseOfDay()
  odojStore.fetchHijriDate()
  odojStore.syncTodayTarget()
})

const getTodayJuz = () => {
  if (odojStore.odojMode === 'hijri') {
    const dStr = new Intl.DateTimeFormat('en-u-ca-islamic', { day: 'numeric' }).format(new Date())
    let day = parseInt(dStr, 10)
    if (day > 30) day = 1
    return day
  } else {
    let day = new Date().getDate()
    if (day > 30) day = 1
    return day
  }
}

const currentHijriDate = computed(() => odojStore.currentHijriDate)
</script>

<template>
  <div class="p-4 space-y-6 pb-20 overflow-x-hidden">
    <!-- Header -->
    <header class="py-4 mt-2 flex justify-between items-center">
      <div>
        <h1 class="text-3xl font-extrabold bg-gradient-to-r from-noor-primary to-noor-accent bg-clip-text text-transparent transform origin-left hover:scale-105 transition-transform duration-300">
          Noor
        </h1>
        <p class="text-noor-subtle font-medium mt-1">Sobat Ibadah Harianmu</p>
        <p class="text-[11px] font-semibold text-noor-primary mt-1">{{ currentHijriDate }}</p>
      </div>
      
      <button @click="router.push(`/juz/${getTodayJuz()}`)" class="flex flex-col items-center justify-center py-2 px-4 rounded-2xl bg-noor-primary/10 border border-noor-primary/20 hover:bg-noor-primary/20 transition-all text-noor-primary relative max-w-[120px]">
        <span class="text-[10px] font-bold uppercase tracking-widest leading-tight">Hari Ini <span class="opacity-70">({{ odojStore.odojMode === 'hijri' ? 'Hijri' : 'Masehi' }})</span></span>
        <span class="font-black text-xl leading-none mt-1">Juz {{ getTodayJuz() }}</span>
      </button>
    </header>

    <div 
      @click="router.push('/odoj')"
      class="bg-noor-surface p-6 rounded-[2rem] border border-noor-border relative overflow-hidden cursor-pointer hover:border-noor-primary transition-all group shadow-sm active:scale-95"
    >
      <div class="absolute -right-10 -top-10 w-40 h-40 bg-noor-primary/5 rounded-full blur-2xl group-hover:bg-noor-primary/10 transition-colors"></div>
      
      <div class="flex justify-between items-start relative z-10">
        <div>
          <h3 class="font-bold text-noor-text flex items-center space-x-2 text-lg">
            <BookOpen :size="18" class="text-noor-primary" />
            <span>Target ODOJ</span>
          </h3>
          <p class="text-noor-subtle text-sm mt-1">Progress Hari Ini</p>
        </div>
        <div class="bg-noor-bg p-2 rounded-full text-noor-primary">
          <ChevronRight :size="20" />
        </div>
      </div>
      
      <div class="mt-8 relative z-10">
        <div class="flex justify-between items-end mb-2">
          <span class="text-3xl font-bold font-mono text-noor-text">
            
          </span>
          <span class="font-bold text-noor-primary">{{ Math.round(odojStore.todayProgressPercent) }}%</span>
        </div>
        
        <div class="w-full bg-noor-bg rounded-full h-3 overflow-hidden shadow-inner flex">
          <div 
            class="bg-gradient-to-r from-noor-primary to-noor-accent h-full rounded-full transition-all duration-1000 ease-out relative" 
            :style="`width: ${odojStore.todayProgressPercent}%`"
          >
            <div class="absolute inset-0 bg-white/20 w-1/2 -skew-x-12 translate-x-full animate-[shimmer_2s_infinite]"></div>
          </div>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-2 gap-4">
      <div class="bg-noor-surface p-5 rounded-3xl border border-noor-border flex flex-col items-center justify-center text-center shadow-sm">
        <div class="w-12 h-12 rounded-full flex items-center justify-center mb-3"
             :class="odojStore.currentStreak > 0 ? 'bg-orange-500/10 text-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.2)]' : 'bg-noor-bg text-noor-muted'">
          <Flame :size="24" :class="{ 'fill-orange-500': odojStore.currentStreak > 0 }" />
        </div>
        <span class="text-2xl font-black font-mono text-noor-text">{{ odojStore.currentStreak }}</span>
        <span class="text-[10px] uppercase font-bold text-noor-subtle tracking-wider mt-1">Hari Beruntun</span>
      </div>

      <!-- Prayer Mini Widget -->
      <div class="bg-noor-surface p-5 rounded-3xl border border-noor-border flex flex-col items-center justify-center text-center shadow-sm" @click="router.push('/prayer')">
        <div class="w-12 h-12 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center mb-3">
          <Activity :size="24" />
        </div>
        <span class="text-[10px] uppercase font-bold text-noor-subtle tracking-wider mb-1">Jadwal Sholat</span>
        <span class="text-sm font-bold text-noor-text line-clamp-1 px-2 border-b border-noor-border/50 pb-1 w-full truncate">
          {{ prayerStore.locationName || 'Belum diatur' }}
        </span>
      </div>
    </div>

    <div class="bg-transparent p-6 rounded-[2rem] border-2 border-noor-surface flex flex-col items-center text-center relative overflow-hidden">
      <div class="absolute top-0 right-0 w-32 h-32 bg-noor-primary/5 rounded-full blur-xl translate-x-10 -translate-y-10"></div>
      <div class="absolute bottom-0 left-0 w-24 h-24 bg-noor-accent/5 rounded-full blur-xl -translate-x-10 translate-y-10"></div>

      <span class="text-[10px] font-bold tracking-widest text-noor-primary uppercase mb-6 bg-noor-primary/10 px-3 py-1 rounded-full">Ayat Hari Ini</span>
      
      <template v-if="verseOfDay">
        <p class="arabic-text text-3xl mb-4 text-noor-text leading-[2.5]">
          {{ verseOfDay.arab }}
        </p>
        <p class="text-[15px] font-medium text-noor-subtle mb-4 leading-relaxed max-w-sm">
          "{{ verseOfDay.terjemahan }}"
        </p>
        <span class="text-xs font-bold text-noor-muted tracking-widest uppercase">
          {{ verseOfDay.meta }}
        </span>
      </template>
      <template v-else>
        <div class="animate-pulse space-y-4 w-full flex flex-col items-center">
          <div class="h-8 bg-noor-surface w-3/4 rounded shrink-0"></div>
          <div class="h-4 bg-noor-surface w-full rounded shrink-0"></div>
          <div class="h-4 bg-noor-surface w-5/6 rounded shrink-0"></div>
        </div>
      </template>
    </div>

  </div>
</template>
