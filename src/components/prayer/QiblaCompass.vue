<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'

const props = defineProps<{
  latitude: number | null
  longitude: number | null
}>()

const MECCA_LAT = 21.422487
const MECCA_LNG = 39.826206

const qiblaAngle = ref<number | null>(null)
const deviceHeading = ref<number | null>(null) // azimuth: 0 = north, 90 = east, etc.
const isSupported = ref(true)
const needsPermission = ref(false)

// calculate kiblat bearing from true north using haversine
const calculateQibla = (lat: number, lng: number) => {
  const phiK = (MECCA_LAT * Math.PI) / 180.0
  const lambdaK = (MECCA_LNG * Math.PI) / 180.0
  const phi = (lat * Math.PI) / 180.0
  const lambda = (lng * Math.PI) / 180.0
  
  const y = Math.sin(lambdaK - lambda) * Math.cos(phiK)
  const x = Math.cos(phi) * Math.sin(phiK) - Math.sin(phi) * Math.cos(phiK) * Math.cos(lambdaK - lambda)
  
  let qibla = Math.atan2(y, x) * (180.0 / Math.PI)
  if (qibla < 0) qibla += 360
  qiblaAngle.value = qibla
}

watch([() => props.latitude, () => props.longitude], ([lat, lng]) => {
  if (lat && lng) calculateQibla(lat, lng)
}, { immediate: true })

const handleOrientation = (event: DeviceOrientationEvent) => {
  // webkitCompassHeading is for iOS
  let heading = (event as any).webkitCompassHeading
  
  if (!heading && event.alpha != null) {
    // for android
    heading = 360 - event.alpha
  }

  if (heading !== undefined && heading !== null) {
    deviceHeading.value = heading
  }
}

const requestPermission = async () => {
  if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
    try {
      const permissionState = await (DeviceOrientationEvent as any).requestPermission()
      if (permissionState === 'granted') {
        needsPermission.value = false
        window.addEventListener('deviceorientation', handleOrientation, true)
      } else {
        isSupported.value = false
      }
    } catch (e) {
      console.error(e)
    }
  }
}

onMounted(() => {
  if (!window.DeviceOrientationEvent) {
    isSupported.value = false
    return
  }

  // iOS 13+ requires explicit permission
  if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
    needsPermission.value = true
  } else {
    window.addEventListener('deviceorientationabsolute', handleOrientation, true) || 
    window.addEventListener('deviceorientation', handleOrientation, true)
  }
})

onUnmounted(() => {
  window.removeEventListener('deviceorientationabsolute', handleOrientation, true)
  window.removeEventListener('deviceorientation', handleOrientation, true)
})

// determine pointing rotation
const compassRotation = computed(() => {
  if (qiblaAngle.value == null || deviceHeading.value == null) return null
  return qiblaAngle.value - deviceHeading.value
})

const isFacingQibla = computed(() => {
  if (compassRotation.value == null) return false
  const diff = Math.abs(compassRotation.value % 360) 
  // allow delta of +/- 5 degrees
  return diff < 5 || diff > 355
})
</script>

<template>
  <div class="flex flex-col items-center justify-center p-6 bg-noor-surface rounded-3xl border shadow-sm transition-all"
       :class="isFacingQibla ? 'border-noor-primary/50 shadow-[0_0_20px_rgba(74,124,89,0.3)] bg-noor-primary/10' : 'border-noor-border'">
    
    <div v-if="!isSupported" class="text-center text-noor-subtle mb-4">
      Kompas tidak didukung di perangkat/browser Anda.
    </div>

    <div v-else-if="needsPermission" class="text-center mb-4">
      <p class="text-noor-text mb-2 text-sm">Akses sensor dibutuhkan untuk melihat kompas kiblat.</p>
      <button @click="requestPermission" class="px-4 py-2 bg-noor-primary text-white rounded-full font-medium shadow-sm hover:brightness-110">
        Izinkan Kompas
      </button>
    </div>

    <div v-else class="relative w-48 h-48 rounded-full border-[6px] transition-colors flex items-center justify-center"
         :class="isFacingQibla ? 'border-noor-primary shadow-lg shadow-noor-primary/20' : 'border-noor-border bg-noor-bg'">
      
      <!-- Compass Face Marks -->
      <div class="absolute inset-0 rounded-full border border-noor-border/50"></div>
      <span class="absolute top-2 text-[10px] text-noor-subtle font-bold">N</span>
      <span class="absolute bottom-2 text-[10px] text-noor-subtle font-bold">S</span>
      <span class="absolute right-2 text-[10px] text-noor-subtle font-bold">E</span>
      <span class="absolute left-2 text-[10px] text-noor-subtle font-bold">W</span>

      <div class="w-full h-full absolute transition-transform duration-300 ease-out flex flex-col items-center"
           v-if="compassRotation != null"
           :style="`transform: rotate(${compassRotation}deg)`">
        
        <!-- Needle pointing to Qibla -->
        <!-- SVG of Kaaba or Arrow -->
        <div class="w-8 h-20 -mt-2 flex flex-col items-center">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-10 h-10 -mt-2 transition-colors"
                 :class="isFacingQibla ? 'text-noor-primary drop-shadow-[0_0_5px_rgba(74,124,89,0.8)]' : 'text-noor-muted'">
              <path d="M12 2L6 10H10V22H14V10H18L12 2Z" fill="currentColor"/>
            </svg>
        </div>
      </div>
      
      <!-- Center Dot -->
      <div class="w-3 h-3 rounded-full absolute" :class="isFacingQibla ? 'bg-noor-primary' : 'bg-noor-muted'"></div>
      
      <div v-if="deviceHeading == null && !needsPermission && isSupported" class="absolute inset-0 flex items-center justify-center bg-noor-bg/80 rounded-full text-noor-subtle text-xs text-center px-4">
        Kalibrasi sensor... (gerakkan HP)
      </div>
    </div>

    <!-- Info text below -->
    <div class="mt-4 text-center">
      <h3 class="text-noor-text font-bold tracking-wide">Arah Kiblat</h3>
      <p class="text-noor-subtle text-sm mt-1" v-if="qiblaAngle">
        {{ qiblaAngle.toFixed(1) }}° dari Utara
      </p>
      <p class="text-noor-primary font-bold text-sm mt-1 animate-pulse" v-if="isFacingQibla">
        Anda Menghadap Kiblat
      </p>
    </div>
  </div>
</template>
