<template>
  <div class="music-player-container">
    <!-- 头部: 返回，最小化，全屏，关闭 -->
    <header class="player-header">
      <button class="control-btn" @click="goBack">←</button>
      <div class="window-controls">
        <button class="control-btn" @click="minimize">—</button>
        <button class="control-btn" @click="toggleFullscreen">[]</button>
        <button class="control-btn" @click="closeWindow">×</button>
      </div>
    </header>

    <!-- 中部: 左边封面，右边歌词 -->
    <main class="player-main">
      <div class="cover-container">
        <!-- 音乐封面 -->
        <img :src="coverUrl" alt="Music Cover" class="music-cover" />
      </div>
      <div class="lyrics-container">
        <!-- 在此处嵌入歌词组件或直接插入歌词文本 -->
        <slot name="lyrics"></slot>
      </div>
    </main>

    <!-- 底部: 播放器控制组件 -->
    <footer class="player-footer">
      <MiniPlayer />
    </footer>
  </div>
</template>

<script setup>
import router from '@/router'
import { ref } from 'vue'
import MiniPlayer from '@/components/player/MiniPlayer.vue' // 引入 MiniPlayer 组件
import { usePlayStore } from '@/stores/PlaybackHistory' // 引入 PlayStore

const playStore = usePlayStore() // 使用 PlayStore

// 音乐封面 URL，从 PlayStore 获取
const coverUrl = ref(playStore.currentSongInfo.cover || 'path/to/default-cover.jpg')

// 监听 currentSongInfo 的变化来更新封面
playStore.$subscribe((mutation, state) => {
  coverUrl.value = state.currentSongInfo.cover || 'path/to/default-cover.jpg'
})

function goBack() {
  router.go(-1)
}
function minimize() {
  console.log('最小化')
}
function toggleFullscreen() {
  console.log('全屏切换')
}
function closeWindow() {
  console.log('关闭窗口')
}
</script>

<style scoped>
.music-player-container {
  display: flex;
  flex-direction: column;
  width: 100vw;
  height: 100vh;
  background-color: #f5f5f5;
  color: #333;
  font-family: sans-serif;
}

/* 头部样式 */
.player-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background-color: #eaeaea;
}

.window-controls .control-btn {
  margin-left: 10px;
}

/* 中部样式 */
.player-main {
  flex: 1;
  display: flex;
  padding: 20px;
}

.cover-container {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}

.music-cover {
  max-width: 100%;
  max-height: 100%;
  border: 2px solid #ccc;
}

.lyrics-container {
  flex: 2;
  overflow-y: auto;
  padding-left: 20px;
  line-height: 1.6;
}

/* 底部样式 */
.player-footer {
  padding: 12px;
  background-color: #eaeaea;
  display: flex;
  flex-direction: column;
}

.progress-bar {
  width: 100%;
  height: 6px;
  background: #ddd;
  appearance: none;
  margin-bottom: 10px;
}

.controls {
  display: flex;
  justify-content: center;
}

.control-btn {
  background: none;
  border: none;
  color: #333;
  font-size: 22px;
  margin: 0 14px;
  cursor: pointer;
}

.control-btn:focus {
  outline: none;
}
</style>
