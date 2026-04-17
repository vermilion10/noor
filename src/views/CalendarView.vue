<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, ChevronLeft, ChevronRight, Info } from 'lucide-vue-next'
import axios from 'axios'

const router = useRouter()
const goBack = () => router.push('/more')

const currentDate = ref(new Date())
const currentMonth = computed(() => currentDate.value.getMonth())
const currentYear = computed(() => currentDate.value.getFullYear())

const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']

interface HijriDay {
  gregorian: { day: string; date: string }
  hijri: { 
    day: string
    month: { en: string; ar: string }
    year: string
    holidays: string[]
  }
}

const calendarData = ref<HijriDay[]>([])
const loading = ref(true)

const fetchCalendar = async () => {
  loading.value = true
  const month = currentMonth.value + 1
  const year = currentYear.value
  try {
    const res = await axios.get(`https://api.aladhan.com/v1/gToHCalendar/${month}/${year}`)
    if (res.data?.code === 200) {
      calendarData.value = res.data.data
    }
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchCalendar()
})

const prevMonth = () => {
  currentDate.value = new Date(currentYear.value, currentMonth.value - 1, 1)
  fetchCalendar()
}

const nextMonth = () => {
  currentDate.value = new Date(currentYear.value, currentMonth.value + 1, 1)
  fetchCalendar()
}

const calendarGrid = computed(() => {
  const firstDay = new Date(currentYear.value, currentMonth.value, 1).getDay()
  const daysInMonth = new Date(currentYear.value, currentMonth.value + 1, 0).getDate()
  
  const grid = []
  
  for (let i = 0; i < firstDay; i++) {
    grid.push(null)
  }
  
  for (let i = 1; i <= daysInMonth; i++) {
    const dayData = calendarData.value.find(d => parseInt(d.gregorian.day) === i)
    grid.push({
      dateStr: i,
      hijriDay: dayData?.hijri.day,
      hijriMonth: dayData?.hijri.month.ar,
      holidays: dayData?.hijri.holidays || []
    })
  }
  
  return grid
})

const todayString = new Date().getDate().toString()
const isCurrentMonthToday = computed(() => {
  const now = new Date()
  return now.getMonth() === currentMonth.value && now.getFullYear() === currentYear.value
})

const isPuasaSunnah = (hijriDayStr?: string) => {
  if (!hijriDayStr) return false
  const day = parseInt(hijriDayStr)
  // Ayyamul Bidh (13, 14, 15)
  return day === 13 || day === 14 || day === 15
}

const translateHoliday = (name: string) => {
  const translations: Record<string, string> = {
    'Arafa': 'Puasa Arafah',
    'Ashura': 'Puasa Asyura',
    'Eid-ul-Fitr': 'Idul Fitri',
    'Eid-ul-Adha': 'Idul Adha',
    '1st Day of Ramadan': 'Awal Ramadan (Puasa)',
    'Islamic New Year': 'Tahun Baru Islam (1 Muharram)',
    'Mawlid al-Nabi': 'Maulid Nabi Muhammad SAW',
    '10 Last Days of Ramadan': '10 Malam Terakhir Ramadan',
    '10 First Days of Dhul Hijjah': '10 Hari Pertama Zulhijah',
    'Isra and Mi\'raj': 'Isra Mikraj'
  }
  return translations[name] || name
}

const currentHolidays = computed(() => {
  const list: { date: string, name: string }[] = []
  calendarGrid.value.forEach(day => {
    if (day && day.holidays && day.holidays.length > 0) {
      const uniqueHols: string[] = Array.from(new Set(day.holidays))
      const translated = uniqueHols.map(h => translateHoliday(h)).join(' & ')
      list.push({ 
        date: `${day.dateStr} ${monthNames[currentMonth.value]}`, 
        name: translated 
      })
    }
  })
  return list
})

</script>

