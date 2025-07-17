<template>
  <div class="music-player-container">
    <!-- 头部区域：包含返回按钮和窗口控制按钮 -->
    <header class="player-header">
      <!-- 返回按钮，点击后返回上一页 -->
      <button class="control-btn" @click="goBack">←</button>
      <!-- 窗口控制按钮组 -->
      <div class="window-controls">
        <!-- 最小化窗口按钮 -->
        <button class="control-btn" @click="minimize">—</button>
        <!-- 全屏切换按钮 -->
        <button class="control-btn" @click="toggleFullscreen">[]</button>
        <!-- 关闭窗口按钮 -->
        <button class="control-btn" @click="closeWindow">×</button>
      </div>
    </header>

    <!-- 中部区域：左侧显示音乐封面，右侧显示歌词 -->
    <main class="player-main">
      <!-- 音乐封面容器 -->
      <div class="cover-container">
        <!-- 音乐封面图片，从 Pinia store 获取当前歌曲的封面 URL -->
        <img :src="coverUrl" alt="Music Cover" class="music-cover" />
      </div>
      <!-- 歌词容器 -->
      <div class="lyrics-container" ref="lyricsContainerRef">
        <!-- 歌词内容 -->
        <p
          v-for="(lyric, index) in lyrics"
          :key="index"
          :class="{ 'active-lyric': index === currentLyricIndex }"
        >
          {{ lyric.text }}
        </p>
      </div>
    </main>

    <!-- 底部区域：完整的播放器控制组件 -->
    <footer class="player-footer">
      <!-- 歌曲信息 -->
      <div class="song-details">
        <div class="song-name">{{ playStore.currentSongInfo.name }}</div>
        <div class="artist-name">{{ playStore.currentSongInfo.artist }}</div>
      </div>

      <!-- 播放进度条 -->
      <div class="progress-container">
        <span class="time-display">{{ formatTime(playStore.currentTime) }}</span>
        <input
          type="range"
          min="0"
          :max="playStore.duration"
          step="0.1"
          v-model="playStore.currentTime"
          @input="playStore.setCurrentTime(playStore.currentTime)"
          class="progress-bar"
        />
        <span class="time-display">{{ formatTime(playStore.duration) }}</span>
      </div>

      <!-- 播放控制按钮 -->
      <div class="controls">
        <button @click="playStore.playPrev" class="control-btn">⏮</button>
        <button @click="playStore.togglePlay" class="control-btn">
          {{ playStore.isPlaying ? '⏸' : '⏵' }}
        </button>
        <button @click="playStore.playNext" class="control-btn">⏭</button>
        <button @click="playStore.togglePlayMode" class="control-btn">
          {{ getPlayModeIcon() }}
        </button>
        <!-- 音量控制 -->
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
      </div>
    </footer>
  </div>
</template>

<script setup>
import router from '@/router' // 引入 Vue Router 实例
import { ref, computed, onMounted, onUnmounted, watch } from 'vue' // 引入 Vue 的 ref, computed, onMounted, onUnmounted, watch 函数
// 移除 MiniPlayer 组件的直接引入，其功能将集成到 PlayIndex 自身
import { usePlayStore } from '@/stores/PlaybackHistory' // 引入 Pinia 的 PlayStore

// 使用 Pinia 的 PlayStore 来获取和管理播放状态
const playStore = usePlayStore()

// 音乐封面 URL，初始化时从 PlayStore 获取当前歌曲的封面，如果为空则使用默认封面
const coverUrl = ref(playStore.currentSongInfo.cover || 'path/to/default-cover.jpg')

/**
 * @function playStore.$subscribe
 * @description 订阅 PlayStore 中状态的变化。
 * 当 currentSongInfo 发生变化时，更新本地的 coverUrl ref，确保封面同步显示。
 */
playStore.$subscribe((mutation, state) => {
  coverUrl.value = state.currentSongInfo.cover || 'path/to/default-cover.jpg'
})

/**
 * @function goBack
 * @description 返回上一页。
 */
function goBack() {
  router.go(-1)
}

/**
 * @function minimize
 * @description 模拟窗口最小化操作（当前仅打印日志）。
 */
function minimize() {
  console.log('最小化')
  // 实际的最小化逻辑可能需要与 Electron 或其他桌面应用框架集成
}

/**
 * @function toggleFullscreen
 * @description 模拟窗口全屏切换操作（当前仅打印日志）。
 */
