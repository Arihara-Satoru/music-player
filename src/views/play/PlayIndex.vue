<template>
  <div class="music-player-container">
    <!-- 头部区域：包含返回按钮和窗口控制按钮 -->
    <header class="player-header">
      <!-- 返回按钮，点击后返回上一页 -->
      <button class="control-btn back-btn" @click="goBack">
        <i class="ri-arrow-left-line"></i>
      </button>
      <!-- 窗口控制按钮组 -->
      <div class="window-controls">
        <!-- 最小化窗口按钮 -->
        <button class="control-btn" @click="minimize">
          <i class="ri-subtract-line"></i>
        </button>
        <!-- 全屏切换按钮 -->
        <button class="control-btn" @click="toggleFullscreen">
          <i class="ri-fullscreen-line"></i>
        </button>
        <!-- 关闭窗口按钮 -->
        <button class="control-btn close-btn" @click="closeWindow">
          <i class="ri-close-line"></i>
        </button>
      </div>
      <!-- 歌词对齐控制 -->
      <div class="lyric-align-controls">
        <button
          class="control-btn"
          :class="{ active: lyricAlign === 'left' }"
          @click="setLyricAlign('left')"
        >
          <i class="ri-align-left"></i>
        </button>
        <button
          class="control-btn"
          :class="{ active: lyricAlign === 'center' }"
          @click="setLyricAlign('center')"
        >
          <i class="ri-align-center"></i>
        </button>
        <button
          class="control-btn"
          :class="{ active: lyricAlign === 'right' }"
          @click="setLyricAlign('right')"
        >
          <i class="ri-align-right"></i>
        </button>
      </div>
    </header>

    <!-- 中部区域：左侧显示音乐封面，右侧显示歌词 -->
    <main class="player-main" @click="toggleView">
      <!-- 音乐封面容器 -->
      <div class="cover-container" v-if="!isMobile || (isMobile && showCover)">
        <!-- 音乐封面图片，从 Pinia store 获取当前歌曲的封面 URL -->
        <img :src="coverUrl" alt="Music Cover" class="music-cover" />
        <!-- 歌曲信息，在封面下方显示 -->
        <div class="song-details-overlay">
          <div class="song-name">{{ playStore.currentSongInfo.name }}</div>
          <div class="artist-name">{{ playStore.currentSongInfo.artist }}</div>
        </div>
      </div>
      <!-- 歌词容器 -->
      <div
        class="lyrics-container"
        ref="lyricsContainerRef"
        :style="{ textAlign: lyricAlign }"
        :class="{ 'single-lyric-center': lyrics.length === 1 }"
        v-if="!isMobile || (isMobile && !showCover)"
      >
        <!-- 歌词内容 -->
        <p
          v-for="(lyric, index) in lyrics"
          :key="index"
          :class="{ 'active-lyric': index === currentLyricIndex }"
          @click="jumpToLyricTime(lyric.time)"
        >
          {{ lyric.text }}
        </p>
      </div>
    </main>

    <!-- 底部区域：完整的播放器控制组件 -->
    <footer class="player-footer">
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
        <button @click="playStore.playPrev" class="control-btn player-control-btn">
          <i class="ri-skip-back-fill"></i>
        </button>
        <button @click="playStore.togglePlay" class="control-btn play-pause-btn">
          <i :class="playStore.isPlaying ? 'ri-pause-fill' : 'ri-play-fill'"></i>
        </button>
        <button @click="playStore.playNext" class="control-btn player-control-btn">
          <i class="ri-skip-forward-fill"></i>
        </button>
        <button @click="playStore.togglePlayMode" class="control-btn player-control-btn">
          <i :class="getPlayModeIcon()"></i>
        </button>
        <!-- 音量控制 -->
        <div class="volume-control">
          <i class="ri-volume-up-fill volume-icon"></i>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
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
import { usePlayStore } from '@/stores/PlaybackHistory' // 引入 Pinia 的 PlayStore
import { useThemeStore } from '@/stores/ThemeStore' // 引入 Pinia 的 ThemeStore

// 使用 Pinia 的 PlayStore 来获取和管理播放状态
const playStore = usePlayStore()
// 使用 Pinia 的 ThemeStore 来管理主题
const themeStore = useThemeStore()

