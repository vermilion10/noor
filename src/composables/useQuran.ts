import { ref } from 'vue'
import axios from 'axios'

export interface SurahSummary {
  nomor: number
  nama: string
  namaLatin: string
  jumlahAyat: number
  tempatTurun: string
  arti: string
  deskripsi: string
  audioFull: Record<string, string>
}

export interface Ayat {
  nomorAyat: number
  teksArab: string
  teksLatin: string
  teksIndonesia: string
  audio: Record<string, string>
}

export interface SurahDetail extends SurahSummary {
  ayat: Ayat[]
}

const EQURAN_V2_URL = 'https://equran.id/api/v2'

export function useQuran() {
  const surahList = ref<SurahSummary[]>([])
  const currentSurah = ref<SurahDetail | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchSurahList = async () => {
    if (surahList.value.length > 0) return

    loading.value = true
    error.value = null
    try {
      const response = await axios.get(`${EQURAN_V2_URL}/surat`)
      if (response.data?.code === 200) {
        surahList.value = response.data.data
      } else {
        error.value = 'Failed to load surah list'
      }
    } catch (err: any) {
      error.value = err.message || 'Error occurred'
    } finally {
      loading.value = false
    }
  }

  const fetchSurahDetail = async (id: number) => {
    loading.value = true
    error.value = null
    currentSurah.value = null
    try {
      const response = await axios.get(`${EQURAN_V2_URL}/surat/${id}`)
      if (response.data?.code === 200) {
        currentSurah.value = response.data.data
      } else {
        error.value = 'Failed to load surah detail'
      }
    } catch (err: any) {
      error.value = err.message || 'Error occurred'
    } finally {
      loading.value = false
    }
  }

  return {
    surahList,
    currentSurah,
    loading,
    error,
    fetchSurahList,
    fetchSurahDetail
  }
}
