<script setup>
import { ref, computed, watch } from 'vue'
import { usePlayStore } from '@/stores/PlaybackHistory'
import { throttle } from '@/utils/throttle'  // 👈 引入节流函数

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

// 二分查找歌词行
function findCurrentLyricIndex(time, lyrics) {
  let low = 0
  let high = lyrics.length - 1
  let index = 0

  while (low <= high) {
    const mid = Math.floor((low + high) / 2)
    if (lyrics[mid].time === time) {
      return mid
    } else if (lyrics[mid].time < time) {
      index = mid
      low = mid + 1
    } else {
      high = mid - 1
    }
  }

  return index
}

// 使用 utils/throttle 封装的节流函数
const throttledUpdate = throttle((currentTime) => {
  const lyrics = parsedLyrics.value
  if (!lyrics.length) return
  currentLine.value = findCurrentLyricIndex(currentTime, lyrics)
}, 500)

watch(() => playStore.currentTime, (currentTime) => {
  throttledUpdate(currentTime)
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