// 响应式变量，判断是否为手机端（屏幕宽度小于等于 768px）
const isMobile = ref(window.innerWidth <= 768)
// 响应式变量，控制在手机端显示封面还是歌词，默认为显示封面
const showCover = ref(true)

/**
 * @function handleResize
 * @description 窗口大小改变时更新 isMobile 变量。
 */
const handleResize = () => {
  isMobile.value = window.innerWidth <= 768
}

/**
 * @function toggleView
 * @description 在手机端切换显示封面或歌词。
 */
const toggleView = () => {
  if (isMobile.value) {
    showCover.value = !showCover.value
  }
}

// 音乐封面 URL，初始化时从 PlayStore 获取当前歌曲的封面，如果为空则使用默认封面
const coverUrl = ref(playStore.currentSongInfo.cover || '/default-cover.jpg') // 使用绝对路径

// 歌词对齐方式，默认为居中
const lyricAlign = ref('center')

/**
 * @function setLyricAlign
 * @param {string} align - 歌词对齐方式 ('left', 'center', 'right')。
 * @description 设置歌词的对齐方式。
 */
const setLyricAlign = (align) => {
  lyricAlign.value = align
}

/**
 * @function watch currentSongInfo
 * @description 监听 PlayStore 中 currentSongInfo 的变化。
 * 当歌曲信息变化时，更新本地的 coverUrl ref，并触发从封面提取颜色。
 */
watch(
  () => playStore.currentSongInfo,
  (newSongInfo) => {
    const newCoverUrl = newSongInfo.cover || '/default-cover.jpg'
    coverUrl.value = newCoverUrl
    // 如果当前主题模式是专辑封面取色，则提取颜色
    if (themeStore.themeMode === 'album_cover') {
      themeStore.extractColorFromImage(newCoverUrl)
    }
  },
  { immediate: true, deep: true }, // 立即执行一次，并深度监听对象变化
)

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
      return 'ri-repeat-line' // 顺序播放图标
    case '单曲循环':
      return 'ri-repeat-one-line' // 单曲循环图标
    case '随机播放':
      return 'ri-shuffle-line' // 随机播放图标
    default:
      return 'ri-arrow-right-line' // 默认图标
  }
}

// 歌词处理
const lyrics = computed(() => {
  const lrcContent = playStore.currentSongInfo.lrc
  console.log('原始歌词内容 (lrcContent):', lrcContent) // 添加调试日志
  if (!lrcContent) {
    console.warn('lrcContent 为空或未定义，歌词将不会显示。') // 添加警告日志
    return []
  }

  // 简单的歌词解析，将歌词按行分割
  const parsedLyrics = lrcContent
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
      return null // 不匹配时间标签的行返回 null
    })
    .filter(Boolean) // 过滤掉 null 和 undefined，只保留有效歌词对象

  // 如果解析后的歌词为空，但原始歌词内容包含“纯音乐”提示，则添加一个提示
  if (parsedLyrics.length === 0 && lrcContent && /^\s*纯音乐/.test(lrcContent.trim())) {
    parsedLyrics.push({ time: 0, text: '纯音乐，请欣赏' })
  }

  console.log('解析后的歌词 (parsedLyrics):', parsedLyrics) // 添加调试日志
  return parsedLyrics
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
        // 确保在访问 activeLyricElement 之前它已经被渲染
        const activeLyricElement = lyricsContainerRef.value.querySelector('.active-lyric')
        if (activeLyricElement) {
          const containerHeight = lyricsContainerRef.value.clientHeight
          const elementOffsetTop = activeLyricElement.offsetTop
          const elementHeight = activeLyricElement.clientHeight
          // 计算目标滚动位置，使当前歌词居中
          lyricsContainerRef.value.scrollTop =
            elementOffsetTop - containerHeight / 2 + elementHeight / 2
        }
      }
    }
  },
  { immediate: true }, // 立即执行一次，确保初始同步
)

/**
 * @function closeWindow
 * @description 模拟关闭窗口操作（当前仅打印日志）。
 */
function closeWindow() {
  console.log('关闭窗口')
  // 实际的关闭窗口逻辑可能需要与 Electron 或其他桌面应用框架集成
}

