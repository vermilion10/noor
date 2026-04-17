<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useBookmarkStore } from '@/stores/bookmarkStore'
import { ArrowLeft, Trash2, Edit3, MessageSquare } from 'lucide-vue-next'

const router = useRouter()
const store = useBookmarkStore()

const goBack = () => router.push('/more')

const goToSurah = (surahId: number, ayahNumber: number) => {
  router.push(`/quran/${surahId}#ayat-${ayahNumber}`)
}

const deleteBookmark = (id: string, e: Event) => {
  e.stopPropagation()
  if (confirm('Hapus dari penanda?')) {
    store.removeBookmark(id)
  }
}

const editingBookmark = ref<string | null>(null)
const tempNote = ref('')

const openEditModal = (id: string, currentNote: string, e: Event) => {
  e.stopPropagation()
  editingBookmark.value = id
  tempNote.value = currentNote
}

const saveNote = () => {
  if (editingBookmark.value) {
    const b = store.bookmarks.find(x => x.id === editingBookmark.value)
    if (b) {
      store.addBookmark(b.surahId, b.surahName, b.ayahNumber, b.arabicText, tempNote.value)
    }
  }
  editingBookmark.value = null
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
          <h1 class="text-lg font-bold text-noor-text tracking-wide">Penanda & Catatan</h1>
        </div>
        <div class="w-8"></div>
      </div>
    </header>

    <div class="p-4 space-y-4 pt-6">
      
      <div v-if="store.bookmarks.length === 0" class="text-center py-20 opacity-50 flex flex-col items-center">
        <MessageSquare :size="48" class="mb-4 text-noor-muted" />
        <p class="text-noor-text font-medium">Belum ada penanda.</p>
        <p class="text-sm mt-1">Gunakan fitur bookmark di ayat Quran untuk menyimpannya.</p>
      </div>

      <div 
        v-for="b in store.bookmarks" 
        :key="b.id"
        @click="goToSurah(b.surahId, b.ayahNumber)"
        class="bg-noor-surface rounded-3xl border border-noor-border p-5 shadow-sm cursor-pointer hover:border-noor-primary transition-all group"
      >
        <div class="flex flex-col sm:flex-row justify-between mb-4">
          <div class="flex items-center space-x-2">
            <span class="bg-noor-primary/10 text-noor-primary px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase">
              {{ b.surahName }} : {{ b.ayahNumber }}
            </span>
            <span class="text-[10px] text-noor-subtle">{{ new Date(b.createdAt).toLocaleDateString('id-ID') }}</span>
          </div>
          <div class="flex items-center space-x-1 mt-3 sm:mt-0 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
            <button @click="(e) => openEditModal(b.id, b.noteText, e)" class="p-2 rounded-full bg-noor-bg text-noor-subtle hover:text-noor-primary">
              <Edit3 :size="16" />
            </button>
            <button @click="(e) => deleteBookmark(b.id, e)" class="p-2 rounded-full bg-noor-bg text-noor-subtle hover:text-red-400">
              <Trash2 :size="16" />
            </button>
          </div>
        </div>

        <p class="arabic-text text-2xl text-right text-noor-text mb-4 leading-relaxed line-clamp-3">
          {{ b.arabicText }}
        </p>

        <div v-if="b.noteText" class="bg-noor-bg p-4 rounded-2xl border-l-4 border-noor-primary mt-4">
          <p class="text-sm text-noor-subtle italic">"{{ b.noteText }}"</p>
        </div>
      </div>

    </div>

    <!-- Edit Modal -->
    <div v-if="editingBookmark" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" @click.self="editingBookmark = null">
      <div class="bg-noor-surface w-full max-w-sm rounded-[2rem] p-6 shadow-2xl border border-noor-border animate-slide-up">
        <h3 class="text-lg font-bold text-noor-text mb-4">Catatan Pribadi</h3>
        <textarea 
          v-model="tempNote" 
          rows="4" 
          placeholder="Tulis refleksi atau catatan Anda (opsional)..."
          class="w-full bg-noor-bg border border-noor-border text-noor-text rounded-2xl p-4 focus:outline-none focus:border-noor-primary resize-none text-sm"
        ></textarea>
        <div class="flex space-x-3 mt-6">
          <button @click="editingBookmark = null" class="flex-1 py-3 bg-noor-bg text-noor-text rounded-full font-semibold border border-noor-border hover:bg-noor-border/20">Batal</button>
          <button @click="saveNote" class="flex-1 py-3 bg-noor-primary text-white rounded-full font-bold hover:brightness-110 shadow-lg shadow-noor-primary/20">Simpan</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-fade-in { animation: fadeIn 0.2s ease-out; }
.animate-slide-up { animation: slideUp 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes slideUp { from { opacity: 0; transform: translateY(20px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
</style>
