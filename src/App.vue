<script setup lang="ts">
import { Home, BookOpen, Clock, Heart, Menu } from 'lucide-vue-next'
import { useRoute } from 'vue-router'

const route = useRoute()

const navItems = [
  { name: 'Beranda', path: '/', icon: Home },
  { name: 'Quran', path: '/quran', icon: BookOpen },
  { name: 'Sholat', path: '/prayer', icon: Clock },
  { name: 'Amalan', path: '/amalan', icon: Heart },
  { name: 'Lainnya', path: '/more', icon: Menu }
]
</script>

<template>
  <div class="h-screen w-screen flex flex-col bg-noor-bg text-noor-text overflow-hidden">
    <!-- Main Content Area -->
    <main class="flex-1 overflow-y-auto w-full max-w-screen-md mx-auto relative pb-[70px] md:pb-0 hide-scrollbar">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <!-- Bottom Navigation (Mobile) -->
    <nav class="md:hidden fixed bottom-0 left-0 right-0 bg-noor-surface border-t border-noor-border h-[70px] z-50">
      <ul class="flex justify-around items-center h-full max-w-md mx-auto px-2">
        <li v-for="item in navItems" :key="item.path" class="flex-1">
          <router-link
            :to="item.path"
            class="flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors"
            :class="[
              route.path === item.path ? 'text-noor-primary' : 'text-noor-muted hover:text-noor-subtle'
            ]"
          >
            <component :is="item.icon" :size="24" :class="{ 'fill-current': route.path === item.path }" />
            <span class="text-[10px] font-medium">{{ item.name }}</span>
          </router-link>
        </li>
      </ul>
    </nav>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Hide scrollbar for the main wrapper but keep functionality */
.hide-scrollbar {
  -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;  /* Firefox */
}
.hide-scrollbar::-webkit-scrollbar {
  display: none;
}
</style>
