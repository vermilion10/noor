/** 
 * Accurate juz boundaries (Surah ID:Ayah Number) 
 */
export const JUZ_BOUNDARIES = [
  { id: 1, start: [1, 1], end: [2, 141] },
  { id: 2, start: [2, 142], end: [2, 252] },
  { id: 3, start: [2, 253], end: [3, 92] },
  { id: 4, start: [3, 93], end: [4, 23] },
  { id: 5, start: [4, 24], end: [4, 147] },
  { id: 6, start: [4, 148], end: [5, 81] },
  { id: 7, start: [5, 82], end: [6, 110] },
  { id: 8, start: [6, 111], end: [7, 87] },
  { id: 9, start: [7, 88], end: [8, 40] },
  { id: 10, start: [8, 41], end: [9, 92] },
  { id: 11, start: [9, 93], end: [11, 5] },
  { id: 12, start: [11, 6], end: [12, 52] },
  { id: 13, start: [12, 53], end: [14, 52] },
  { id: 14, start: [15, 1], end: [16, 128] },
  { id: 15, start: [17, 1], end: [18, 74] },
  { id: 16, start: [18, 75], end: [20, 135] },
  { id: 17, start: [21, 1], end: [22, 78] },
  { id: 18, start: [23, 1], end: [25, 20] },
  { id: 19, start: [25, 21], end: [27, 55] },
  { id: 20, start: [27, 56], end: [29, 45] },
  { id: 21, start: [29, 46], end: [33, 30] },
  { id: 22, start: [33, 31], end: [36, 27] },
  { id: 23, start: [36, 28], end: [39, 31] },
  { id: 24, start: [39, 32], end: [41, 46] },
  { id: 25, start: [41, 47], end: [45, 37] },
  { id: 26, start: [46, 1], end: [51, 30] },
  { id: 27, start: [51, 31], end: [57, 29] },
  { id: 28, start: [58, 1], end: [66, 12] },
  { id: 29, start: [67, 1], end: [77, 50] },
  { id: 30, start: [78, 1], end: [114, 6] }
]

/**
 * Returns the Juz ID for a given surah:ayah.
 */
export function getJuzIdForAyah(surahId: number, ayahNumber: number): number {
  for (const juz of JUZ_BOUNDARIES) {
    const [startSurah, startAyah] = juz.start;
    const [endSurah, endAyah] = juz.end;

    // Surah check
    if (surahId > startSurah && surahId < endSurah) return juz.id;
    
    // Boundary surah checks
    if (surahId === startSurah && surahId === endSurah) {
        if (ayahNumber >= startAyah && ayahNumber <= endAyah) return juz.id;
    } else if (surahId === startSurah) {
        if (ayahNumber >= startAyah) return juz.id;
    } else if (surahId === endSurah) {
        if (ayahNumber <= endAyah) return juz.id;
    }
  }
  return 0; // Not found
}