function toggleFullscreen() {
  console.log('全屏切换')
  // 实际的全屏切换逻辑可能需要与 Electron 或其他桌面应用框架集成
}

/**
 * @function closeWindow
 * @description 模拟关闭窗口操作（当前仅打印日志）。
 */
// 音量控制，初始值为 0.7
const volume = ref(0.7)

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
  { immediate: true }, // 立即执行一次，确保初始同步
)

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

// 歌词处理
const lyrics = computed(() => {
  const lrcContent = playStore.currentSongInfo.lrc
  if (!lrcContent) return []

  // 简单的歌词解析，将歌词按行分割
  return lrcContent
    .split('\n')
    .map((line) => {
      // 匹配时间标签，例如 [00:10.123]
      const match = line.match(/\[(\d{2}):(\d{2})\.(\d{2,3})\](.*)/)
      if (match) {
        const minutes = parseInt(match[1])
        const seconds = parseInt(match[2])
        const milliseconds = parseInt(match[3])
        const time = minutes * 60 + seconds + milliseconds / (match[3].length === 2 ? 100 : 1000)
        return { time, text: match[4].trim() }
      }
      return { time: 0, text: line.trim() } // 没有时间标签的行
    })
    .filter((item) => item.text) // 过滤掉空行
})

// 当前高亮歌词的索引
const currentLyricIndex = ref(0)
// 歌词滚动容器的引用
const lyricsContainerRef = ref(null)

/**
 * @function watchCurrentTimeForLyrics
 * @description 监听 currentTime 的变化，更新当前高亮歌词的索引，并滚动歌词。
 */
watch(
  () => playStore.currentTime,
  (newTime) => {
    // 找到当前时间对应的歌词索引
    const index = lyrics.value.findIndex((lyric, i) => {
      const nextLyric = lyrics.value[i + 1]
      return newTime >= lyric.time && (!nextLyric || newTime < nextLyric.time)
    })
    if (index !== -1 && index !== currentLyricIndex.value) {
      currentLyricIndex.value = index
      // 滚动歌词到视图中央
      if (lyricsContainerRef.value) {
        const activeLyricElement = lyricsContainerRef.value.querySelector('.active-lyric')
        if (activeLyricElement) {
          const containerHeight = lyricsContainerRef.value.clientHeight
          const elementOffsetTop = activeLyricElement.offsetTop
          const elementHeight = activeLyricElement.clientHeight
          // 滚动到元素在容器中间的位置
          lyricsContainerRef.value.scrollTop =
            elementOffsetTop - containerHeight / 2 + elementHeight / 2
        }
      }
    }
  },
)

/**
 * @function closeWindow
 * @description 模拟关闭窗口操作（当前仅打印日志）。
 */
function closeWindow() {
  console.log('关闭窗口')
  // 实际的关闭窗口逻辑可能需要与 Electron 或其他桌面应用框架集成
}

// 在组件挂载时，如果当前有歌曲，确保歌词滚动到正确位置
onMounted(() => {
  if (playStore.currentHash && lyrics.value.length > 0) {
    // 延迟执行以确保 DOM 渲染完成
    setTimeout(() => {
      const activeLyricElement = lyricsContainerRef.value?.querySelector('.active-lyric')
      if (activeLyricElement) {
        const containerHeight = lyricsContainerRef.value.clientHeight
        const elementOffsetTop = activeLyricElement.offsetTop
        const elementHeight = activeLyricElement.clientHeight
        lyricsContainerRef.value.scrollTop =
          elementOffsetTop - containerHeight / 2 + elementHeight / 2
      }
    }, 100) // 短暂延迟
  }
})

// 在组件卸载时，可以执行一些清理工作，例如停止歌词滚动监听（虽然 watch 会自动清理）
onUnmounted(() => {
  // 目前没有需要显式清理的事件监听器，因为 watch 会自动管理
  console.log('PlayIndex 组件卸载')
})
</script>

<style scoped>
/* 音乐播放器容器的整体布局 */
.music-player-container {
  display: flex;
  flex-direction: column; /* 垂直布局 */
  width: 100vw; /* 宽度占满视口 */
  height: 100vh; /* 高度占满视口 */
  background-color: #f5f5f5; /* 背景色 */
  color: #333; /* 字体颜色 */
  font-family: sans-serif; /* 字体 */
}

/* 头部样式 */
.player-header {
  display: flex;
  justify-content: space-between; /* 元素两端对齐 */
  align-items: center; /* 垂直居中 */
  padding: 12px; /* 内边距 */
  background-color: #eaeaea; /* 背景色 */
}