// 在组件挂载时执行的逻辑
onMounted(() => {
  // 如果当前主题模式是专辑封面取色，且有歌曲封面，则提取颜色
  if (themeStore.themeMode === 'album_cover' && playStore.currentSongInfo.cover) {
    themeStore.extractColorFromImage(playStore.currentSongInfo.cover)
  }
  // 添加窗口大小监听器，用于响应式布局
  window.addEventListener('resize', handleResize)
  // 初始判断一次，设置 isMobile 状态
  handleResize()

  // 确保歌词在组件挂载时滚动到正确位置
  if (playStore.currentHash && lyrics.value.length > 0) {
    // 延迟执行以确保 DOM 渲染完成，避免获取不到元素
    setTimeout(() => {
      const activeLyricElement = lyricsContainerRef.value?.querySelector('.active-lyric')
      if (activeLyricElement) {
        // 使用 scrollIntoView 确保歌词垂直居中显示
        activeLyricElement.scrollIntoView({
          behavior: 'smooth', // 平滑滚动
          block: 'center', // 确保元素在滚动容器中垂直居中
        })
      }
    }, 100) // 短暂延迟
  }

  // 监听 audioPlayer 实例，当其存在时添加播放/暂停事件监听器
  watch(
    () => playStore.audioPlayer,
    (newPlayer) => {
      if (newPlayer) {
        // 移除旧的监听器，防止重复添加
        if (playStore.audioPlayer) {
          playStore.audioPlayer.removeEventListener('play', handleAudioPlay)
          playStore.audioPlayer.removeEventListener('pause', handleAudioPause)
        }
        // 添加新的监听器
        newPlayer.addEventListener('play', handleAudioPlay)
        newPlayer.addEventListener('pause', handleAudioPause)
        // 初始同步播放状态
        playStore.isPlaying = !newPlayer.paused
      }
    },
    { immediate: true }, // 立即执行一次，确保初始同步
  )
})

// 处理音频播放事件
const handleAudioPlay = () => {
  console.log('Audio is playing (system event)')
  playStore.isPlaying = true
}

// 处理音频暂停事件
const handleAudioPause = () => {
  console.log('Audio is paused (system event)')
  playStore.isPlaying = false
}

// 在组件卸载时执行的清理工作
onUnmounted(() => {
  // 移除窗口大小监听器
  window.removeEventListener('resize', handleResize)
  console.log('PlayIndex 组件卸载')

  // 移除 audioPlayer 的事件监听器，防止内存泄漏
  if (playStore.audioPlayer) {
    playStore.audioPlayer.removeEventListener('play', handleAudioPlay)
    playStore.audioPlayer.removeEventListener('pause', handleAudioPause)
  }
})

/**
 * @function jumpToLyricTime
 * @param {number} time - 歌词对应的时间（秒）。
 * @description 跳转播放器到歌词对应的时间点。
 */
const jumpToLyricTime = (time) => {
  playStore.setCurrentTime(time)
  // 播放器跳转后，确保歌词也滚动到中心
  if (lyricsContainerRef.value) {
    // 延迟执行以确保 DOM 渲染完成
    setTimeout(() => {
      const activeLyricElement = lyricsContainerRef.value.querySelector('.active-lyric')
      if (activeLyricElement) {
        activeLyricElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        })
      }
    }, 50) // 短暂延迟
  }
}
</script>

<style scoped>
/* 引入 RemixIcon 样式 */
@import 'https://cdn.jsdelivr.net/npm/remixicon@4.2.0/fonts/remixicon.css';

/* 音乐播放器容器的整体布局 */
.music-player-container {
  display: flex;
  flex-direction: column; /* 垂直布局 */
  width: 100vw; /* 宽度占满视口 */
  height: 100vh; /* 高度占满视口 */
  background: linear-gradient(
    135deg,
    var(--md-sys-color-primary-container) 0%,
    var(--md-sys-color-tertiary-container) 100%
  );
  color: var(--md-sys-color-on-background); /* 使用 Material You 字体颜色 */
  font-family: 'Roboto', sans-serif; /* 字体 */
  overflow: hidden; /* 防止滚动条 */
}

