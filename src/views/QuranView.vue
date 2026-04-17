<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Search, Info } from 'lucide-vue-next'
import { useQuran } from '@/composables/useQuran'
import { useQuranStore } from '@/stores/quranStore'
import { juzMapping } from '@/data/juzMapping'

const router = useRouter()
const store = useQuranStore()
const { surahList, loading, error, fetchSurahList } = useQuran()

const searchQuery = ref('')
const activeTab = ref<'surah' | 'juz'>('surah')

onMounted(() => {
  if (surahList.value.length === 0) {
    fetchSurahList()
  }
})

const filteredSurahs = computed(() => {
  return surahList.value.filter(s => 
    s.namaLatin.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    s.arti.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

const filteredJuzs = computed(() => {
  return juzMapping.filter(j => 
    j.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    j.start.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

const openSurah = (id: number) => {
  router.push(`/quran/${id}`)
}

const openJuz = (id: number) => {
  router.push(`/juz/${id}`)
}
</script>

<template>
  <div class="px-4 py-4 space-y-6 pb-20">
    <header class="py-2">
      <h1 class="text-3xl font-bold text-noor-text mb-2">Al-Quran</h1>
    </header>

    <!-- Search Bar -->
    <div class="relative group">
      <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-noor-subtle group-focus-within:text-noor-primary transition-colors">
        <Search :size="20" />
      </div>
      <input 
        v-model="searchQuery"
        type="text" 
        placeholder="Cari surah atau juz..."
        class="w-full bg-noor-surface border border-noor-border text-noor-text rounded-full py-3 pl-12 pr-4 focus:outline-none focus:border-noor-primary focus:ring-1 focus:ring-noor-primary transition-all shadow-sm"
      >
    </div>

    <!-- Tabs -->
    <div class="flex p-1 bg-noor-surface rounded-full border border-noor-border">
      <button 
        @click="activeTab = 'surah'"
        class="flex-1 py-2 text-sm font-bold rounded-full transition-all"
        :class="activeTab === 'surah' ? 'bg-noor-primary text-white shadow-md' : 'text-noor-subtle'"
      >
        Surah
      </button>
      <button 
        @click="activeTab = 'juz'"
        class="flex-1 py-2 text-sm font-bold rounded-full transition-all"
        :class="activeTab === 'juz' ? 'bg-noor-primary text-white shadow-md' : 'text-noor-subtle'"
      >
        Juz
      </button>
    </div>

    <!-- Last Read Widget -->
    <div v-if="store.lastRead" class="bg-noor-surface p-5 rounded-3xl border border-noor-border flex justify-between items-center shadow-sm cursor-pointer hover:border-noor-primary transition-colors"
         @click="openSurah(store.lastRead.surahId)">
      <div>
        <span class="text-[10px] font-bold tracking-widest text-noor-primary uppercase">Terakhir Baca</span>
        <h3 class="text-lg font-bold text-noor-text mt-1">{{ store.lastRead.surahName }}</h3>
        <p class="text-sm text-noor-subtle">Ayat {{ store.lastRead.ayahNumber }}</p>
      </div>
      <div class="w-12 h-12 rounded-full bg-noor-bg flex flex-shrink-0 items-center justify-center text-noor-primary font-bold">
        {{ store.lastRead.surahId }}
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="space-y-4">
      <div v-for="i in 5" :key="i" class="h-24 bg-noor-surface rounded-2xl animate-pulse"></div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="p-4 text-red-500 font-medium text-center">
      {{ error }}
      <button @click="fetchSurahList" class="mt-2 text-sm underline block mx-auto">Coba Lagi</button>
    </div>

    <!-- Surah List -->
    <div v-else-if="activeTab === 'surah'" class="grid gap-4">
      <div 
        v-for="surah in filteredSurahs" 
        :key="surah.nomor"
        @click="openSurah(surah.nomor)"
        class="bg-noor-surface p-5 rounded-3xl border border-noor-border flex items-center cursor-pointer hover:border-noor-primary hover:shadow-sm transition-all active:scale-[0.98] group"
      >
        <div class="w-12 h-12 flex-shrink-0 rounded-2xl bg-noor-bg flex items-center justify-center text-noor-primary font-bold relative overflow-hidden group-hover:rotate-12 transition-transform duration-300 border border-noor-border">
          <span class="relative z-10">{{ surah.nomor }}</span>
        </div>
        
        <div class="ml-4 flex-1">
          <h3 class="text-lg font-bold text-noor-text tracking-wide">{{ surah.namaLatin }}</h3>
          <p class="text-[13px] text-noor-subtle font-medium mt-0.5">
             {{ surah.arti }} • {{ surah.jumlahAyat }} Ayat
          </p>
        </div>
        
        <div class="text-right">
          <h3 class="arabic-text text-2xl text-noor-primary">{{ surah.nama }}</h3>
        </div>
      </div>
      
      <div v-if="filteredSurahs.length === 0" class="text-center py-10 opacity-50 flex flex-col items-center">
        <Info :size="48" class="mb-4 text-noor-muted" />
        <p class="text-noor-text font-medium">Surah tidak ditemukan</p>
      </div>
    </div>

    <!-- Juz List -->
    <div v-else-if="activeTab === 'juz'" class="grid gap-4">
      <div 
        v-for="juz in filteredJuzs" 
        :key="juz.id"
        @click="openJuz(juz.id)"
        class="bg-noor-surface p-5 rounded-3xl border border-noor-border flex flex-col cursor-pointer hover:border-noor-primary hover:shadow-sm transition-all active:scale-[0.98] group"
      >
        <div class="flex items-center space-x-3 mb-2">
          <div class="w-10 h-10 flex-shrink-0 rounded-full bg-noor-primary/10 flex items-center justify-center text-noor-primary font-bold">
            {{ juz.id }}
          </div>
          <h3 class="text-lg font-bold text-noor-text tracking-wide">{{ juz.name }}</h3>
        </div>
        <p class="text-sm text-noor-subtle flex flex-col space-y-1">
          <span class="flex items-center space-x-2">Mulai: <span class="font-semibold text-noor-text px-2">{{ juz.start }}</span></span>
          <span class="flex items-center space-x-2">Sampai: <span class="font-semibold text-noor-text px-2">{{ juz.end }}</span></span>
        </p>
      </div>
      
      <div v-if="filteredJuzs.length === 0" class="text-center py-10 opacity-50 flex flex-col items-center">
        <Info :size="48" class="mb-4 text-noor-muted" />
        <p class="text-noor-text font-medium">Juz tidak ditemukan</p>
      </div>
    </div>

  </div>
</template>