/* 窗口控制按钮的间距 */
.window-controls .control-btn {
  margin-left: 10px;
}

/* 中部样式 */
.player-main {
  flex: 1; /* 占据剩余空间 */
  display: flex; /* 水平布局 */
  padding: 20px; /* 内边距 */
}

/* 封面容器样式 */
.cover-container {
  flex: 1; /* 占据一部分空间 */
  display: flex;
  justify-content: center; /* 水平居中 */
  align-items: center; /* 垂直居中 */
}

/* 音乐封面图片样式 */
.music-cover {
  max-width: 100%; /* 最大宽度 */
  max-height: 100%; /* 最大高度 */
  border: 2px solid #ccc; /* 边框 */
}

/* 歌词容器样式 */
.lyrics-container {
  flex: 2; /* 占据更多空间 */
  overflow-y: auto; /* 垂直滚动 */
  padding-left: 20px; /* 左侧内边距 */
  line-height: 1.8; /* 调整行高，使歌词更易读 */
  font-size: 18px; /* 歌词字体大小 */
  color: #555; /* 歌词颜色 */
  text-align: center; /* 歌词居中显示 */
  scroll-behavior: smooth; /* 平滑滚动 */
}

.lyrics-container p {
  margin: 10px 0; /* 歌词行间距 */
  transition:
    color 0.3s,
    font-size 0.3s; /* 颜色和字体大小过渡效果 */
}

.lyrics-container .active-lyric {
  color: #333; /* 高亮歌词颜色 */
  font-size: 22px; /* 高亮歌词字体大小 */
  font-weight: bold; /* 高亮歌词加粗 */
}

/* 底部播放器控制区域样式 */
.player-footer {
  padding: 15px 20px; /* 内边距 */
  background-color: #eaeaea; /* 背景色 */
  display: flex;
  flex-direction: column; /* 垂直布局 */
  align-items: center; /* 水平居中 */
  gap: 10px; /* 元素间距 */
}

/* 歌曲信息样式 */
.song-details {
  text-align: center;
  margin-bottom: 10px;
}

.song-name {
  font-size: 24px;
  font-weight: bold;
  color: #333;
}

.artist-name {
  font-size: 16px;
  color: #666;
}

/* 进度条容器样式 */
.progress-container {
  display: flex;
  align-items: center;
  width: 80%; /* 进度条宽度 */
  max-width: 600px;
  gap: 10px;
  margin-bottom: 15px;
}

/* 进度条滑块样式 */
.progress-bar {
  flex-grow: 1;
  height: 6px;
  background: #ddd;
  appearance: none;
  -webkit-appearance: none; /* 移除默认样式 */
  border-radius: 3px;
  cursor: pointer;
}

.progress-bar::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #409eff; /* 蓝色滑块 */
  cursor: pointer;
  margin-top: -5px; /* 调整滑块位置 */
  box-shadow: 0 0 2px rgba(0, 0, 0, 0.3);
}

.progress-bar::-moz-range-thumb {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #409eff;
  cursor: pointer;
}

/* 时间显示样式 */
.time-display {
  font-size: 14px;
  color: #666;
  width: 40px; /* 固定宽度，防止跳动 */
  text-align: center;
}

/* 播放控制按钮组样式 */
.controls {
  display: flex;
  align-items: center;
  gap: 20px; /* 按钮间距 */
}

/* 控制按钮通用样式 */
.control-btn {
  background: none;
  border: none;
  color: #333;
  font-size: 28px; /* 增大按钮图标 */
  cursor: pointer;
  padding: 5px;
  transition: transform 0.2s ease-in-out;
}

.control-btn:hover {
  transform: scale(1.1); /* 悬停放大效果 */
}

.control-btn:focus {
  outline: none;
}

/* 音量控制样式 */
.volume-control {
  display: flex;
  align-items: center;
  width: 120px; /* 音量条宽度 */
  margin-left: 30px; /* 与播放控制按钮的间距 */
}

.volume-bar {
  flex-grow: 1;
  height: 4px;
  background: #ddd;
  appearance: none;
  -webkit-appearance: none;
  border-radius: 2px;
  cursor: pointer;
}

.volume-bar::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #409eff;
  cursor: pointer;
  margin-top: -4px;
  box-shadow: 0 0 2px rgba(0, 0, 0, 0.3);
}

.volume-bar::-moz-range-thumb {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #409eff;
  cursor: pointer;
}
</style>
