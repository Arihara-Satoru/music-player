<template>
  <div class="music-player-container">
    <!-- 头部: 返回，最小化，全屏，关闭 -->
    <header class="player-header">
      <button class="control-btn"
        @click="goBack">←</button>
      <div class="window-controls">
        <button class="control-btn"
          @click="minimize">—</button>
        <button class="control-btn"
          @click="toggleFullscreen">[]</button>
        <button class="control-btn"
          @click="closeWindow">×</button>
      </div>
    </header>

    <!-- 中部: 左边封面，右边歌词 -->
    <main class="player-main">
      <div class="cover-container">
        <!-- 音乐封面 -->
        <img :src="coverUrl"
          alt="Music Cover"
          class="music-cover" />
      </div>
      <div class="lyrics-container">
        <!-- 在此处嵌入歌词组件或直接插入歌词文本 -->
        <slot name="lyrics"></slot>
      </div>
    </main>

    <!-- 底部: 进度条与控制按钮 -->
    <footer class="player-footer">
      <input type="range"
        class="progress-bar"
        :min="0"
        :max="duration"
        v-model="currentTime"
        @input="onSeek" />
      <div class="controls">
        <button class="control-btn"
          @click="prevTrack">⏮</button>
        <button class="control-btn"
          @click="togglePlay">
          {{ isPlaying ? '⏸' : '▶️' }}
        </button>
        <button class="control-btn"
          @click="nextTrack">⏭</button>
      </div>
    </footer>
  </div>
</template>

<script setup>
import router from '@/router';
import { ref, onMounted } from 'vue';

// 音乐封面 URL
const coverUrl = ref('path/to/cover.jpg');
const audio = ref(null);
const isPlaying = ref(false);
const currentTime = ref(0);
const duration = ref(0);

onMounted(() => {
  audio.value = new Audio('path/to/music.mp3');
  audio.value.addEventListener('loadedmetadata', () => {
    duration.value = Math.floor(audio.value.duration);
  });
  audio.value.addEventListener('timeupdate', () => {
    currentTime.value = Math.floor(audio.value.currentTime);
  });
});

// 播放/暂停切换
function togglePlay() {
  if (!audio.value) return;
  isPlaying.value ? audio.value.pause() : audio.value.play();
  isPlaying.value = !isPlaying.value;
}

// 拖动进度条
function onSeek() {
  if (audio.value) audio.value.currentTime = currentTime.value;
}

function prevTrack() { console.log('上一首'); }
function nextTrack() { console.log('下一首'); }
function goBack() { router.go(-1); }
function minimize() { console.log('最小化'); }
function toggleFullscreen() { console.log('全屏切换'); }
function closeWindow() { console.log('关闭窗口'); }
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
