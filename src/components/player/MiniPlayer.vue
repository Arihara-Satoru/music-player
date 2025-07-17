<script setup>
import { usePlayStore } from '@/stores/PlaybackHistory'
import { ref, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'

// 使用 Pinia store 来管理播放状态
const playStore = usePlayStore()
// 控制播放列表的显示/隐藏
const showPlaylist = ref(false)
// 标记是否正在拖动进度条
const isSeeking = ref(false)
// 音量控制，初始值为 0.7
const volume = ref(0.7)
// Vue Router 实例，用于页面导航
const router = useRouter()

/**
 * @function watchAudioPlayer
 * @description 监听 playStore 中 audioPlayer 实例的变化，并同步音量滑块的值。
 * 确保当 audioPlayer 实例被创建或更新时，音量滑块能反映当前的音量设置。
 */
watch(
  () => playStore.audioPlayer,
  (newPlayer) => {
    console.log('audioPlayer 变化:', newPlayer)
    if (newPlayer) {
      console.log('同步音量到滑块:', newPlayer.volume)
      volume.value = newPlayer.volume
    }
  },
  { immediate: true }, // 立即执行一次，确保初始同步
)

// 长按定时器，用于区分单击和长按
let longPressTimer = null
// 长按阈值（毫秒）
const LONG_PRESS_THRESHOLD = 300

// 用于存储拖动开始时的鼠标X坐标和进度条的初始宽度
let startX = 0
let startProgressWidth = 0

/**
 * @function formatTime
 * @param {number} seconds - 时间（秒）。
 * @returns {string} 格式化后的时间字符串（MM:SS）。
 * @description 将秒数转换为“分钟:秒”的格式。
 */
const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`
}

/**
 * @function isCurrentSong
 * @param {object} song - 歌曲对象。
 * @returns {boolean} 如果是当前播放歌曲则返回 true。
 * @description 判断传入的歌曲是否是当前正在播放的歌曲。
 */
const isCurrentSong = (song) => {
  return song.hash === playStore.currentHash
}

/**
 * @function handleMouseDown
 * @param {MouseEvent|TouchEvent} e - 鼠标或触摸事件对象。
 * @description 处理鼠标按下或触摸开始事件。
 * 记录初始位置，并启动长按定时器，用于判断是单击还是拖动。
 */
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
    // 绑定全局的 mousemove 和 mouseup 事件，以便在拖动时捕获事件
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    window.addEventListener('touchmove', handleMouseMove)
    window.addEventListener('touchend', handleMouseUp)
  }, LONG_PRESS_THRESHOLD)
}

/**
 * @function handleMouseUp
 * @description 处理鼠标抬起或触摸结束事件。
 * 清除长按定时器，并根据是否进入拖动模式来决定是跳转页面还是结束拖动。
 */
const handleMouseUp = () => {
  clearTimeout(longPressTimer) // 清除定时器
  if (!isSeeking.value) {
    // 如果没有进入拖动模式，说明是单击，跳转到播放主页面
    router.push('/PlayIndex')
  }
  isSeeking.value = false // 结束拖动模式
  // 移除全局的 mousemove 和 mouseup 事件监听器，防止不必要的事件触发
  window.removeEventListener('mousemove', handleMouseMove)
  window.removeEventListener('mouseup', handleMouseUp)
  window.removeEventListener('touchmove', handleMouseMove)
  window.removeEventListener('touchend', handleMouseUp)
}

/**
 * @function handleMouseMove
 * @param {MouseEvent|TouchEvent} e - 鼠标或触摸事件对象。
 * @description 处理鼠标移动或触摸移动事件。
 * 只有在拖动模式下才处理移动，根据鼠标移动距离计算新的播放进度并更新。
 */
const handleMouseMove = (e) => {
  if (!isSeeking.value) return // 只有在拖动模式下才处理移动

  const clientX = e.clientX || e.touches[0].clientX
  const playerContainer = document.querySelector('.player-container') // 获取播放器容器元素
  if (!playerContainer) return

  const rect = playerContainer.getBoundingClientRect() // 获取播放器容器的尺寸和位置
  const deltaX = clientX - startX // 鼠标移动的距离
  // 计算新的进度条宽度百分比，基于初始进度和鼠标移动距离
  const newProgressWidth = startProgressWidth + (deltaX / rect.width) * 100

  // 将百分比限制在 0 到 1 之间，并计算新的播放时间
  const percent = Math.min(1, Math.max(0, newProgressWidth / 100))
  playStore.setCurrentTime(percent * playStore.duration) // 更新 Pinia store 中的播放时间
}

/**
 * @function setVolume
 * @param {number} val - 音量值（0到1之间）。
 * @description 设置播放器的音量。
 * 更新本地 volume ref，并同步到 playStore 中的 audioPlayer 实例。
 */
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

/**
 * @function getPlayModeIcon
 * @returns {string} 对应当前播放模式的图标。
 * @description 根据 playStore.currentPlayMode 返回不同的播放模式图标。
 */
const getPlayModeIcon = () => {
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

// 在组件卸载时确保清除所有事件监听器，防止内存泄漏
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
    <!-- 长按后出现的进度条，显示当前播放时间 -->
    <div
      v-show="isSeeking"
      class="seek-progress"
      :style="{ width: (playStore.currentTime / playStore.duration) * 100 + '%' }"
    >
      {{ formatTime(playStore.currentTime) }}
    </div>

    <!-- 播放器控制区域，当拖动进度条时隐藏 -->
    <div class="player-controls" v-show="!isSeeking">
      <!-- 非按钮区域用于长按/点击，触发页面跳转或进度条拖动 -->
      <div
        class="non-button-area"
        @mousedown="handleMouseDown"
        @mouseup="handleMouseUp"
        @touchstart.passive="handleMouseDown"
        @touchend.passive="handleMouseUp"
        title="长按可调整进度条"
      ></div>
      <!-- 上一首按钮 -->
      <button @click.stop="playStore.playPrev" class="control-btn">⏮</button>
      <!-- 播放/暂停按钮，根据 isPlaying 状态显示不同图标 -->
      <button @click.stop="playStore.togglePlay" class="control-btn">
        {{ playStore.isPlaying ? '⏸' : '⏵' }}
      </button>
      <!-- 下一首按钮 -->
      <button @click.stop="playStore.playNext" class="control-btn">⏭</button>

      <!-- 歌曲信息区域，包含封面和滚动歌名 -->
      <div
        class="song-info"
        @mousedown="handleMouseDown"
        @mouseup="handleMouseUp"
        @touchstart.passive="handleMouseDown"
        @touchend.passive="handleMouseUp"
      >
        <img :src="playStore.currentSongInfo.cover" alt="歌曲封面" />
        <div class="scroll-text">
          {{ playStore.currentSongInfo.name }}
        </div>
      </div>
      <!-- 时间显示，包括当前时间和总时长 -->
      <div class="time-display" :class="{ seeking: isSeeking }">
        {{ formatTime(playStore.currentTime) }} / {{ formatTime(playStore.duration) }}
      </div>
      <!-- 播放模式切换按钮 -->
      <button @click.stop="playStore.togglePlayMode" class="mode-btn">
        {{ getPlayModeIcon() }}
      </button>
      <!-- 音量控制滑块 -->
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
      <!-- 底部控制区域，包含播放列表切换按钮 -->
      <div class="bottom-controls">
        <button @click.stop="showPlaylist = !showPlaylist" class="toggle-playlist">
          {{ showPlaylist ? '▼' : '▲' }}
        </button>
      </div>
    </div>

    <!-- 播放列表容器，通过过渡动画显示/隐藏 -->
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
