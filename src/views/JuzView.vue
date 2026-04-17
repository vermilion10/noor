<script setup lang="ts">
import { onMounted, watch, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import { useJuz } from '@/composables/useJuz'
import { useQuranStore } from '@/stores/quranStore'
import { useBookmarkStore } from '@/stores/bookmarkStore'
import { useOdojStore } from '@/stores/odojStore'
import { ArrowLeft, Settings2, BookmarkPlus, Info } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const { currentJuz, loading, error, fetchJuz } = useJuz()
const store = useQuranStore()
const bookmarkStore = useBookmarkStore()
const odojStore = useOdojStore()

let observer: IntersectionObserver | null = null

const activeTafsir = ref<{ ayat: number, teks: string } | null>(null)

const showTafsir = async (surahNumber: number, ayahNumber: number) => {
  activeTafsir.value = { ayat: ayahNumber, teks: 'Loading tafsir...' }
  try {
    const res = await axios.get(`https://equran.id/api/v2/tafsir/${surahNumber}`)
    if (res.data.code === 200) {
      const tafsirList = res.data.data.tafsir
      const specificTafsir = tafsirList.find((t: any) => t.ayat === ayahNumber)
      if (specificTafsir) {
        activeTafsir.value = { ayat: ayahNumber, teks: specificTafsir.teks }
      }
    }
  } catch (err) {
    activeTafsir.value = { ayat: ayahNumber, teks: 'Gagal memuat tafsir, coba lagi nanti.' }
  }
}

onMounted(() => {
  const id = Number(route.params.id)
  if (id) {
    fetchJuz(id)
  }
  setupObserver()
})

watch(() => route.params.id, (newId) => {
  if (newId) {
    fetchJuz(Number(newId))
    setTimeout(setupObserver, 1000)
  }
})

const setupObserver = () => {
  if (observer) observer.disconnect()

  observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const globalNumber = parseInt(entry.target.id.split('-')[1])
        const ayahData = currentJuz.value?.ayahs.find(a => a.number === globalNumber)
        if (ayahData) {
          odojStore.markAyahAsRead(ayahData.surah.number, ayahData.numberInSurah)
        }
      }
    })
  }, { threshold: 0.7 })

  const ayats = document.querySelectorAll('[id^="ayat-"]')
  ayats.forEach(el => observer?.observe(el))
}

const scrollToLastRead = () => {
  const lastRead = odojStore.lastReadOdoj
  if (lastRead && currentJuz.value) {
    const ayahData = currentJuz.value.ayahs.find(a => a.surah.number === lastRead.surahId && a.numberInSurah === lastRead.ayahNumber)
    if (ayahData) {
      const el = document.getElementById(`ayat-${ayahData.number}`)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }
  }
}

watch(() => currentJuz.value, () => {
  setTimeout(() => {
    setupObserver()
    scrollToLastRead()
  }, 500)
})

const goBack = () => router.push('/quran')

const saveBookmark = (surahId: number, surahName: string, ayahNumber: number, text: string) => {
  bookmarkStore.addBookmark(surahId, surahName, ayahNumber, text)
  alert('Ayat disimpan ke Penanda!')
}
</script>

