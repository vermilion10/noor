import { ref } from 'vue'
import axios from 'axios'

export interface JuzAyah {
  number: number // ayat number overall
  numberInSurah: number
  text: string // arabic
  translationText: string
  surah: {
    number: number
    name: string
    englishName: string
    englishNameTranslation: string
  }
}

export function useJuz() {
  const loading = ref(false)
  const error = ref<string | null>(null)
  const currentJuz = ref<{ id: number; ayahs: JuzAyah[] } | null>(null)

  const fetchJuz = async (id: number) => {
    loading.value = true
    error.value = null

    try {
      const [arabRes, transRes] = await Promise.all([
        axios.get(`https://api.alquran.cloud/v1/juz/${id}/quran-uthmani`),
        axios.get(`https://api.alquran.cloud/v1/juz/${id}/id.indonesian`)
      ])

      const arabAyahs = arabRes.data.data.ayahs
      const transAyahs = transRes.data.data.ayahs

      const mergedAyahs: JuzAyah[] = arabAyahs.map((a: any, idx: number) => {
        let cleanText = a.text
        if (a.numberInSurah === 1 && a.surah.number !== 1 && a.surah.number !== 9) {
          // Ganti variasi Bismillah di quran-uthmani Alquran.cloud
          cleanText = cleanText.replace(/^بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ\s*/, '')
          cleanText = cleanText.replace(/^بِسۡمِ ٱللَّهِ ٱلرَّحۡمَٰنِ ٱلرَّحِیمِ\s*/, '')
        }
        return {
          number: a.number,
          numberInSurah: a.numberInSurah,
          text: cleanText,
          translationText: transAyahs[idx].text,
          surah: a.surah
        }
      })

      currentJuz.value = { id, ayahs: mergedAyahs }
    } catch (err: any) {
      error.value = err.message || 'Gagal memuat Juz'
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    error,
    currentJuz,
    fetchJuz
  }
}
