import { createRouter, createWebHashHistory } from 'vue-router'

const HomeView = () => import('@/views/HomeView.vue')
const QuranView = () => import('@/views/QuranView.vue')
const PrayerView = () => import('@/views/PrayerView.vue')
const DhikrView = () => import('@/views/DhikrView.vue')
const MoreView = () => import('@/views/MoreView.vue')

const router = createRouter({
  history: createWebHashHistory('/noor/'), 
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/quran',
      name: 'quran',
      component: QuranView
    },
    {
      path: '/quran/:id',
      name: 'surah',
      component: () => import('@/views/SurahView.vue')
    },
    {
      path: '/juz/:id',
      name: 'juz',
      component: () => import('@/views/JuzView.vue')
    },
    {
      path: '/odoj',
      name: 'odoj',
      component: () => import('@/views/OdojView.vue')
    },
    {
      path: '/prayer',
      name: 'prayer',
      component: PrayerView
    },
    {
      path: '/amalan',
      name: 'amalan',
      component: DhikrView
    },
    {
      path: '/dhikr/matsurat/:type',
      name: 'dhikr-reader',
      component: () => import('@/views/DhikrReaderView.vue')
    },
    {
      path: '/calendar',
      name: 'calendar',
      component: () => import('@/views/CalendarView.vue')
    },
    {
      path: '/tasbih',
      name: 'tasbih',
      component: () => import('@/views/TasbihView.vue')
    },
    {
      path: '/more',
      name: 'more',
      component: MoreView
    },
    {
      path: '/bookmarks',
      name: 'bookmarks',
      component: () => import('@/views/BookmarksView.vue')
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('@/views/SettingsView.vue')
    }
  ]
})

export default router