<template>
  <div class="bg-noor-bg min-h-screen pb-20">
    <header class="sticky top-0 bg-noor-surface/95 backdrop-blur-md z-30 shadow-sm border-b border-noor-border transition-all">
      <div class="flex items-center justify-between px-4 py-3">
        <button @click="goBack" class="p-2 -ml-2 rounded-full hover:bg-noor-border/50 transition-colors">
          <ArrowLeft :size="24" class="text-noor-text" />
        </button>
        <div class="text-center flex-1">
          <h1 class="text-lg font-bold text-noor-text tracking-wide" v-if="currentJuz">
            Juz {{ currentJuz.id }}
          </h1>
          <h1 class="text-lg font-bold text-noor-muted" v-else>Memuat...</h1>
        </div>
        <button class="p-2 -mr-2 rounded-full hover:bg-noor-border/50 transition-colors" @click="store.toggleTranslation">
          <Settings2 :size="24" class="text-noor-text" />
        </button>
      </div>
    </header>

    <div v-if="loading" class="p-4 space-y-6">
      <div v-for="i in 5" :key="i" class="animate-pulse">
        <div class="h-10 bg-noor-surface rounded-2xl w-full mb-4"></div>
        <div class="h-24 bg-noor-surface rounded-2xl w-full"></div>
      </div>
    </div>

    <div v-else-if="error" class="p-10 text-center text-red-400">
      <p>{{ error }}</p>
      <button @click="fetchJuz(Number(route.params.id))" class="mt-4 px-4 py-2 bg-red-400/20 rounded-full text-red-400">Coba Lagi</button>
    </div>

    <div v-else-if="currentJuz" class="px-4 py-6 space-y-8">
      
      <div 
        v-for="(ayat, index) in currentJuz.ayahs" 
        :key="ayat.number" 
        class="relative group"
        :id="`ayat-${ayat.number}`"
      >
        <div v-if="index === 0 || ayat.surah.number !== currentJuz.ayahs[index - 1].surah.number" class="flex flex-col items-center justify-center my-6 space-y-4">
           <span class="bg-noor-primary/20 text-noor-primary px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wider drop-shadow-sm">
             {{ ayat.surah.englishName }}
           </span>
           <p v-if="ayat.numberInSurah === 1 && ayat.surah.number !== 1 && ayat.surah.number !== 9" class="arabic-text text-3xl md:text-4xl text-noor-text text-center drop-shadow-sm font-bold mt-4">
             بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
           </p>
        </div>

        <div class="bg-noor-surface p-5 rounded-3xl border tracking-wide transition-all border-transparent shadow-sm">
          
          <div class="flex justify-between items-start mb-6">
            <div class="w-10 h-10 flex-shrink-0 flex flex-col items-center justify-center bg-noor-bg rounded-2xl relative text-noor-subtle font-bold border border-noor-border">
              <span class="text-xs">{{ ayat.numberInSurah }}</span>
            </div>

            <p class="arabic-text text-3xl leading-loose text-right text-noor-text my-2 ml-4 break-words">
              {{ ayat.text }}
            </p>
          </div>

          <div v-if="store.showTranslation" class="space-y-2 mb-4 border-t border-noor-border/50 pt-4">
            <p class="text-noor-subtle text-[15px] leading-relaxed">{{ ayat.translationText }}</p>
          </div>

          <div class="flex items-center justify-end space-x-2 pt-2">
            <button @click="showTafsir(ayat.surah.number, ayat.numberInSurah)" class="p-2 rounded-full bg-noor-bg text-noor-subtle hover:text-noor-primary transition-colors" title="Tafsir">
              <Info :size="18" />
            </button>
            <button @click="saveBookmark(ayat.surah.number, ayat.surah.englishName, ayat.numberInSurah, ayat.text)" class="p-2 rounded-full bg-noor-bg text-noor-subtle hover:text-noor-primary transition-colors" title="Simpan Catatan/Bookmark">
              <BookmarkPlus :size="18" />
            </button>
          </div>
        </div>
      </div>

    </div>

    <!-- Tafsir Modal -->
    <div v-if="activeTafsir" class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm" @click.self="activeTafsir = null">
      <div class="bg-noor-surface w-full max-w-2xl sm:rounded-[2rem] rounded-t-[2rem] p-6 shadow-2xl border border-noor-border max-h-[80vh] flex flex-col animate-slide-up">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-xl font-bold text-noor-text">Tafsir - Ayat {{ activeTafsir.ayat }}</h3>
          <button @click="activeTafsir = null" class="p-2 bg-noor-bg rounded-full text-noor-subtle">✕</button>
        </div>
        <div class="overflow-y-auto pr-2 space-y-4">
          <p class="text-noor-text leading-relaxed text-sm text-justify">
             {{ activeTafsir.teks }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-slide-up { animation: slideUp 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
@keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
</style>
