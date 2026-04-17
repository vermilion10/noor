<script setup lang="ts">
import { ref } from 'vue'
import { Moon, Sun, BookOpen } from 'lucide-vue-next'
import { useRouter } from 'vue-router'

const router = useRouter()
const activeTab = ref<'matsurat' | 'surat'>('matsurat')

const openDhikr = (type: 'pagi' | 'petang') => {
  router.push(`/dhikr/matsurat/${type}`)
}

const openSurah = (id: number) => {
  router.push(`/quran/${id}`)
}

const suratPilihan = [
  { id: 18, name: 'Al-Kahfi', desc: 'Pelindung dari fitnah Dajjal' },
  { id: 36, name: 'Yasin', desc: 'Jantungnya Al-Quran' },
  { id: 55, name: 'Ar-Rahman', desc: 'Pengingat nikmat Allah' },
  { id: 56, name: 'Al-Waqi\'ah', desc: 'Pembuka pintu rezeki' },
  { id: 67, name: 'Al-Mulk', desc: 'Penyelamat siksa kubur' }
]
</script>

<template>
  <div class="px-4 py-4 space-y-6 pb-20 font-sans">
    <header class="py-2">
      <h1 class="text-3xl font-bold text-noor-text">Amalan</h1>
      <p class="text-sm text-noor-subtle mt-1">Lengkapi hari dengan dzikir dan tilawah</p>
    </header>

    <!-- Custom MD3 Tab -->
    <div class="bg-noor-surface p-1 rounded-full flex border border-noor-border shadow-sm">
      <button 
        @click="activeTab = 'matsurat'" 
        class="flex-1 py-2.5 text-sm font-bold rounded-full transition-all duration-300 relative z-10"
        :class="activeTab === 'matsurat' ? 'text-white' : 'text-noor-subtle'"
      >
        <div v-if="activeTab === 'matsurat'" class="absolute inset-0 bg-noor-primary rounded-full -z-10 shadow-sm animate-fade-in"></div>
        Al-Ma'tsurat
      </button>
      <button 
        @click="activeTab = 'surat'" 
        class="flex-1 py-2.5 text-sm font-bold rounded-full transition-all duration-300 relative z-10"
        :class="activeTab === 'surat' ? 'text-white' : 'text-noor-subtle'"
      >
        <div v-if="activeTab === 'surat'" class="absolute inset-0 bg-noor-primary rounded-full -z-10 shadow-sm animate-fade-in"></div>
        Surat Pilihan
      </button>
    </div>

    <!-- Matsurat Tab -->
    <div v-if="activeTab === 'matsurat'" class="grid gap-4 animate-slide-up">
      <div @click="openDhikr('pagi')" class="bg-noor-surface p-6 rounded-[2rem] border border-noor-border flex flex-col items-center justify-center cursor-pointer hover:border-noor-primary transition-all hover:scale-[1.02] active:scale-[0.98] shadow-sm">
        <div class="w-16 h-16 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500 mb-4 drop-shadow-md">
          <Sun :size="32" />
        </div>
        <h3 class="text-xl font-bold text-noor-text tracking-wide">Dzikir Pagi</h3>
        <p class="text-noor-subtle text-sm text-center mt-2">Dibaca setelah shubuh hingga menjelang dzuhur</p>
      </div>

      <div @click="openDhikr('petang')" class="bg-noor-surface p-6 rounded-[2rem] border border-noor-border flex flex-col items-center justify-center cursor-pointer hover:border-noor-primary transition-all hover:scale-[1.02] active:scale-[0.98] shadow-sm">
        <div class="w-16 h-16 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 mb-4 drop-shadow-md">
          <Moon :size="32" />
        </div>
        <h3 class="text-xl font-bold text-noor-text tracking-wide">Dzikir Petang</h3>
        <p class="text-noor-subtle text-sm text-center mt-2">Dibaca setelah ashar hingga menjelang isya</p>
      </div>
    </div>

    <!-- Surat Pilihan Tab -->
    <div v-if="activeTab === 'surat'" class="grid gap-4 animate-slide-up">
      <div 
        v-for="surah in suratPilihan" 
        :key="surah.id"
        @click="openSurah(surah.id)"
        class="bg-noor-surface p-5 rounded-3xl border border-noor-border flex items-center justify-between cursor-pointer hover:border-noor-primary transition-all hover:scale-[1.02] active:scale-[0.98] shadow-sm"
      >
        <div class="flex items-center space-x-4">
          <div class="w-12 h-12 rounded-full bg-noor-primary/10 flex items-center justify-center text-noor-primary">
            <BookOpen :size="20" />
          </div>
          <div>
            <h3 class="text-lg font-bold text-noor-text">{{ surah.name }}</h3>
            <p class="text-xs text-noor-subtle mt-0.5">{{ surah.desc }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-fade-in { animation: fadeIn 0.2s ease-out; }
.animate-slide-up { animation: slideUp 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes slideUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
</style>
