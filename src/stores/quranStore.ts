import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface LastRead {
  surahId: number
  surahName: string
  ayahNumber: number
}

export const useQuranStore = defineStore('quran', () => {
  const lastRead = ref<LastRead | null>(null)
  
  const showTranslation = ref(true)
  const isMushafMode = ref(false)
  const currentQari = ref('01')
  
  const setLastRead = (surahId: number, surahName: string, ayahNumber: number) => {
    lastRead.value = { surahId, surahName, ayahNumber }
  }

  const toggleTranslation = () => {
    showTranslation.value = !showTranslation.value
  }

  return {
    lastRead,
    showTranslation,
    isMushafMode,
    currentQari,
    setLastRead,
    toggleTranslation
  }
}, {
  persist: true
})
