<script setup lang="ts">
import { useRouter } from 'vue-router'
import { Settings, Bookmark, Calendar, Activity, Info } from 'lucide-vue-next'

const router = useRouter()

const menus = [
  { name: 'Tasbih Digital', icon: Activity, path: '/tasbih', color: 'text-rose-400' },
  { name: 'Kalender Hijriyah', icon: Calendar, path: '/calendar', color: 'text-amber-400' },
  { name: 'Penanda & Catatan', icon: Bookmark, path: '/bookmarks', color: 'text-blue-400' },
  { name: 'Pengaturan', icon: Settings, path: '/settings', color: 'text-slate-400' },
]
</script>

<template>
  <div class="p-4 space-y-6 flex flex-col h-full min-h-screen bg-noor-bg">
    <header class="py-2">
      <h1 class="text-2xl font-bold text-noor-text">Lainnya</h1>
    </header>

    <div class="space-y-2 flex-grow">
      <div 
        v-for="menu in menus" 
        :key="menu.name"
        @click="router.push(menu.path)"
        class="bg-noor-surface p-4 rounded-xl border border-noor-border flex items-center cursor-pointer hover:border-noor-primary transition-colors hover:scale-[1.02] active:scale-[0.98]"
      >
        <div class="w-10 h-10 rounded-full bg-noor-bg flex items-center justify-center mr-4">
          <component :is="menu.icon" :class="menu.color" :size="20" />
        </div>
        <span class="text-noor-text font-medium text-lg">{{ menu.name }}</span>
      </div>
    </div>
    
    <!-- Info Footer -->
    <div class="mt-auto py-8 text-center bg-noor-bg p-4 rounded-xl border border-noor-surface flex items-center justify-center space-x-2 text-noor-subtle mb-[40px]">
      <Info :size="16" />
      <span class="text-sm">Noor v1.0.0</span>
    </div>
  </div>
</template>
