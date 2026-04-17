<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useOdojStore } from '@/stores/odojStore'
import { ArrowLeft, Edit3, Target, CheckCircle } from 'lucide-vue-next'
import { Bar } from 'vue-chartjs'
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

const router = useRouter()
const store = useOdojStore()
const goBack = () => router.push('/')

const weeklyData = store.getWeeklyData()

const chartData = computed(() => {
  return {
    labels: weeklyData.days,
    datasets: [
      {
        label: 'Ayat Dibaca',
        backgroundColor: '#4a7c59',
        borderRadius: 6,
        data: weeklyData.reads
      }
    ]
  }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false
    },
    tooltip: {
      backgroundColor: '#1a2b1c',
      titleColor: '#e8f0ea',
      bodyColor: '#e8f0ea',
      padding: 12,
      cornerRadius: 12,
      displayColors: false,
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: {
        color: '#2d4a30',
        tickLength: 0
      },
      ticks: {
        color: '#a8c4ad',
        stepSize: 5
      },
      border: {
        display: false
      }
    },
    x: {
      grid: {
        display: false,
        drawBorder: false
      },
      ticks: {
        color: '#a8c4ad'
      },
      border: {
        display: false
      }
    }
  }
}

const isEditingTarget = ref(false)
const tempTarget = ref(store.dailyTargetAyat)

const saveTarget = () => {
  store.setDailyTarget(tempTarget.value)
  isEditingTarget.value = false
}

const addAyat = () => {
  store.addAyatRead(10)
  const newWeekly = store.getWeeklyData()
  weeklyData.days = newWeekly.days
  weeklyData.reads = newWeekly.reads
}
onMounted(() => {
  store.syncTodayTarget()
})
</script>

<template>
  <div class="bg-noor-bg min-h-screen pb-20 font-sans">
    <header class="sticky top-0 bg-noor-surface/90 backdrop-blur-md z-30 shadow-sm border-b border-noor-border transition-all">
      <div class="flex items-center justify-between px-4 py-3">
        <button @click="goBack" class="p-2 -ml-2 rounded-full hover:bg-noor-border/50 transition-colors">
          <ArrowLeft :size="24" class="text-noor-text" />
        </button>
        <div class="text-center flex-1">
          <h1 class="text-lg font-bold text-noor-text tracking-wide">Progress ODOJ</h1>
        </div>
        <div class="w-8"></div>
      </div>
    </header>

    <div class="p-4 space-y-6 mt-2">
      
      <!-- Target & Completion Card -->
      <div class="bg-noor-surface p-6 rounded-3xl border border-noor-border relative overflow-hidden shadow-sm">
        
        <div class="flex justify-between items-start mb-6">
          <div class="flex items-center space-x-3">
            <div class="w-12 h-12 bg-noor-primary/10 rounded-2xl flex items-center justify-center text-noor-primary">
              <Target :size="24" />
            </div>
            <div>
              <h2 class="text-noor-text font-bold text-lg">Target Harian</h2>
              <p class="text-noor-subtle text-sm">
                {{ store.dailyTargetAyat }} Ayat
              </p>
            </div>
          </div>
          <button @click="isEditingTarget = !isEditingTarget" class="p-2 rounded-full bg-noor-bg text-noor-subtle hover:text-noor-primary transition-colors">
            <Edit3 :size="18" />
          </button>
        </div>

        <!-- Target Editor -->
        <div v-if="isEditingTarget" class="bg-noor-bg p-4 rounded-2xl mb-6 flex flex-col space-y-4 animate-fade-in border border-noor-primary/30">
          <div class="flex justify-between items-center">
            <span class="text-sm font-medium text-noor-subtle">Ayat per hari:</span>
            <span class="text-xl font-bold text-noor-primary font-mono">{{ tempTarget }}</span>
          </div>
          <input type="range" min="10" max="1000" step="10" v-model.number="tempTarget" class="w-full accent-noor-primary" />
          <div class="flex space-x-2">
            <button @click="tempTarget = store.getAyahCountForJuz(store.getTodayJuz())" class="flex-1 py-1.5 text-xs rounded-full border border-noor-border text-noor-text hover:bg-noor-surface">Juz Hari Ini</button>
            <button @click="saveTarget" class="flex-1 py-1.5 text-xs rounded-full bg-noor-primary text-white font-bold hover:brightness-110">Simpan</button>
          </div>
        </div>

        <div class="mb-2 flex justify-between items-end">
          <span class="text-noor-subtle text-sm font-semibold uppercase tracking-widest">Hari Ini</span>
          <span class="text-noor-text font-bold"><span class="text-2xl font-mono">{{ store.getTodayRecord().ayatRead }}</span> / {{ store.dailyTargetAyat }} Ayat</span>
        </div>
        
        <div class="w-full bg-noor-bg rounded-full h-4 overflow-hidden flex shadow-inner">
          <div class="bg-noor-primary h-full transition-all duration-1000 ease-out" 
               :class="{ 'bg-gradient-to-r from-noor-primary to-emerald-400': store.todayProgressPercent >= 100 }"
               :style="`width: ${store.todayProgressPercent}%`">
          </div>
        </div>

        <!-- Add Manual Button -->
        <div class="mt-6 border-t border-noor-border/50 pt-4 flex justify-between items-center">
          <p class="text-xs text-noor-muted max-w-[200px]">Progress otomatis bertambah jika Anda membaca Surah secara online.</p>
          <button @click="addAyat" class="px-3 py-1.5 bg-noor-bg rounded-full text-noor-text text-sm border border-noor-border flex items-center space-x-1 hover:border-noor-primary">
            <CheckCircle :size="14" class="text-noor-primary" />
            <span>Tandai +10 Ayat</span>
          </button>
        </div>
      </div>

      <!-- Chart Card -->
      <div class="bg-noor-surface p-6 rounded-3xl border border-noor-border shadow-sm">
        <h3 class="text-noor-text font-bold mb-6">Grafik Bacaan (7 Hari Terakhir)</h3>
        <div class="h-64 cursor-crosshair">
          <Bar :data="chartData" :options="chartOptions" />
        </div>
      </div>

      <!-- Recap Box -->
      <div class="grid grid-cols-2 gap-4">
        <div class="bg-noor-surface p-5 rounded-3xl border border-noor-border text-center">
          <h4 class="text-xs text-noor-subtle uppercase tracking-widest font-bold mb-1">Total Ayat</h4>
          <span class="text-3xl font-black text-noor-text font-mono">
            {{ store.history.reduce((acc, curr) => acc + curr.ayatRead, 0) }}
          </span>
        </div>
        <div class="bg-noor-surface p-5 rounded-3xl border border-noor-border text-center">
          <h4 class="text-xs text-noor-subtle uppercase tracking-widest font-bold mb-1">Streak ODOJ</h4>
          <span class="text-3xl font-black text-orange-500 font-mono">{{ store.currentStreak }}</span>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.3s ease-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-5px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
