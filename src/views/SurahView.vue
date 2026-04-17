<script setup lang="ts">
import { onMounted, watch, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import { useQuran } from '@/composables/useQuran'
import { useQuranStore } from '@/stores/quranStore'
import { useBookmarkStore } from '@/stores/bookmarkStore'
import { 
  ArrowLeft, 
  Play, 
  Pause, 
  Settings2, 
  Bookmark, 
  BookmarkPlus,
  BookOpenText,
  Info
} from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const { currentSurah, loading, error, fetchSurahDetail } = useQuran()
const store = useQuranStore()
const bookmarkStore = useBookmarkStore()

onMounted(() => {
  const id = Number(route.params.id)
  if (id) {
    fetchSurahDetail(id)
  }
})

watch(() => route.params.id, (newId) => {
  if (newId) {
    fetchSurahDetail(Number(newId))
  }
})

const goBack = () => router.push('/quran')

const markLastRead = (ayahNumber: number) => {
  if (currentSurah.value) {
    store.setLastRead(
      currentSurah.value.nomor, 
      currentSurah.value.namaLatin, 
      ayahNumber
    )
  }
}

const saveBookmark = (ayahNumber: number, arabicText: string) => {
  if (currentSurah.value) {
    bookmarkStore.addBookmark(
      currentSurah.value.nomor,
      currentSurah.value.namaLatin,
      ayahNumber,
      arabicText
    )
    alert(store.language === 'en' ? 'Ayah saved to Bookmarks!' : 'Ayat disimpan ke Penanda!')
  }
}

const activeTafsir = ref<{ ayat: number, teks: string } | null>(null)

const showTafsir = async (ayahNumber: number) => {
  if (!currentSurah.value) return
  const surahId = currentSurah.value.nomor
  activeTafsir.value = { ayat: ayahNumber, teks: 'Loading tafsir...' }
  try {
    const res = await axios.get(`https://equran.id/api/v2/tafsir/${surahId}`)
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

// fitur play audio
const playAudio = (url: string) => {
  const audio = new Audio(url)
  audio.play()
}
</script>

<template>
  <div class="bg-noor-bg min-h-screen pb-20">
    <!-- MD3 Extended Top App Bar -->
    <header class="sticky top-0 bg-noor-surface/95 backdrop-blur-md z-30 shadow-sm border-b border-noor-border transition-all">
      <div class="flex items-center justify-between px-4 py-3">
        <button @click="goBack" class="p-2 -ml-2 rounded-full hover:bg-noor-border/50 transition-colors">
          <ArrowLeft :size="24" class="text-noor-text" />
        </button>
        <div class="text-center flex-1">
          <h1 class="text-lg font-bold text-noor-text tracking-wide" v-if="currentSurah">
            {{ currentSurah.namaLatin }}
          </h1>
          <h1 class="text-lg font-bold text-noor-muted" v-else>Memuat...</h1>
        </div>
        <button class="p-2 -mr-2 rounded-full hover:bg-noor-border/50 transition-colors" @click="store.toggleTranslation">
          <Settings2 :size="24" class="text-noor-text" />
        </button>
      </div>

      <!-- Surah Meta (MD3 Secondary Container) -->
      <div v-if="currentSurah" class="px-4 pb-4 pt-1 flex justify-center space-x-2">
        <span class="bg-noor-primary/20 text-noor-primary px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
          {{ currentSurah.tempatTurun }}
        </span>
        <span class="bg-noor-primary/20 text-noor-primary px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
          {{ currentSurah.jumlahAyat }} Ayat
        </span>
      </div>
    </header>

    <!-- Loading State -->
    <div v-if="loading" class="p-4 space-y-6">
      <div v-for="i in 5" :key="i" class="animate-pulse">
        <div class="h-10 bg-noor-surface rounded-2xl w-full mb-4"></div>
        <div class="h-24 bg-noor-surface rounded-2xl w-full"></div>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="p-10 text-center text-red-400">
      <p>{{ error }}</p>
      <button @click="fetchSurahDetail(Number(route.params.id))" class="mt-4 px-4 py-2 bg-red-400/20 rounded-full text-red-400">Coba Lagi</button>
    </div>

    <!-- Content (Ayat List) -->
    <div v-else-if="currentSurah" class="px-4 py-6 space-y-8">
      
      <!-- Bismillah Header -->
      <div v-if="currentSurah.nomor !== 1 && currentSurah.nomor !== 9" class="flex justify-center py-6">
        <p class="arabic-text text-3xl md:text-4xl text-noor-text text-center drop-shadow-sm font-bold">
          بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
        </p>
      </div>

      <!-- Ayat Item -->
      <div 
        v-for="ayat in currentSurah.ayat" 
        :key="ayat.nomorAyat" 
        class="relative group"
        :id="`ayat-${ayat.nomorAyat}`"
      >
        <!-- Penanda "Ganti Halaman" Palsu (Dummy logic/asumsi) -->
        <div v-if="ayat.nomorAyat % 15 === 0" class="flex items-center justify-center my-8">
          <div class="h-[1px] bg-noor-border flex-1"></div>
          <span class="px-3 text-[10px] uppercase tracking-widest text-noor-muted font-bold flex items-center space-x-1">
            <BookOpenText :size="12" />
            <span>Halaman Baru</span>
          </span>
          <div class="h-[1px] bg-noor-border flex-1"></div>
        </div>

        <div class="bg-noor-surface p-5 rounded-3xl border tracking-wide transition-all"
             :class="[
               store.lastRead?.surahId === currentSurah.nomor && store.lastRead?.ayahNumber === ayat.nomorAyat 
                 ? 'border-noor-primary/50 shadow-[0_0_15px_rgba(74,124,89,0.15)] bg-noor-primary/5' 
                 : 'border-transparent shadow-sm'
             ]">
          
          <div class="flex justify-between items-start mb-6">
            <div class="w-10 h-10 flex-shrink-0 flex items-center justify-center bg-noor-bg rounded-2xl relative text-noor-subtle font-bold border border-noor-border">
              {{ ayat.nomorAyat }}
            </div>

            <!-- teks arab -->
            <p class="arabic-text text-3xl leading-loose text-right text-noor-text my-2 ml-4 break-words">
              {{ ayat.teksArab }}
            </p>
          </div>

          <!-- teks latin & terjemahan -->
          <div v-if="store.showTranslation" class="space-y-2 mb-4 border-t border-noor-border/50 pt-4">
            <p class="text-noor-primary text-sm font-medium tracking-wide leading-relaxed" v-html="ayat.teksLatin"></p>
            <p class="text-noor-subtle text-[15px] leading-relaxed">{{ ayat.teksIndonesia }}</p>
          </div>

          <!-- MD3 Actions Row -->
          <div class="flex items-center justify-end space-x-2 pt-2">
            <button 
              @click="markLastRead(ayat.nomorAyat)"
              class="flex items-center space-x-1 px-4 py-2 rounded-full text-xs font-semibold transition-colors"
              :class="store.lastRead?.surahId === currentSurah.nomor && store.lastRead?.ayahNumber === ayat.nomorAyat ? 'bg-noor-primary text-white' : 'bg-noor-primary/10 text-noor-primary hover:bg-noor-primary/20'"
            >
              <Bookmark :size="14" :fill="store.lastRead?.surahId === currentSurah.nomor && store.lastRead?.ayahNumber === ayat.nomorAyat ? 'currentColor' : 'none'" />
              <span>Terakhir Baca</span>
            </button>
            <button @click="showTafsir(ayat.nomorAyat)" class="p-2 rounded-full bg-noor-bg text-noor-subtle hover:text-noor-primary transition-colors" title="Tafsir">
              <Info :size="18" />
            </button>
            <button @click="saveBookmark(ayat.nomorAyat, ayat.teksArab)" class="p-2 rounded-full bg-noor-bg text-noor-subtle hover:text-noor-primary transition-colors" title="Simpan Catatan/Bookmark">
              <BookmarkPlus :size="18" />
            </button>
            <button @click="playAudio(ayat.audio[store.currentQari])" class="p-2 rounded-full bg-noor-bg text-noor-subtle hover:text-noor-primary transition-colors" title="Putar Audio">
              <Play :size="18" fill="currentColor" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Tafsir Modal -->
    <div v-if="activeTafsir" class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm" @click.self="activeTafsir = null">
      <div class="bg-noor-surface w-full max-w-2xl sm:rounded-[2rem] rounded-t-[2rem] p-6 shadow-2xl border border-noor-border max-h-[80vh] flex flex-col animate-slide-up">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-xl font-bold text-noor-text">Tafsir Kemenag - Ayat {{ activeTafsir.ayat }}</h3>
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
