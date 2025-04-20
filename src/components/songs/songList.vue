<script setup>
import { ref, computed } from 'vue';

const songs = ref([
  { title: 'Digital Warfare', artist: 'Neural DSP', duration: '3:45', cover: '' },
  { title: 'Quantum Loop', artist: 'Waveform', duration: '4:20', cover: '' },
  { title: 'Silicon Dreams', artist: 'Circuit', duration: '5:12', cover: '' }
]);

const sortOption = ref('title');

const sortedSongs = computed(() => {
  return [...songs.value].sort((a, b) =>
    a[sortOption.value].localeCompare(b[sortOption.value])
  );
});

const playRandom = () => {
  const randomIndex = Math.floor(Math.random() * songs.value.length);
  console.log('Playing:', songs.value[randomIndex].title);
};
</script>

<template>
  <div class="song-list">
    <div class="header">
      <h1 class="title">TRACKS</h1>
      <div class="controls">
        <el-select v-model="sortOption"
          size="small"
          class="sort-select">
          <el-option label="标题排序"
            value="title" />
          <el-option label="歌手排序"
            value="artist" />
        </el-select>
        <el-button @click="playRandom"
          size="small"
          class="random-btn">
          <i class="icon-shuffle"></i> 随机播放
        </el-button>
      </div>
    </div>

    <!-- 列表头部 -->
    <el-row class="song-header"
      :gutter="20">
      <el-col :span="2"></el-col>
      <el-col :span="10"
        class="header-title">标题</el-col>
      <el-col :span="8"
        class="header-title">歌手</el-col>
      <el-col :span="4"
        class="header-title duration-header">时长</el-col>
    </el-row>

    <!-- 歌曲列表 -->
    <div class="song-container">
      <el-row v-for="(song, index) in sortedSongs"
        :key="index"
        class="song-row"
        :gutter="20"
        @click="console.log('Playing:', song.title)">
        <el-col :span="2">
          <div class="cover-container">
            <div class="cover-mask"></div>
            <img src="/default-cover.jpg"
              class="album-cover" />
          </div>
        </el-col>
        <el-col :span="10"
          class="song-title-col">
          <span class="song-title">{{ song.title }}</span>
          <span class="artist-mobile">{{ song.artist }}</span>
        </el-col>
        <el-col :span="8"
          class="artist-col">
          {{ song.artist }}
        </el-col>
        <el-col :span="4"
          class="duration-col">
          {{ song.duration }}
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<style scoped lang="scss">
.song-list {
  padding: 2rem;
  background: #f8f9fa;
  width: 100%;
  min-height: 100vh;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.title {
  font-size: 1.8rem;
  color: #2c3e50;
  letter-spacing: -0.05em;
  margin: 0;
}

.controls {
  display: flex;
  gap: 1rem;
}

/* 列表样式 */
.song-header {
  padding: 12px 0;
  border-bottom: 1px solid #e9ecef;
  margin-bottom: 8px;
  background: #f1f3f5;
  border-radius: 4px 4px 0 0;
}

.header-title {
  color: #666;
  font-weight: 500;
  font-size: 0.9rem;
}

.duration-header {
  text-align: right;
}

.song-container {
  background: white;
  border-radius: 0 0 4px 4px;
}

.song-row {
  padding: 12px 0;
  border-bottom: 1px solid #e9ecef;
  align-items: center;
  transition: all 0.2s ease;
  cursor: pointer;

  &:hover {
    background: rgba(52, 152, 219, 0.05);
  }
}

.cover-container {
  position: relative;
  width: 48px;
  height: 48px;
}

.album-cover {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 4px;
  filter: grayscale(20%);
}

.cover-mask {
  position: absolute;
  width: 100%;
  height: 100%;
  border: 2px solid rgba(255, 255, 255, 0.8);
  border-radius: 4px;
  mix-blend-mode: overlay;
}

.song-title {
  font-weight: 500;
  color: #2c3e50;
}

.artist-mobile {
  display: none;
  color: #666;
  font-size: 0.9rem;
  margin-top: 0.2rem;
}

.artist-col,
.duration-col {
  color: #666;
}

.duration-col {
  text-align: right;
}

.random-btn {
  background: #2c3e50;
  color: white;
  border: none;
  transition: all 0.2s ease;
}

.random-btn:hover {
  background: #3498db;
  transform: translateY(-1px);
}

.sort-select {
  width: 120px;
}

@media (max-width: 768px) {
  .artist-col {
    display: none;
  }

  .artist-mobile {
    display: block;
  }

  .song-header {
    display: none;
  }

  .song-row {
    flex-direction: column;
    align-items: flex-start;
    padding: 16px;

    >.el-col {
      width: 100%;
      margin-bottom: 8px;
    }
  }

  .duration-col {
    text-align: left;
  }
}
</style>
