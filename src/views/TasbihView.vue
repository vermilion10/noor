<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, RefreshCcw } from 'lucide-vue-next'

const router = useRouter()
const goBack = () => router.push('/more')

const count = ref(0)
const totalCount = ref(0) // total count all time or session

const activePreset = ref(33)
const presets = [
  { label: 'Subhanallah', value: 33 },
  { label: 'Alhamdulillah', value: 33 },
  { label: 'Allahu Akbar', value: 33 },
  { label: 'Bebas', value: 0 }
]

const handleTap = () => {
  if (navigator.vibrate) navigator.vibrate(50)
  
  count.value++
  totalCount.value++
  
  if (activePreset.value > 0 && count.value === activePreset.value) {
    if (navigator.vibrate) navigator.vibrate([100, 50, 100])
  }
}

const reset = () => {
  if (confirm('Yakin ingin mereset tasbih?')) {
    count.value = 0
  }
}

const selectPreset = (val: number) => {
  activePreset.value = val
  count.value = 0
}
</script>

<template>
  <div class="bg-noor-bg min-h-screen flex flex-col hide-scrollbar h-screen overflow-hidden">
    <!-- Navbar -->
    <header class="flex-shrink-0 bg-noor-surface/90 backdrop-blur-md z-30 shadow-sm border-b border-noor-border transition-all">
      <div class="flex items-center justify-between px-4 py-3">
        <button @click="goBack" class="p-2 -ml-2 rounded-full hover:bg-noor-border/50 transition-colors">
          <ArrowLeft :size="24" class="text-noor-text" />
        </button>
        <div class="text-center flex-1">
          <h1 class="text-lg font-bold text-noor-text tracking-wide">Tasbih Digital</h1>
        </div>
        <button @click="reset" class="p-2 -mr-2 rounded-full hover:bg-noor-border/50 transition-colors" title="Reset">
          <RefreshCcw :size="20" class="text-noor-text" />
        </button>
      </div>
    </header>

    <!-- Presets -->
    <div class="px-4 py-4 flex space-x-2 overflow-x-auto hide-scrollbar flex-shrink-0">
      <button 
        v-for="p in presets" 
        :key="p.label" 
        @click="selectPreset(p.value)"
        class="whitespace-nowrap px-4 py-2 rounded-full text-sm font-semibold transition-colors border"
        :class="activePreset === p.value ? 'bg-noor-primary text-white border-noor-primary' : 'bg-noor-surface text-noor-subtle border-noor-border'"
      >
        {{ p.label }} <span v-if="p.value > 0">({{ p.value }})</span>
      </button>
    </div>

    <!-- Tap Area -->
    <main class="flex-1 w-full max-w-screen-md mx-auto relative flex flex-col items-center justify-center p-6">
      
      <!-- Target indicator -->
      <div v-if="activePreset > 0" class="mb-8 text-center text-noor-subtle animate-fade-in">
        Target: <span class="font-bold text-noor-primary">{{ activePreset }}</span>
      </div>

      <button 
        @click="handleTap"
        class="relative w-64 h-64 sm:w-72 sm:h-72 rounded-full outline-none select-none touch-manipulation group"
        style="-webkit-tap-highlight-color: transparent;"
      >
        <!-- Background pulses / ripples -->
        <div class="absolute inset-0 bg-noor-primary/10 rounded-full scale-100 group-active:scale-95 transition-transform duration-100"></div>
        <div class="absolute inset-4 bg-noor-primary/20 rounded-full scale-100 group-active:scale-95 transition-transform duration-100 delay-75 shadow-[0_0_50px_rgba(74,124,89,0.3)]"></div>
        <div class="absolute inset-8 bg-noor-surface border border-noor-primary/50 shadow-inner rounded-full flex flex-col items-center justify-center scale-100 group-active:scale-95 transition-transform duration-100 delay-100">
          
          <!-- Digits -->
          <span class="text-7xl font-black font-mono text-noor-text drop-shadow-md" :class="{ 'text-noor-primary': activePreset > 0 && count >= activePreset }">
            {{ count }}
          </span>
          <span class="text-noor-subtle text-sm uppercase tracking-widest mt-2">Ketuk</span>

        </div>
      </button>

      <!-- total session -->
      <div class="mt-12 text-center text-noor-subtle text-sm">
        Total Keseluruhan Sesi Ini: <span class="font-bold text-noor-text">{{ totalCount }}</span>
      </div>

    </main>

  </div>
</template>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.5s ease-out;
}
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style>