<template>
  <div class="bg-noor-bg min-h-screen pb-20">
    <!-- Navbar -->
    <header class="sticky top-0 bg-noor-surface/90 backdrop-blur-md z-30 shadow-sm border-b border-noor-border transition-all">
      <div class="flex items-center justify-between px-4 py-3">
        <button @click="goBack" class="p-2 -ml-2 rounded-full hover:bg-noor-border/50 transition-colors">
          <ArrowLeft :size="24" class="text-noor-text" />
        </button>
        <div class="text-center flex-1">
          <h1 class="text-lg font-bold text-noor-text tracking-wide">Kalender</h1>
        </div>
        <div class="w-8"></div>
      </div>
    </header>

    <div class="p-4 space-y-6">
      <!-- Calendar Container MD3 -->
      <div class="bg-noor-surface rounded-3xl border border-noor-border shadow-md p-4 sm:p-6">
        
        <!-- Controls -->
        <div class="flex justify-between items-center mb-6">
          <button @click="prevMonth" class="p-2 rounded-full bg-noor-bg text-noor-subtle hover:text-noor-primary">
            <ChevronLeft :size="20" />
          </button>
          
          <div class="text-center">
            <h2 class="text-xl font-bold text-noor-text">{{ monthNames[currentMonth] }} {{ currentYear }}</h2>
            <p v-if="calendarData.length" class="text-sm text-noor-primary font-medium mt-1">
              {{ calendarData[0].hijri.month.en }} / {{ calendarData[calendarData.length-1].hijri.month.en }} {{ calendarData[0].hijri.year }} H
            </p>
          </div>
          
          <button @click="nextMonth" class="p-2 rounded-full bg-noor-bg text-noor-subtle hover:text-noor-primary">
            <ChevronRight :size="20" />
          </button>
        </div>

        <!-- Weekdays -->
        <div class="grid grid-cols-7 gap-1 sm:gap-2 mb-2 text-center text-xs font-bold text-noor-muted uppercase tracking-wider">
          <div>Min</div><div>Sen</div><div>Sel</div><div>Rab</div><div>Kam</div><div>Jum</div><div>Sab</div>
        </div>

        <!-- Loading -->
        <div v-if="loading" class="grid grid-cols-7 gap-1 sm:gap-2">
          <div v-for="i in 35" :key="i" class="aspect-square bg-noor-bg rounded-2xl animate-pulse"></div>
        </div>

        <!-- Grid -->
        <div v-else class="grid grid-cols-7 gap-1 sm:gap-2 relative">
          <div 
            v-for="(day, idx) in calendarGrid" 
            :key="idx"
            class="aspect-square rounded-2xl flex flex-col items-center justify-center relative p-1 sm:p-2 border transition-colors"
            :class="[
               day ? 'bg-noor-bg' : 'bg-transparent border-transparent',
               isCurrentMonthToday && day?.dateStr == todayString ? 'border-noor-primary bg-noor-primary/10 shadow-[0_0_15px_rgba(74,124,89,0.2)]' : 'border-transparent',
               day?.holidays?.length ? 'border-amber-400/50 bg-amber-400/5' : ''
            ]"
          >
            <template v-if="day">
              <span class="text-sm sm:text-base font-bold text-noor-text z-10" :class="{ 'text-noor-primary': isCurrentMonthToday && day.dateStr == todayString }">
                {{ day.dateStr }}
              </span>
              <span class="text-[9px] sm:text-[10px] text-noor-subtle font-medium mt-1">
                {{ day.hijriDay }}
              </span>
              
              <!-- Indicator dots -->
              <div class="absolute bottom-1 sm:bottom-2 left-0 w-full flex justify-center space-x-1">
                <!-- Puasa Sunnah Indicator (Green) -->
                <div v-if="isPuasaSunnah(day.hijriDay)" class="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-noor-primary rounded-full drop-shadow-md"></div>
                <!-- Holiday Indicator (Amber) -->
                <div v-if="day.holidays?.length" class="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-amber-400 rounded-full drop-shadow-md" :title="day.holidays.join(', ')"></div>
              </div>
            </template>
          </div>
        </div>
      </div>

      <!-- Legend -->
      <div class="bg-noor-surface p-4 rounded-2xl border border-noor-border flex flex-col space-y-3">
        <h3 class="text-sm font-bold text-noor-text flex items-center space-x-2">
          <Info :size="16" /> <span>Keterangan</span>
        </h3>
        <div class="flex items-center space-x-2 text-sm text-noor-subtle">
          <div class="w-3 h-3 bg-noor-primary rounded-full"></div>
          <span>Puasa Sunnah (Ayyamul Bidh)</span>
        </div>
        <div class="flex items-center space-x-2 text-sm text-noor-subtle">
          <div class="w-3 h-3 bg-amber-400 rounded-full"></div>
          <span>Hari Penting / Libur Islam</span>
        </div>
      </div>

      <!-- Holidays List -->
      <div v-if="currentHolidays && currentHolidays.length" class="bg-noor-surface p-4 sm:p-5 rounded-3xl border border-noor-border">
        <h3 class="text-sm font-bold text-noor-text mb-4">Momen Bulan Ini</h3>
        <div class="space-y-3">
          <div v-for="(hol, idx) in currentHolidays" :key="idx" class="flex flex-col border-b border-noor-border/50 pb-2 last:border-0 last:pb-0">
            <span class="text-xs text-noor-muted font-bold tracking-widest uppercase">{{ hol.date }}</span>
            <span class="text-noor-primary font-medium">{{ hol.name }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
