<script setup>
import { ref, computed, watch } from 'vue'
import { usePlayStore } from '@/stores/PlaybackHistory'

// 初始化播放历史存储
const playStore = usePlayStore()
// 当前高亮的歌词行索引
const currentHighlightedLine = ref(0)
// 歌词容器的引用，用于滚动控制
const lyricsContainerRef = ref(null)

/**
 * 解析LRC歌词格式为可用的时间戳和文本数组
 */
const currentSong = computed(() => {
  const list = playStore.MusicList || []
  const hash = playStore.currentHash
  return list.find(song => song.hash === hash) || {}
})

const parsedLyrics = computed(() => {
  if (!currentSong.value?.lrc) return []

  console.log(currentSong.value.lrc)

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
        text: text || ''
      }
    })
    .filter(line => line !== null && line.text !== '')
})

/**
 * 当歌曲切换时重置高亮行
 */
watch(() => [playStore.page, playStore.MusicList], () => {
  currentHighlightedLine.value = 0
})

/**
 * 根据播放时间更新当前高亮歌词行
 */
watch(() => playStore.currentTime, (currentTime) => {
  // 如果没有解析出歌词，则不进行处理
  if (!parsedLyrics.value.length) return

  // 找到当前时间对应的歌词行
  for (let i = 0; i < parsedLyrics.value.length; i++) {
    if (parsedLyrics.value[i].time > currentTime) {
      currentHighlightedLine.value = Math.max(0, i - 1)
      scrollToHighlightedLine()
      return
    }
  }
  // 如果当前时间超过了所有歌词行的时间，则高亮最后一行
  currentHighlightedLine.value = parsedLyrics.value.length - 1
  scrollToHighlightedLine()
})

/**
 * 滚动容器使当前歌词行居中
 */
function scrollToHighlightedLine() {
  // 如果歌词容器引用不存在，则不进行处理
  if (!lyricsContainerRef.value) return

  // 查找当前高亮的歌词行元素
  const activeLine = lyricsContainerRef.value.querySelector('.active')
  // 如果找到了高亮的歌词行元素，则滚动容器使其居中
  if (activeLine) {
    lyricsContainerRef.value.scrollTo({
      top: activeLine.offsetTop - lyricsContainerRef.value.offsetHeight / 2,
      behavior: 'smooth'
    })
  }
}
</script>

<template>
  <!-- 歌词容器 -->
  <div class="lyrics-container"
    ref="lyricsContainerRef">
    <!-- 循环渲染歌词行 -->
    <div v-for="(line, index) in parsedLyrics"
      :key="index"
      :class="['lyrics-line', { active: index === currentHighlightedLine }]">
      {{ line.text }}
    </div>
  </div>
</template>

<style scoped>
/* 歌词容器样式 */
.lyrics-container {
  height: 100%;
  overflow-y: auto;
  text-align: center;
  padding: 20px;
  scroll-behavior: smooth;
}

/* 歌词行样式 */
.lyrics-line {
  margin: 15px 0;
  font-size: 16px;
  color: #666;
  transition: all 0.3s ease;
}

/* 当前高亮的歌词行样式 */
.lyrics-line.active {
  color: #fff;
  font-size: 18px;
  font-weight: bold;
}
</style>
