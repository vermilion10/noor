<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useQuranStore } from '@/stores/quranStore'
import { useOdojStore } from '@/stores/odojStore'
import { ArrowLeft, Volume2, Type, Bell, Database, CalendarDays } from 'lucide-vue-next'

const router = useRouter()
const store = useQuranStore()
const odojStore = useOdojStore()
const goBack = () => router.push('/more')

const qariList = [
  { id: '01', name: 'Abdullah Al-Juhany' },
  { id: '02', name: 'Abdul Muhsin Al-Qasim' },
  { id: '03', name: 'Abdurrahman as-Sudais' },
  { id: '04', name: 'Ibrahim Al-Dossari' },
  { id: '05', name: 'Misyari Rasyid Al-Afasi' },
  { id: '06', name: 'Yasser Al-Dosari' }
]

const fontSizeOptions = [
  { id: 'normal', label: 'Normal', class: 'text-3xl' },
  { id: 'large', label: 'Besar', class: 'text-4xl' },
  { id: 'huge', label: 'Sangat Besar', class: 'text-5xl' }
]

const notificationsEnabled = ref(true)

const clearData = () => {
  if (confirm('PERINGATAN: Semua data, catatan, progres ODOJ, dan pengaturan akan dihapus secara permanen. Lanjutkan?')) {
    localStorage.clear()
    window.location.reload()
  }
}
</script>

<template>
  <div class="bg-noor-bg min-h-screen pb-20 font-sans">
    <header class="sticky top-0 bg-noor-surface/90 backdrop-blur-md z-30 shadow-sm border-b border-noor-border transition-all">
      <div class="flex items-center justify-between px-4 py-3">
        <button @click="goBack" class="p-2 -ml-2 rounded-full hover:bg-noor-border/50 transition-colors">
          <ArrowLeft :size="24" class="text-noor-text" />
        </button>
        <div class="text-center flex-1">
          <h1 class="text-lg font-bold text-noor-text tracking-wide">Pengaturan</h1>
        </div>
        <div class="w-8"></div>
      </div>
    </header>

    <div class="p-4 space-y-6 pt-6 max-w-screen-md mx-auto">
      
      <!-- Audio Settings -->
      <div class="bg-noor-surface rounded-3xl border border-noor-border p-5 md:p-8 shadow-sm">
        <div class="flex items-center space-x-3 mb-6">
          <div class="p-2 bg-noor-primary/10 rounded-xl text-noor-primary">
            <Volume2 :size="20" />
          </div>
          <h2 class="font-bold text-noor-text text-lg">Audio Qari</h2>
        </div>
        
        <div class="space-y-3">
          <label 
            v-for="qari in qariList" 
            :key="qari.id"
            class="flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-colors"
            :class="store.currentQari === qari.id ? 'border-noor-primary bg-noor-primary/5' : 'border-noor-border hover:bg-noor-bg'"
          >
            <span class="text-noor-text font-medium">{{ qari.name }}</span>
            <input type="radio" :value="qari.id" v-model="store.currentQari" class="accent-noor-primary w-5 h-5">
          </label>
        </div>
      </div>

      <!-- Display Settings -->
      <div class="bg-noor-surface rounded-3xl border border-noor-border p-5 md:p-8 shadow-sm">
        <div class="flex items-center space-x-3 mb-6">
          <div class="p-2 bg-noor-accent/10 rounded-xl text-noor-accent">
            <Type :size="20" />
          </div>
          <h2 class="font-bold text-noor-text text-lg">Tampilan Mushaf</h2>
        </div>

        <div class="flex rounded-xl overflow-hidden border border-noor-border">
          <button 
            v-for="opt in fontSizeOptions" 
            :key="opt.id"
            class="flex-1 py-3 text-sm font-semibold transition-colors relative"
            :class="opt.id === 'normal' ? 'bg-noor-primary text-white' : 'bg-noor-bg text-noor-subtle hover:bg-noor-surface'"
          >
            {{ opt.label }}
          </button>
        </div>
      </div>

      <!-- App Preferences -->
      <div class="bg-noor-surface rounded-3xl border border-noor-border p-5 shadow-sm space-y-4">
        
        <div class="flex items-center justify-between border-b border-noor-border/50 pb-4">
          <div class="flex items-center space-x-3">
            <div class="p-2 bg-noor-primary/10 rounded-xl text-noor-primary">
              <CalendarDays :size="20" />
            </div>
            <div>
              <h2 class="font-bold text-noor-text">Kalender Target ODOJ</h2>
              <p class="text-[11px] text-noor-subtle mt-0.5">Metode waktu pelacakan</p>
            </div>
          </div>
          <button @click="odojStore.odojMode = odojStore.odojMode === 'hijri' ? 'masehi' : 'hijri'" class="px-4 py-1.5 border border-noor-primary text-noor-primary rounded-full text-xs font-bold uppercase tracking-widest hover:bg-noor-primary/10">
            {{ odojStore.odojMode === 'hijri' ? 'HIJRIYAH' : 'MASEHI' }}
          </button>
        </div>

        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <div class="p-2 bg-amber-400/10 rounded-xl text-amber-500">
              <Bell :size="20" />
            </div>
            <div>
              <h2 class="font-bold text-noor-text">Notifikasi Adzan</h2>
              <p class="text-[11px] text-noor-subtle mt-0.5">Beritahu saat waktu sholat tiba</p>
            </div>
          </div>
          <label class="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" v-model="notificationsEnabled" class="sr-only peer">
            <div class="w-11 h-6 bg-noor-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-noor-primary"></div>
          </label>
        </div>
      </div>

      <!-- Danger Zone -->
      <div class="pt-8">
        <h3 class="text-xs font-bold uppercase tracking-widest text-noor-muted mb-4 pl-2">Zona Berbahaya</h3>
        <button @click="clearData" class="w-full bg-red-500/10 text-red-500 font-bold py-4 rounded-3xl flex items-center justify-center space-x-2 border border-red-500/20 hover:bg-red-500/20 transition-colors">
          <Database :size="20" />
          <span>Hapus Semua Data</span>
        </button>
      </div>

    </div>
  </div>
</template>
