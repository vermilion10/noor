# Noor - Muslim Companion App

*Noor* is a modern, beautifully designed Muslim Companion Progressive Web App (PWA) built with Vue 3, Vite, and Tailwind CSS. The app features a stunning Material Design 3 (MD3) interface, focusing on high engagement, seamless user experience, and aesthetic precision.

## Features
- **Al-Quran Reader**: Read the Holy Quran by Surah or Juz with a clean, distraction-free interface. Includes Latin transliteration, Indonesian translation (Kemenag), and Tafsir components.
- **ODOJ (One Day One Juz)**: A tracker that automatically aligns with the Hijri or Gregorian calendar to help you maintain a 30-day completion streak. It features accurate progress tracking using precisely calculated ayah counts for each Juz to ensure your goals are perfectly aligned with the Holy Quran structure.
- **Prayer Times**: Automatic location-based or manual city-based prayer times covering regions across Indonesia. Includes a beautiful visual countdown.
- **Qibla Compass**: Hardware-accelerated compass utilizing device orientation APIs to point you towards Mecca.
- **Hijri Calendar & Events**: Check Islamic dates, Ayyamul Bidh fasting days, and important Islamic historical events.
- **Digital Tasbih**: A highly tactile and animated digital counter for your Dhikr needs.
- **Amalan**: A dedicated space for daily spiritual activities, including Al-Ma'tsurat and selected Surahs.
- **Auto-Deployment**: Integrated GitHub Actions for seamless deployment to GitHub Pages on every push to the `main` branch.

## API Credits
This project was made possible by the incredible work of the following open-source APIs:
- **[Al Quran Cloud API](https://alquran.cloud/api)** - Used for fetching Al-Quran data sequentially by Juz (`id.indonesian`).
- **[eQuran / MyQuran API](https://equran.id/apidev/v2)** - Used for reliable Indonesian Prayer Times (Jadwal Sholat Kemenag) drill-down tracking, as well as accessing Surahs.
- **[Aladhan API](https://aladhan.com/prayer-api)** - Used for Hijri-Gregorian calendar conversion and detecting Islamic Holidays dynamically.

## Installation & Development

Navigate to the project folder and install dependencies:
```bash
npm install
```

Start the development server:
```bash
npm run dev
```