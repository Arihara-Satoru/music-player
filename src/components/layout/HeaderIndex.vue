<script setup>
import { ref, computed, watch } from 'vue'
import { usePlayStore } from '@/stores/PlaybackHistory'

const playStore = usePlayStore()
const currentLine = ref(0)

const currentSong = computed(() => {
  return playStore.MusicList.find(song => song.hash === playStore.currentHash) || {}
})

const parsedLyrics = computed(() => {
  if (!currentSong.value?.lrc) return []

  const lines = currentSong.value.lrc.split('\n')
  const timeRegex = /\[(\d{2}):(\d{2})\.(\d{2,3})\]/

  return lines.map(line => {
    const matches = timeRegex.exec(line)
    if (!matches) return null

    const minutes = parseInt(matches[1])
    const seconds = parseInt(matches[2])
    const milliseconds = parseInt(matches[3])
    const time = minutes * 60 + seconds + milliseconds / 1000

    const text = line.replace(timeRegex, '').trim()
    return { time, text }
  }).filter(item => item !== null && item.text !== '')
})

watch(() => playStore.currentTime, (currentTime) => {
  if (!parsedLyrics.value.length) return

  for (let i = 0; i < parsedLyrics.value.length; i++) {
    if (parsedLyrics.value[i].time > currentTime) {
      currentLine.value = Math.max(0, i - 1)
      return
    }
  }
  currentLine.value = parsedLyrics.value.length - 1
})

watch(() => playStore.currentHash, () => {
  currentLine.value = 0
})
</script>

<template>
  <div class="current-lyric">
    {{ parsedLyrics[currentLine]?.text || '' }}
  </div>
</template>

<style scoped>
.current-lyric {
  text-align: center;
  font-size: 18px;
  color: #fff;
  font-weight: bold;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 20px;
}
</style>
