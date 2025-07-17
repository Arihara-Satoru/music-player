<script setup>
import { usePlayStore } from '@/stores/PlaybackHistory'
import { ref, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'

const playStore = usePlayStore()
const showPlaylist = ref(false)
const isSeeking = ref(false)
const volume = ref(0.7)
const router = useRouter()

// 监听 audioPlayer 变化以同步音量
watch(
  () => playStore.audioPlayer,
  (newPlayer) => {
    console.log('audioPlayer 变化:', newPlayer)
    if (newPlayer) {
      console.log('同步音量到滑块:', newPlayer.volume)
      volume.value = newPlayer.volume
    }
  },
  { immediate: true },
)

let longPressTimer = null
const LONG_PRESS_THRESHOLD = 300

// 用于存储拖动开始时的鼠标X坐标和进度条的初始宽度
let startX = 0
let startProgressWidth = 0

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`
}

const isCurrentSong = (song) => {
  return song.hash === playStore.currentHash
}

const handleMouseDown = (e) => {
  // 阻止默认行为，避免文本选择等
  e.preventDefault()
  // 记录拖动开始时的鼠标X坐标
  startX = e.clientX || e.touches[0].clientX
  // 记录当前进度条的宽度百分比
  startProgressWidth = (playStore.currentTime / playStore.duration) * 100

  // 鼠标按下时启动定时器
  longPressTimer = setTimeout(() => {
    isSeeking.value = true // 达到长按阈值，进入拖动模式
    // 绑定全局的 mousemove 和 mouseup 事件
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    window.addEventListener('touchmove', handleMouseMove)
    window.addEventListener('touchend', handleMouseUp)
  }, LONG_PRESS_THRESHOLD)
}

const handleMouseUp = () => {
  clearTimeout(longPressTimer) // 清除定时器
  if (!isSeeking.value) {
    // 如果没有进入拖动模式，说明是单击，跳转页面
    router.push('/PlayIndex')
  }
  isSeeking.value = false // 结束拖动模式
  // 移除全局的 mousemove 和 mouseup 事件监听器
  window.removeEventListener('mousemove', handleMouseMove)
  window.removeEventListener('mouseup', handleMouseUp)
  window.removeEventListener('touchmove', handleMouseMove)
  window.removeEventListener('touchend', handleMouseUp)
}

const handleMouseMove = (e) => {
  if (!isSeeking.value) return // 只有在拖动模式下才处理移动

  const clientX = e.clientX || e.touches[0].clientX
  const playerContainer = document.querySelector('.player-container') // 获取播放器容器
  if (!playerContainer) return

  const rect = playerContainer.getBoundingClientRect() // 获取播放器容器的尺寸和位置
  const deltaX = clientX - startX // 鼠标移动的距离
  const newProgressWidth = startProgressWidth + (deltaX / rect.width) * 100 // 计算新的进度条宽度百分比

  const percent = Math.min(1, Math.max(0, newProgressWidth / 100)) // 限制在 0 到 1 之间
  playStore.setCurrentTime(percent * playStore.duration)
}

const setVolume = (val) => {
  console.log('设置音量值:', val)
  volume.value = val
  if (playStore.audioPlayer) {
    console.log('audioPlayer 实例存在，设置音量')
    playStore.audioPlayer.volume = val
    console.log('当前实际音量:', playStore.audioPlayer.volume)
  } else {
    console.warn('audioPlayer 实例不存在')
  }
}

const getPlayModeIcon = () => {
  // 根据 playStore.currentPlayMode 返回不同图标
  switch (playStore.currentPlayMode) {
    case '顺序播放':
      return '🔁' // 顺序播放图标
    case '单曲循环':
      return '🔂' // 单曲循环图标
    case '随机播放':
      return '🔀' // 随机播放图标
    default:
      return '→' // 默认图标
  }
}

// 在组件卸载时确保清除所有事件监听器
onUnmounted(() => {
  clearTimeout(longPressTimer)
  window.removeEventListener('mousemove', handleMouseMove)
  window.removeEventListener('mouseup', handleMouseUp)
  window.removeEventListener('touchmove', handleMouseMove)
  window.removeEventListener('touchend', handleMouseUp)
})
</script>

<template>
  <div class="player-container">
    <!-- 长按后出现的进度条 -->
    <!-- 进度条单独放置，始终在最上层 -->
    <div
      v-show="isSeeking"
      class="seek-progress"
      :style="{ width: (playStore.currentTime / playStore.duration) * 100 + '%' }"
    >
      {{ formatTime(playStore.currentTime) }}
    </div>

    <!-- 控制区域，进度条显示时隐藏 -->
    <div class="player-controls" v-show="!isSeeking">
      <!-- 非按钮区域用于长按/点击 -->
      <div
        class="non-button-area"
        @mousedown="handleMouseDown"
        @mouseup="handleMouseUp"
        @touchstart.passive="handleMouseDown"
        @touchend.passive="handleMouseUp"
        title="长按可调整进度条"
      ></div>
      <button @click.stop="playStore.playPrev" class="control-btn">⏮</button>
      <button @click.stop="playStore.togglePlay" class="control-btn">
        {{ playStore.isPlaying ? '⏸' : '⏵' }}
      </button>
      <button @click.stop="playStore.playNext" class="control-btn">⏭</button>

      <div
        class="song-info"
        @mousedown="handleMouseDown"
        @mouseup="handleMouseUp"
        @touchstart.passive="handleMouseDown"
        @touchend.passive="handleMouseUp"
      >
        <img :src="playStore.currentSongInfo.cover" alt="" />
        <div class="scroll-text">
          {{ playStore.currentSongInfo.name }}
        </div>
      </div>
      <div class="time-display" :class="{ seeking: isSeeking }">
        {{ formatTime(playStore.currentTime) }} / {{ formatTime(playStore.duration) }}
      </div>
      <button @click.stop="playStore.togglePlayMode" class="mode-btn">
        {{ getPlayModeIcon() }}
      </button>
      <div class="volume-control">
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          v-model="volume"
          @input="setVolume(volume)"
          class="volume-bar"
        />
      </div>
      <div class="bottom-controls">
        <button @click.stop="showPlaylist = !showPlaylist" class="toggle-playlist">
          {{ showPlaylist ? '▼' : '▲' }}
        </button>
      </div>
    </div>

    <transition name="playlist">
      <div class="playlist-container" v-show="showPlaylist">
        <div
          v-for="(song, index) in playStore.MusicList"
          :key="index"
          :class="['playlist-item', { 'active-song': isCurrentSong(song) }]"
          @click="playStore.playSong(index)"
        >
          {{ song.name }} - {{ song.artist }}
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped lang="scss">
.player-container {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  padding: 15px;
  background-color: rgba(255, 255, 255, 0.3); /* 更透明的背景 */
  backdrop-filter: blur(20px); /* 更柔和的高斯模糊效果 */
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  cursor: pointer;

  .seek-progress {
    top: 0;
    left: 0;
    width: 100%;
    height: 60px;
    background-color: rgba(64, 158, 255, 0.3);
    z-index: 999;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 26px;
    color: white;
    cursor: grab;
  }
}

.player-controls {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 15px;
  user-select: none;
  z-index: 10;
  position: relative;

  * {
    z-index: 4;
  }

  button {
    z-index: 10;
    position: relative;
  }

  .non-button-area {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    z-index: 1;
    /* 排除按钮区域 */
    clip-path: polygon(
      0 0,
      200px 0,
      200px 100%,
      0 100%,
      0 0,
      calc(100% - 200px) 0,
      100% 0,
      100% 100%,
      calc(100% - 200px) 100%,
      200px 100%
    );
  }
}

.control-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  padding: 5px;
}

.progress-container {
  flex-grow: 1;
  display: flex;
  align-items: center;
  gap: 10px;
}

.progress-bar {
  flex-grow: 1;
  height: 4px;
}

.volume-control {
  width: 100px;
}

.time {
  font-size: 12px;
  color: #666;
}

.song-info {
  width: 200px;
  display: flex;
  align-items: center;
  overflow: hidden;
  /* 隐藏溢出的内容 */
  white-space: nowrap;
  /* 防止文本换行 */
  position: relative;
  /* 用于绝对定位滚动内容 */
}

.song-info .scroll-text {
  display: inline-block;
  animation: scroll-text 10s linear infinite;
  /* 自动滚动动画 */
  position: relative;
  left: 100%;
  /* 初始位置在右侧 */
}

.song-info img {
  width: 40px;
  margin-right: 10px;
  z-index: 999;
  /* 添加图片和文本之间的间距 */
}

/* 隐藏滚动条 */
.song-info::-webkit-scrollbar {
  display: none;
  /* Chrome, Safari, Edge */
}

.song-info {
  -ms-overflow-style: none;
  /* IE and Edge */
  scrollbar-width: none;
  /* Firefox */
}

/* 自动滚动动画 */
@keyframes scroll-text {
  0% {
    left: 100%;
  }

  100% {
    left: -100%;
  }
}

.bottom-controls {
  display: flex;
  right: 10px;
  margin-left: auto;
}

.time-display {
  padding: 5px 10px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.time-display.seeking {
  background-color: #e0e0e0;
}

.toggle-playlist {
  display: block;
  padding: 8px;
  background: #e0e0e0;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.playlist-container {
  max-height: 300px;
  overflow: auto;
  background: white;
  border-radius: 4px;
}

/* 动画过程 */
.playlist-enter-active,
.playlist-leave-active {
  transition: max-height 0.3s ease;
}

/* 开始进入 和 离开结束时：收起状态 */
.playlist-enter-from,
.playlist-leave-to {
  max-height: 0;
  overflow: hidden;
}

/* 进入结束 和 离开开始时：展开状态 */
.playlist-enter-to,
.playlist-leave-from {
  max-height: 300px;
  overflow: hidden;
}

.playlist-item {
  padding: 8px 12px;
  border-bottom: 1px solid #eee;
  cursor: pointer;
  transition: background-color 0.2s;
}

.active-song {
  background-color: #797979;
}

.playlist-item:hover {
  background: #e9e9e9;
}

.get-more {
  width: 100%;
  text-align: center;
}
</style>
