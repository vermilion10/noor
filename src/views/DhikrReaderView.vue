<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ArrowLeft, CheckCircle2 } from 'lucide-vue-next'
import matsuratData from '@/data/matsurat.json'

const router = useRouter()
const route = useRoute()

const typeStr = computed(() => {
  return route.params.type === 'pagi' ? 'Pagi' : 'Petang'
})

const goBack = () => router.push('/dhikr')

const currentIndex = ref(0)
const currentTap = ref(0)
const isCompleted = ref(false)

const currentItem = computed(() => {
  if (currentIndex.value >= matsuratData.length) return null
  return matsuratData[currentIndex.value]
})

const handleTap = () => {
  if (!currentItem.value || isCompleted.value) return
  
  if (navigator.vibrate) {
    navigator.vibrate(50)
  }

  currentTap.value++

  if (currentTap.value >= currentItem.value.count) {
    if (navigator.vibrate) navigator.vibrate([50, 50, 100])
    
    setTimeout(() => {
      if (currentIndex.value < matsuratData.length - 1) {
        currentIndex.value++
        currentTap.value = 0
      } else {
        isCompleted.value = true
      }
    }, 400)
  }
}

const progressPercent = computed(() => {
  if (isCompleted.value) return 100
  return (currentIndex.value / matsuratData.length) * 100
})
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
          <h1 class="text-lg font-bold text-noor-text tracking-wide">
            Al-Ma'tsurat {{ typeStr }}
          </h1>
        </div>
        <div class="w-8"></div> <!-- spacer -->
      </div>
      <!-- Progress Bar -->
      <div class="w-full bg-noor-border h-1 relative overflow-hidden">
        <div class="h-full bg-noor-primary transition-all duration-300" :style="`width: ${progressPercent}%`"></div>
      </div>
    </header>

    <!-- Reader Area (Clickable) -->
    <main class="flex-1 overflow-y-auto w-full max-w-screen-md mx-auto relative cursor-pointer active:bg-noor-surface/50 transition-colors" @click="handleTap">
      
      <div v-if="isCompleted" class="flex flex-col items-center justify-center h-full p-8 text-center animate-fade-in">
        <div class="w-24 h-24 bg-noor-primary/20 text-noor-primary rounded-full flex items-center justify-center mb-6 shadow-lg shadow-noor-primary/20">
          <CheckCircle2 :size="48" />
        </div>
        <h2 class="text-2xl font-bold text-noor-text mb-2">Alhamdulillah!</h2>
        <p class="text-noor-subtle mb-8">Anda telah menyelesaikan Al-Ma'tsurat {{ typeStr }}.</p>
        <button @click="goBack" class="px-6 py-3 bg-noor-primary text-white rounded-full font-bold w-full max-w-xs hover:brightness-110">
          Kembali ke Menu
        </button>
      </div>

      <div v-else-if="currentItem" class="p-6 pb-40 flex flex-col h-full min-h-max justify-center">
        <!-- MD3 Large Card -->
        <div class="bg-noor-surface p-6 sm:p-8 rounded-[2rem] border border-noor-border shadow-md">
          <div class="text-right arabic-text text-3xl sm:text-4xl text-noor-text leading-[2.5] mb-8 break-words">
            {{ currentItem.arab }}
          </div>
          
          <div class="border-t border-noor-border/50 pt-6 space-y-4">
            <p class="text-noor-primary font-medium tracking-wide leading-relaxed italic text-sm">
              {{ currentItem.latin }}
            </p>
            <p class="text-noor-subtle text-[15px] leading-relaxed">
              {{ currentItem.arti }}
            </p>
          </div>
        </div>
      </div>

    </main>

    <div v-if="!isCompleted && currentItem" class="fixed bottom-10 left-1/2 -translate-x-1/2 pointer-events-none mb-[70px] md:mb-0 z-40 animate-slide-up">
      <div class="bg-noor-primary shadow-[0_0_20px_rgba(74,124,89,0.4)] text-white px-8 py-4 rounded-full flex items-center justify-center border-[4px] border-noor-bg">
        <span class="text-3xl font-black font-mono tracking-widest">{{ currentItem.count - currentTap }}</span>
        <span class="ml-2 text-sm uppercase tracking-wider font-semibold opacity-80 mt-1">Tap Tersisa</span>
      </div>
      <p class="text-center text-noor-subtle mt-2 text-xs font-medium">Ketuk dimana saja</p>
    </div>
  </div>
</template>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.5s ease-out;
}
.animate-slide-up {
  animation: slideUp 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}
@keyframes slideUp {
  from { opacity: 0; transform: translate(-50%, 20px); }
  to { opacity: 1; transform: translate(-50%, 0); }
}
</style>