/* 头部样式 */
.player-header {
  display: flex;
  justify-content: space-between; /* 元素两端对齐 */
  align-items: center; /* 垂直居中 */
  padding: 12px 20px; /* 内边距 */
  background-color: rgba(var(--md-sys-color-surface-variant-rgb), 0.7); /* 半透明背景 */
  border-bottom-left-radius: 20px; /* 底部左圆角 */
  border-bottom-right-radius: 20px; /* 底部右圆角 */
  margin: 0 20px; /* 左右外边距，使其与容器边缘有间距 */
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1); /* 轻微阴影 */
  color: var(--md-sys-color-on-surface-variant);
  -webkit-app-region: drag; /* 允许拖动窗口 */
}

/* 窗口控制按钮的间距 */
.window-controls {
  display: flex;
  gap: 8px;
}

/* 控制按钮通用样式 */
.control-btn {
  background: none;
  border: none;
  color: var(--md-sys-color-on-surface-variant); /* 使用 Material You 字体颜色 */
  font-size: 20px; /* 增大按钮图标 */
  cursor: pointer;
  padding: 6px;
  border-radius: 50%; /* 圆形按钮 */
  transition:
    background-color 0.2s ease-in-out,
    transform 0.2s ease-in-out;
  -webkit-app-region: no-drag; /* 禁止拖动 */
}

.control-btn:hover {
  background-color: rgba(var(--color-primary-rgb), 0.1); /* 悬停背景色 */
  transform: scale(1.1); /* 悬停放大效果 */
}

.control-btn:active {
  background-color: rgba(var(--color-primary-rgb), 0.2); /* 点击背景色 */
}

.control-btn:focus {
  outline: none;
}

.back-btn {
  font-size: 24px; /* 返回按钮更大 */
}

.close-btn {
  color: var(--md-sys-color-error); /* 关闭按钮使用错误色 */
}

.close-btn:hover {
  background-color: rgba(var(--md-sys-color-error-rgb), 0.1);
}

/* 歌词对齐控制按钮组样式 */
.lyric-align-controls {
  display: flex;
  gap: 8px;
  margin-left: auto; /* 将对齐按钮推到右侧 */
}

.lyric-align-controls .control-btn {
  font-size: 20px;
}

.lyric-align-controls .control-btn.active {
  background-color: rgba(var(--md-sys-color-primary-rgb), 0.2);
  color: var(--md-sys-color-primary);
}

/* 中部样式 */
.player-main {
  flex: 1; /* 占据剩余空间 */
  display: flex; /* 水平布局 */
  padding: 20px; /* 减小内边距 */
  gap: 30px; /* 减小封面和歌词之间的间距 */
  align-items: center; /* 垂直居中对齐 */
  position: relative; /* 为背景模糊做准备 */
  overflow: hidden; /* 确保模糊效果不溢出 */
}

/* 添加一个伪元素作为背景模糊层 */
.player-main::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.3); /* 半透明黑色叠加层 */
  filter: blur(50px); /* 模糊效果 */
  z-index: -1; /* 放置在内容下方 */
  opacity: 1; /* 保持不透明度 */
  transform: scale(1.1); /* 稍微放大以避免边缘模糊 */
}

/* 封面容器样式 */
.cover-container {
  flex: 1; /* 占据一半空间 */
  display: flex;
  flex-direction: column; /* 垂直布局 */
  justify-content: center; /* 垂直居中 */
  align-items: center; /* 水平居中 */
  position: relative; /* 用于定位歌曲信息 */
  padding: 20px; /* 内边距 */
  background-color: rgba(var(--md-sys-color-surface-variant-rgb), 0.7); /* 半透明背景 */
  border-radius: 12px; /* 圆角 */
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1); /* 轻微阴影 */
}

/* 音乐封面图片样式 */
.music-cover {
  width: 80%; /* 封面宽度 */
  max-width: 450px; /* 最大宽度 */
  aspect-ratio: 1/1; /* 保持正方形 */
  border-radius: 12px; /* 圆角 */
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2); /* 阴影效果 */
  border: none; /* 移除边框 */
  object-fit: cover; /* 确保图片填充容器 */
}

/* 歌曲信息叠加层 */
.song-details-overlay {
  text-align: center;
  margin-top: 20px; /* 与封面的间距 */
  color: var(--md-sys-color-on-background);
}

.song-name {
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 5px;
  color: var(--md-sys-color-on-background);
}

