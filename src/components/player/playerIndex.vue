<script setup>
import { ref, onMounted, watch } from 'vue'
import { usePlayStore } from '@/stores/PlaybackHistory'
import { getPlayListSong } from '@/api/user'
import { getMusic } from '@/utils/GetMusicList'
import { ElMessage } from 'element-plus';

const playStore = usePlayStore()
const audioPlayer = ref(null)
const isPlaying = ref(false)
const currentTime = ref(0)
const duration = ref(0)
const volume = ref(0.7)
const showPlaylist = ref(false)
const isSeeking = ref(false)
let seekTimer = null
const isShow = ref(true)
const playMode = ref('sequence') // sequence, random, single, loop
const currentSongInfo = ref({ name: '', artist: '' })

const startSeek = () => {
  seekTimer = setTimeout(() => {
    isSeeking.value = true
    isShow.value = false
  }, 700)
}

const endSeek = () => {
  // 无论是否超时，都清除定时器，终止拖动
  clearTimeout(seekTimer)
  seekTimer = null
  isSeeking.value = false
  isShow.value = true
}

const handleDrag = (e) => {
  if (isSeeking.value) {
    const rect = e.currentTarget.getBoundingClientRect()
    const percent = (e.clientX - rect.left) / rect.width
    const newTime = percent * duration.value
    currentTime.value = Math.max(0, Math.min(newTime, duration.value))
    seek(currentTime.value)
  }
}

// 初始化音频元素
onMounted(() => {
  audioPlayer.value = new Audio()
  audioPlayer.value.volume = volume.value

  audioPlayer.value.addEventListener('timeupdate', () => {
    currentTime.value = audioPlayer.value.currentTime
    duration.value = audioPlayer.value.duration || 0
    if (isPlaying.value) {
      playStore.setCurrentTime(currentTime.value)
    }
  })

  audioPlayer.value.addEventListener('ended', () => {
    playNext()
  })
})

// 播放控制方法
const togglePlay = () => {
  if (isPlaying.value) {
    audioPlayer.value.pause()
  } else {
    audioPlayer.value.play()
  }
  isPlaying.value = !isPlaying.value
}

const setVolume = (val) => {
  volume.value = val
  audioPlayer.value.volume = val
}

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`
}

const seek = (time) => {
  audioPlayer.value.currentTime = time
}

const playSong = (index) => {
  const song = playStore.MusicList[index]
  if (song) {
    audioPlayer.value.src = song.url
    audioPlayer.value.play()
    isPlaying.value = true
    playStore.updateCurrentHash(song.hash)
    currentSongInfo.value = {
      name: song.name,
      artist: song.artist,
      cover: song.cover,
    }
  }
}

const playNext = () => {
  const currentIndex = playStore.MusicList.findIndex(
    song => song.hash === playStore.currentHash
  )
  if (currentIndex === -1) return

  let nextIndex
  switch (playMode.value) {
    case 'random':
      nextIndex = Math.floor(Math.random() * playStore.MusicList.length)
      break
    case 'single':
      nextIndex = currentIndex
      break
    case 'loop':
      nextIndex = (currentIndex + 1) % playStore.MusicList.length
      break
    default: // sequence
      nextIndex = currentIndex + 1
      if (nextIndex >= playStore.MusicList.length) {
        isPlaying.value = false
        return
      }
  }
  playSong(nextIndex)
}

const togglePlayMode = () => {
  const modes = ['sequence', 'random', 'single', 'loop']
  const currentIndex = modes.indexOf(playMode.value)
  playMode.value = modes[(currentIndex + 1) % modes.length]
}

const getPlayModeIcon = () => {
  switch (playMode.value) {
    case 'random': return '🔀'
    case 'single': return '🔂'
    case 'loop': return '🔁'
    default: return '→'
  }
}

const playPrev = () => {
  const currentIndex = playStore.MusicList.findIndex(
    song => song.hash === playStore.currentHash
  )
  if (currentIndex !== -1) {
    const prevIndex = (currentIndex - 1 + playStore.MusicList.length) % playStore.MusicList.length
    playSong(prevIndex)
  }
}

const isCurrentSong = (song) => {
  return song.hash === playStore.currentHash;
}

const getMoreList = async () => {
  // 获取更多列表逻辑
  const res = await getPlayListSong(playStore.musicIds, Number(playStore.page) + 1, 20)
  if (res.data.songs.length < 20) {
    ElMessage('已无更多歌曲')
    return
  }
  playStore.setPage(Number(playStore.page) + 1)
  await getMusic('', playStore.musicIds, res.data.songs, '', Number(playStore.page) + 1);

}

// 监听播放列表变化
watch(() => playStore.currentHash, (newHash) => {
  if (newHash) {
    const currentSong = playStore.MusicList.find(song => song.hash === newHash)
    if (currentSong) {
      audioPlayer.value.src = currentSong.url
      audioPlayer.value.play()
      isPlaying.value = true
      currentSongInfo.value = {
        name: currentSong.name,
        artist: currentSong.artist,
        cover: currentSong.cover
      }
    }
  }
})
</script>

<template>
  <div class="player-container"
    @mousedown="startSeek"
    @mouseup="endSeek"
    @mouseleave="endSeek"
    @mousemove="handleDrag"
    @touchstart="startSeek"
    @touchend="endSeek"
    @touchmove="handleDrag">
    <!-- 长按后出现的进度条 -->
    <div v-if="isSeeking"
      class="seek-progress"
      :style="{ width: (currentTime / duration * 100) + '%' }">
      {{ formatTime(currentTime) }}
    </div>
    <div class="player-controls"
      title="长按可调整进度条"
      :style="{ visibility: isSeeking ? 'hidden' : 'visible' }">
      <button @click="playPrev"
        class="control-btn">⏮</button>
      <button @click="togglePlay"
        class="control-btn">
        {{ isPlaying ? '⏸' : '⏵' }}
      </button>
      <button @click="playNext"
        class="control-btn">⏭</button>

      <div class="song-info">
        <img :src=currentSongInfo.cover
          alt="">
        <div class="scroll-text">
          {{ currentSongInfo.name }}
        </div>
      </div>
      <div class="time-display"
        :class="{ 'seeking': isSeeking }">
        {{ formatTime(currentTime) }} / {{ formatTime(duration) }}
      </div>
      <button @click="togglePlayMode"
        class="mode-btn">
        {{ getPlayModeIcon() }}
      </button>
      <div class="volume-control">
        <input type="range"
          min="0"
          max="1"
          step="0.1"
          v-model="volume"
          @input="setVolume(volume)"
          class="volume-bar">
      </div>
      <div class="bottom-controls">
        <button @click="showPlaylist = !showPlaylist"
          class="toggle-playlist">
          {{ showPlaylist ? '▼' : '▲' }}
        </button>
      </div>
    </div>

    <transition name="playlist">
      <div class="playlist-container"
        v-show="showPlaylist">
        <div v-for="(song, index) in playStore.MusicList"
          :key="index"
          :class="['playlist-item', { 'active-song': isCurrentSong(song) }]"
          @click="playSong(index)">
          {{ song.name }} - {{ song.artist }}
        </div>
        <p class="get-more"
          @click="getMoreList()">加载更多。。。</p>
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
  background: #f5f5f5;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  cursor: pointer;

  .seek-progress {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: #409EFF;
  }
}

.player-controls {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 15px;
  user-select: none;
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
