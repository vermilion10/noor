import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface BookmarkNote {
  id: string
  surahId: number
  surahName: string
  ayahNumber: number
  arabicText: string
  noteText: string
  createdAt: string
}

export const useBookmarkStore = defineStore('bookmarks', () => {
  const bookmarks = ref<BookmarkNote[]>([])

  const addBookmark = (
    surahId: number, 
    surahName: string, 
    ayahNumber: number, 
    arabicText: string,
    note: string = ''
  ) => {
    const id = `${surahId}-${ayahNumber}`
    const existingIndex = bookmarks.value.findIndex(b => b.id === id)
    
    if (existingIndex > -1) {
      if (note) bookmarks.value[existingIndex].noteText = note
    } else {
      bookmarks.value.unshift({
        id,
        surahId,
        surahName,
        ayahNumber,
        arabicText,
        noteText: note,
        createdAt: new Date().toISOString()
      })
    }
  }

  const removeBookmark = (id: string) => {
    bookmarks.value = bookmarks.value.filter(b => b.id !== id)
  }
  
  const getNote = (surahId: number, ayahNumber: number) => {
    return bookmarks.value.find(b => b.surahId === surahId && b.ayahNumber === ayahNumber)?.noteText || ''
  }

  return {
    bookmarks,
    addBookmark,
    removeBookmark,
    getNote
  }
}, {
  persist: true
})