.artist-name {
  font-size: 18px;
  color: var(--md-sys-color-on-background);
  opacity: 0.8;
}

/* 歌词容器样式 */
.lyrics-container {
  flex: 1; /* 占据一半空间 */
  height: 100%; /* 确保容器有高度 */
  overflow-y: auto; /* 垂直滚动 */
  padding-right: 20px; /* 右侧内边距 */
  line-height: 2; /* 调整行高，使歌词更易读 */
  font-size: 18px; /* 歌词字体大小略微调整 */
  color: var(--md-sys-color-on-surface-variant); /* 歌词颜色 */
  /* text-align 属性通过 Vue 绑定动态控制 */
  scroll-behavior: smooth; /* 平滑滚动 */
  /* 调整渐变遮罩，使其更平滑 */
  mask-image: linear-gradient(to bottom, transparent 0%, black 10%, black 90%, transparent 100%);
  -webkit-mask-image: linear-gradient(
    to bottom,
    transparent 0%,
    black 10%,
    black 90%,
    transparent 100%
  );
  /* 增加歌词容器的背景，使其与模糊背景区分 */
  background-color: rgba(
    var(--md-sys-color-surface-variant-rgb),
    0.7
  ); /* 半透明背景，与头部和底部保持一致 */
  border-radius: 12px; /* 圆角 */
  padding: 20px; /* 内部填充 */
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1); /* 轻微阴影 */
}

/* 当只有一句歌词时，使其垂直居中 */
.lyrics-container.single-lyric-center {
  display: flex;
  align-items: center; /* 垂直居中 */
  justify-content: center; /* 水平居中 */
}

.lyrics-container p {
  margin: 0; /* 移除默认段落外边距 */
  padding: 5px 0; /* 歌词行内边距 */
  transition:
    color 0.3s ease,
    font-size 0.3s ease,
    font-weight 0.3s ease; /* 颜色、字体大小和字重过渡效果 */
}

.lyrics-container .active-lyric {
  color: var(--md-sys-color-primary); /* 高亮歌词颜色使用主色调 */
  font-size: 22px; /* 高亮歌词字体大小略微调整 */
  font-weight: bold; /* 高亮歌词加粗 */
  background-color: rgba(var(--md-sys-color-primary-rgb), 0.1); /* 高亮歌词背景色 */
  border-radius: 8px; /* 圆角 */
  padding: 5px 10px; /* 增加内边距 */
  display: inline-block; /* 确保背景和内边距生效 */
  transform: scale(1.05); /* 稍微放大 */
}

/* 底部播放器控制区域样式 */
.player-footer {
  padding: 20px 30px; /* 内边距 */
  background-color: rgba(var(--md-sys-color-surface-variant-rgb), 0.7); /* 半透明背景 */
  border-top-left-radius: 20px; /* 顶部左圆角 */
  border-top-right-radius: 20px; /* 顶部右圆角 */
  margin: 0 20px 20px 20px; /* 左右和底部外边距 */
  box-shadow: 0 -4px 15px rgba(0, 0, 0, 0.1); /* 轻微阴影 */
  color: var(--md-sys-color-on-surface-variant);
  display: flex;
  flex-direction: column; /* 垂直布局 */
  align-items: center; /* 水平居中 */
  gap: 15px; /* 元素间距 */
}

/* 进度条容器样式 */
.progress-container {
  display: flex;
  align-items: center;
  width: 90%; /* 进度条宽度 */
  max-width: 700px;
  gap: 15px;
}

/* 进度条滑块样式 */
.progress-bar {
  flex-grow: 1;
  height: 8px; /* 进度条高度 */
  background: var(--md-sys-color-outline-variant); /* 进度条背景色 */
  appearance: none;
  -webkit-appearance: none; /* 移除默认样式 */
  border-radius: 4px;
  cursor: pointer;
  outline: none; /* 移除焦点轮廓 */
}

.progress-bar::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 18px; /* 滑块大小 */
  height: 18px;
  border-radius: 50%;
  background: var(--md-sys-color-primary); /* 滑块颜色使用主色调 */
  cursor: pointer;
  margin-top: -5px; /* 调整滑块位置 */
  box-shadow: 0 0 5px rgba(var(--color-primary-rgb), 0.5);
  transition: background-color 0.2s ease;
}

