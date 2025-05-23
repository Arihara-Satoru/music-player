<script setup>
import { ref, computed, watch } from 'vue'
import { usePlayStore } from '@/stores/PlaybackHistory'

const playStore = usePlayStore()

// 当前歌词高亮行
const currentHighlightedLine = ref(0)
// 歌词容器 DOM 引用
const lyricsContainerRef = ref(null)

// ✅ 当前播放的歌曲（基于 currentHash 响应式查找）
const currentSong = computed(() => {
  return playStore.MusicList.find(song => song.hash === playStore.currentHash) || {}
})

// ✅ 解析歌词（LRC）为结构化数组
const parsedLyrics = computed(() => {
  if (!currentSong.value?.lrc) return []

  return currentSong.value.lrc
    .split('\n')
    .map(line => {
      const timeMatch = /\[(\d{2}):(\d{2})\.(\d{2,3})\]/.exec(line)
      if (!timeMatch) return null

      const [, minutes, seconds, milliseconds] = timeMatch
      const timeInSeconds =
        parseInt(minutes) * 60 +
        parseInt(seconds) +
        parseInt(milliseconds) / 1000

      const text = line.replace(/\[\d{2}:\d{2}\.\d{2,3}\]/, '').trim()

      return {
        time: timeInSeconds,
        text
      }
    })
    .filter(line => line && line.text !== '')
})

// ✅ 歌曲切换时重置歌词高亮
watch(() => playStore.currentHash, () => {
  currentHighlightedLine.value = 0
  scrollToHighlightedLine()
})

// ✅ 播放时间变化时更新高亮歌词行
watch(() => playStore.currentTime, (currentTime) => {
  if (!parsedLyrics.value.length) return

  for (let i = 0; i < parsedLyrics.value.length; i++) {
    if (parsedLyrics.value[i].time > currentTime) {
      currentHighlightedLine.value = Math.max(0, i - 1)
      scrollToHighlightedLine()
      return
    }
  }
  currentHighlightedLine.value = parsedLyrics.value.length - 1
  scrollToHighlightedLine()
})

// ✅ 滚动到当前歌词行
function scrollToHighlightedLine() {
  if (!lyricsContainerRef.value) return

  const activeLine = lyricsContainerRef.value.querySelector('.active')
  if (activeLine) {
    lyricsContainerRef.value.scrollTo({
      top: activeLine.offsetTop - lyricsContainerRef.value.offsetHeight / 2,
      behavior: 'smooth'
    })
  }
}
</script>

<template>
  <div class="lyrics-container"
    ref="lyricsContainerRef">
    <div v-for="(line, index) in parsedLyrics"
      :key="index"
      :class="['lyrics-line', { active: index === currentHighlightedLine }]">
      {{ line.text }}
    </div>
  </div>
</template>

<style scoped>
.lyrics-container {
  height: 100%;
  overflow-y: auto;
  text-align: center;
  padding: 20px;
  scroll-behavior: smooth;
}

.lyrics-line {
  margin: 15px 0;
  font-size: 16px;
  color: #888;
  transition: all 0.3s ease;
}

.lyrics-line.active {
  color: #fff;
  font-size: 18px;
  font-weight: bold;
}
</style>
