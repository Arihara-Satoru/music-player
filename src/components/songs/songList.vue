<script setup>
import { computed, ref } from 'vue';
import { usePlayStore } from '@/stores/PlaybackHistory';
import { playSong, searchLyric, getLyric } from '@/api/PlaySong';

const playStore = usePlayStore();

const props = defineProps({
  musicList: {
    type: Array,
    required: true,
    default: () => []
  }
})

const formatSongSinger = (title) => {
  return title?.replace(/.*- /, '');
};

const formatSongName = (title) => {
  return title?.replace(/ - .*/, '');
};

const sortOption = ref('default');

const sortedSongs = computed(() => {
  // console.log('11111', props.musicList[0].OriSongName)
  return [...props.musicList].map(item => ({
    ...item,
  })).sort((a, b) =>
    a[sortOption.value].localeCompare(b[sortOption.value])
  );
});

const playRandom = async () => {
  const randomIndex = Math.floor(Math.random() * props.musicList.length);
  console.log('Playing:', props.musicList[randomIndex].OriSongName);
};

const playsongs = async (hash) => {
  const res = await playSong(hash);
  const { candidates } = await searchLyric(hash);
  const { content } = await getLyric(candidates[0].id, candidates[0].accesskey);
  playStore.setPlayHistory(res.fileName, "", res.backupUrl[0], res.trans_param.union_cover.replace('/{size}', ''), decodeLrc(content));
  console.log('Playing song with hash:', res);
};

const formatSongDuration = (song) => {
  let durationMs = 0;

  if ('timelen' in song) {
    durationMs = Number(song.timelen); // 毫秒
  } else if ('Duration' in song) {
    durationMs = Number(song.Duration) * 1000; // 秒转毫秒
  }

  const totalSeconds = Math.floor(durationMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = String(totalSeconds % 60).padStart(2, '0');

  return `${minutes}:${seconds}`;
};
//歌词解码
const decodeLrc = (base64Str) => {
  try {
    const decoded = atob(base64Str); // Base64 → 字符串（但可能乱码）
    const utf8Str = decodeURIComponent(escape(decoded)); // 兼容中文
    console.log('歌词解码成功:', utf8Str);
    return utf8Str;
  } catch (e) {
    console.error('歌词解码失败:', e);
    return '';
  }
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
            value="OriSongName" />
          <el-option label="歌手排序"
            value="SingerName" />
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

    <el-row v-for="(song, index) in musicList"
      :key="index"
      class="song-row"
      :gutter="20"
      @click="playsongs(song?.hash || song?.FileHash)">
      <el-col :span="2">
        <div class="cover-container">
          <div class="cover-mask"></div>
          <img
            :src="(song.cover?.replace('{size}', '') || song.Image?.replace('{size}', '') || '/default-cover.jpg')"
            class="album-cover" />
        </div>
      </el-col>
      <el-col :span="10"
        class="song-title-col">
        <span class="song-title">{{ song.OriSongName ||
          formatSongSinger(song.name) || '歌曲无版权.........' }}</span>
        <span class="artist-mobile">{{ song.SingerName ||
          formatSongName(song.name) }}</span>
      </el-col>
      <el-col :span="8"
        class="artist-col">
        {{ song.SingerName ||
          formatSongName(song.name) }}
      </el-col>
      <el-col :span="4"
        class="duration-col">
        <span>{{ formatSongDuration(song) }}</span>
      </el-col>
    </el-row>
  </div>
</template>

<style scoped lang="scss">
.disabled-row {
  cursor: not-allowed;
}

.song-list {
  // padding: 2rem;
  background: #f8f9fa00;
  width: 100%;
  // min-height: 100vh;
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

.song-row {
  padding: 6px 0;
  background-color: #2c3e502a;
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