.progress-bar::-moz-range-thumb {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--md-sys-color-primary);
  cursor: pointer;
  box-shadow: 0 0 5px rgba(var(--color-primary-rgb), 0.5);
  transition: background-color 0.2s ease;
}

/* 时间显示样式 */
.time-display {
  font-size: 15px;
  color: var(--md-sys-color-on-surface-variant);
  width: 50px; /* 固定宽度，防止跳动 */
  text-align: center;
}

/* 播放控制按钮组样式 */
.controls {
  display: flex;
  align-items: center;
  gap: 30px; /* 按钮间距 */
}

/* 播放控制按钮通用样式 */
.player-control-btn {
  font-size: 32px; /* 增大按钮图标 */
}

.play-pause-btn {
  font-size: 48px; /* 播放/暂停按钮更大 */
  color: var(--md-sys-color-primary); /* 播放/暂停按钮使用主色调 */
}

/* 音量控制样式 */
.volume-control {
  display: flex;
  align-items: center;
  width: 150px; /* 音量条宽度 */
  margin-left: 40px; /* 与播放控制按钮的间距 */
  gap: 10px;
}

.volume-icon {
  font-size: 24px;
  color: var(--md-sys-color-on-surface-variant);
}

.volume-bar {
  flex-grow: 1;
  height: 6px; /* 音量条高度 */
  background: var(--md-sys-color-outline-variant);
  appearance: none;
  -webkit-appearance: none;
  border-radius: 3px;
  cursor: pointer;
  outline: none;
}

.volume-bar::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--md-sys-color-primary);
  cursor: pointer;
  margin-top: -5px;
  box-shadow: 0 0 4px rgba(var(--color-primary-rgb), 0.5);
  transition: background-color 0.2s ease;
}

.volume-bar::-moz-range-thumb {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--md-sys-color-primary);
  cursor: pointer;
  box-shadow: 0 0 4px rgba(var(--color-primary-rgb), 0.5);
  transition: background-color 0.2s ease;
}

/* 手机端适配 */
@media (max-width: 768px) {
  .player-header {
    padding: 10px 15px;
    margin: 0 10px;
    border-bottom-left-radius: 15px;
    border-bottom-right-radius: 15px;
  }

  .window-controls,
  .lyric-align-controls {
    display: none; /* 手机端隐藏窗口控制和歌词对齐控制 */
  }

  .player-main {
    flex-direction: column; /* 手机端垂直布局 */
    padding: 15px;
    gap: 15px;
  }

  .player-main::before {
    filter: blur(30px); /* 手机端模糊效果稍微减弱 */
  }

  .cover-container,
  .lyrics-container {
    flex: none; /* 取消 flex 伸缩 */
    width: 100%; /* 宽度占满 */
    height: 50vh; /* 各占一半高度 */
    padding: 15px;
    border-radius: 10px;
  }

  .music-cover {
    width: 90%; /* 手机端封面宽度 */
    max-width: 300px; /* 限制最大宽度 */
  }

  .song-name {
    font-size: 24px; /* 手机端字体大小 */
  }

  .artist-name {
    font-size: 16px; /* 手机端字体大小 */
  }

  .lyrics-container {
    font-size: 16px; /* 手机端歌词字体大小 */
    padding-right: 15px; /* 调整内边距 */
  }

  .lyrics-container .active-lyric {
    font-size: 18px; /* 手机端高亮歌词字体大小 */
    padding: 3px 8px;
  }

  .player-footer {
    padding: 15px 20px;
    margin: 0 10px 10px 10px;
    border-top-left-radius: 15px;
    border-top-right-radius: 15px;
  }

  .progress-container {
    width: 95%; /* 手机端进度条宽度 */
    gap: 10px;
  }

  .time-display {
    font-size: 13px; /* 手机端时间显示字体大小 */
    width: 40px;
  }

  .controls {
    gap: 20px; /* 手机端按钮间距 */
  }

  .player-control-btn {
    font-size: 28px; /* 手机端按钮图标大小 */
  }

  .play-pause-btn {
    font-size: 40px; /* 手机端播放/暂停按钮大小 */
  }

  .volume-control {
    display: none; /* 手机端隐藏音量控制 */
  }
}
</style>
