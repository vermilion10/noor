import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getAyahCountForJuz } from '@/utils/quranUtils'

export interface DailyRecord {
  dateStr: string // YYYY-MM-DD
  ayatRead: number
  target: number
}

export const useOdojStore = defineStore('odoj', () => {
  const dailyTargetAyat = ref(200)// f allback default
  const history = ref<DailyRecord[]>([])
  
  const readAyahsToday = ref<Record<string, string[]>>({})

  const odojMode = ref<'hijri' | 'masehi'>('hijri')

  const getCurrentDateStr = (d: Date = new Date()) => {
    if (odojMode.value === 'hijri') {
      return new Intl.DateTimeFormat('en-u-ca-islamic', {day: 'numeric', month: 'numeric', year: 'numeric'}).format(d)
    } else {
      return d.toLocaleDateString('en-CA')
    }
  }

  const getTodayRecord = () => {
    const today = getCurrentDateStr()
    let record = history.value.find(r => r.dateStr === today)
    
    if (!record) {
      const target = getAyahCountForJuz(getTodayJuz())
      record = { dateStr: today, ayatRead: 0, target: target }
      history.value.push(record)
    }
    return record
  }

  const addAyatRead = (ayat: number) => {
    const record = getTodayRecord()
    record.ayatRead += ayat
    if (history.value.length > 365) history.value.shift()
  }

  const markAyahAsRead = (surahId: number | string, ayahNumber: number) => {
    const today = getCurrentDateStr()
    const key = `${surahId}:${ayahNumber}`
    
    if (!readAyahsToday.value[today]) {
      readAyahsToday.value[today] = []
    }
    
    if (!readAyahsToday.value[today].includes(key)) {
      readAyahsToday.value[today].push(key)
      addAyatRead(1)
    }
  }

  const setDailyTarget = (target: number) => {
    dailyTargetAyat.value = target
    const record = getTodayRecord()
    record.target = target
  }

  const getTodayJuz = () => {
    if (odojMode.value === 'hijri') {
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

  const syncTodayTarget = () => {
    const record = getTodayRecord()
    const juzId = getTodayJuz()
    const exactAyatCount = getAyahCountForJuz(juzId)
    
    if (record.target === 200 || record.target === 0 || record.ayatRead === 0) {
      setDailyTarget(exactAyatCount)
    }
  }

  const todayProgressPercent = computed(() => {
    const record = getTodayRecord()
    // safe guard
    if (record.target === 0) return 0
    return Math.min((record.ayatRead / record.target) * 100, 100)
  })

  // Hitung hari beruntun (streak)
  const currentStreak = computed(() => {
    let streak = 0
    let currentDate = new Date()
    
    const todayStr = getCurrentDateStr(currentDate)
    const todayRecord = history.value.find(r => r.dateStr === todayStr)
    
    if (!todayRecord || todayRecord.ayatRead < todayRecord.target) {
       currentDate.setDate(currentDate.getDate() - 1)
    }
    
    while (true) {
      const checkDateStr = getCurrentDateStr(currentDate)
      const record = history.value.find(r => r.dateStr === checkDateStr)
      if (record && record.ayatRead >= record.target) {
        streak++
        currentDate.setDate(currentDate.getDate() - 1)
      } else {
        break
      }
    }
    
    return streak
  })

  const getWeeklyData = () => {
    const days = []
    const reads = []
    const d = new Date()
    
    for (let i = 6; i >= 0; i--) {
      const past = new Date(d)
      past.setDate(past.getDate() - i)
      const dateStr = getCurrentDateStr(past)
      const label = past.toLocaleDateString('id-ID', { weekday: 'short' })
      
      const record = history.value.find(r => r.dateStr === dateStr)
      days.push(label)
      reads.push(record ? record.ayatRead : 0)
    }
    
    return { days, reads }
  }

  return {
    dailyTargetAyat,
    history,
    odojMode,
    getTodayJuz,
    getAyahCountForJuz,
    syncTodayTarget,
    getTodayRecord,
    addAyatRead,
    markAyahAsRead,
    setDailyTarget,
    todayProgressPercent,
    currentStreak,
    getWeeklyData
  }
}, {
  persist: true
})
