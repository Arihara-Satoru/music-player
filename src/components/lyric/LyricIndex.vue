<script setup>
import { ref, computed, watch } from 'vue'
import { usePlayStore } from '@/stores/PlaybackHistory'

const playStore = usePlayStore()
const currentLine = ref(0)
const lyricContainer = ref(null)

// 解析LRC歌词
const parsedLyrics = computed(() => {
  if (!playStore.playHistory[0]?.lrc) return []

  const lrcText = playStore.playHistory[0].lrc
  const lines = lrcText.split('\n')
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

// 监听播放进度变化
watch(() => playStore.currentTime, (currentTime) => {
  if (!parsedLyrics.value.length) return

  // 找到当前应该显示的歌词行
  for (let i = 0; i < parsedLyrics.value.length; i++) {
    if (parsedLyrics.value[i].time > currentTime) {
      currentLine.value = Math.max(0, i - 1)
      scrollToCurrentLine()
      return
    }
  }
  currentLine.value = parsedLyrics.value.length - 1
  scrollToCurrentLine()
})

// 滚动到当前歌词行
function scrollToCurrentLine() {
  if (!lyricContainer.value) return

  const container = lyricContainer.value
  const activeLine = container.querySelector('.active')
  if (activeLine) {
    container.scrollTo({
      top: activeLine.offsetTop - container.offsetHeight / 2,
      behavior: 'smooth'
    })
  }
}
</script>

<template>
  <div class="lyric-container"
    ref="lyricContainer">
    <div v-for="(line, index) in parsedLyrics"
      :key="index"
      :class="['lyric-line', { active: index === currentLine }]">
      {{ line.text }}
    </div>
  </div>
</template>

<style scoped>
.lyric-container {
  height: 100%;
  overflow-y: auto;
  text-align: center;
  padding: 20px;
  scroll-behavior: smooth;
}

.lyric-line {
  margin: 15px 0;
  font-size: 16px;
  color: #666;
  transition: all 0.3s ease;
}

.lyric-line.active {
  color: #fff;
  font-size: 18px;
  font-weight: bold;
}
</style>
