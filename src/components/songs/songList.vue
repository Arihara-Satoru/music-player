<script setup>
// 引入 Vue 的响应式 API 和其他依赖
import { computed, ref } from 'vue';
import { getMusic } from '@/utils/GetMusicList';
import { getMusicDetail } from '@/api/PlaySong';
import { ElMessage } from 'element-plus';
import { useRoute } from 'vue-router'
const route = useRoute();

// 定义组件的 props，接收音乐列表数据
const props = defineProps({
  musicList: {
    type: Array, // 数据类型为数组
    required: true, // 必填项
    default: () => [] // 默认值为空数组
  }
});

// 格式化歌曲歌手名称（去除标题中的歌手前缀）
const formatSongSinger = (title) => {
  return title?.replace(/.*- /, ''); // 使用正则表达式匹配并替换
};

// 格式化歌曲名称（去除标题中的歌手后缀）
const formatSongName = (title) => {
  return title?.replace(/ - .*/, ''); // 使用正则表达式匹配并替换
};

// 排序选项，默认为 "default"
const sortOption = ref('default');

// 计算排序后的歌曲列表
const sortedSongs = computed(() => {
  return [...props.musicList] // 深拷贝音乐列表
    .map(item => ({ ...item })) // 展开每个对象以避免直接修改原始数据
    .sort((a, b) => a[sortOption.value].localeCompare(b[sortOption.value])); // 根据排序选项进行排序
});

// 随机播放一首歌曲
const playRandom = async () => {
  console.log(await getMusicDetail("DAB710A38CE0C9DA49CAE446387B61DC"))
  const randomIndex = Math.floor(Math.random() * props.musicList.length); // 随机生成索引
  console.log('Playing:', props.musicList[randomIndex].OriSongName); // 打印正在播放的歌曲名
};

// 播放指定歌曲
const playsongs = async (hash, name, singer, cover) => {
  const info = [name, singer, cover]
  const page = route.query.page
  const ids = ref(); // 用于存储当前播放的歌曲的 hash 值
  ids.value = route.params.listid || ''; // 确保 ids.value 被正确赋值
  console.log('hash', hash, 'id', ids.value, 'musiclist', props.musicList, 'info', info, 'page', page);
  await getMusic(hash, ids.value, props.musicList, info, page);
};

const handleClick = (song) => {
  if (!song.hash && !song.FileHash) {
    ElMessage.warning('该歌曲无版权');
    return;
  }
  playsongs(song?.hash || song?.FileHash, song.OriSongName || song.songname || formatSongSinger(song.name), song.SingerName || song.author_name || formatSongName(song.name), song.Image || song.sizable_cover);
};

// 格式化歌曲时长
const formatSongDuration = (song) => {
  let durationMs = 0;

  if ('timelen' in song) {
    durationMs = Number(song.timelen); // 如果存在 timelen 字段，则直接使用
  } else if ('Duration' in song) {
    durationMs = Number(song.Duration) * 1000; // 如果存在 Duration 字段，则将其转换为毫秒
  } else if ('time_length' in song) {
    durationMs = Number(song.time_length) * 1000;
  }

  const totalSeconds = Math.floor(durationMs / 1000); // 将毫秒转换为秒
  const minutes = Math.floor(totalSeconds / 60); // 计算分钟数
  const seconds = String(totalSeconds % 60).padStart(2, '0'); // 计算秒数并补零

  return `${minutes}:${seconds}`; // 返回格式化的时长字符串
};
</script>

<template>
  <!-- 歌曲列表容器 -->
  <div class="song-list">
    <!-- 列表头部 -->
    <div class="header">
      <h1 class="title">TRACKS</h1> <!-- 标题 -->
      <div class="controls">
        <!-- 排序下拉框 -->
        <el-select v-model="sortOption"
          size="small"
          class="sort-select">
          <el-option label="标题排序"
            value="OriSongName" />
          <el-option label="歌手排序"
            value="SingerName" />
        </el-select>
        <!-- 随机播放按钮 -->
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
      <el-col :span="2"></el-col> <!-- 空列 -->
      <el-col :span="10"
        class="header-title">标题</el-col> <!-- 标题列 -->
      <el-col :span="8"
        class="header-title">歌手</el-col> <!-- 歌手列 -->
      <el-col :span="4"
        class="header-title duration-header">时长</el-col> <!-- 时长列 -->
    </el-row>

    <!-- 歌曲列表 -->
    <el-row v-for="(song, index) in musicList"
      :key="index"
      class="song-row"
      :gutter="20"
      :class="{ 'disabled-row': !song.hash && !song.FileHash }"
      @click="handleClick(song)">
      <el-col :span="2">
        <!-- 封面图片 -->
        <div class="cover-container">
          <div class="cover-mask"></div>
          <img
            :src="(song.cover?.replace('{size}', '64') || song.sizable_cover?.replace('{size}', '64') || song.Image?.replace('{size}', '64') || '/default-cover.jpg')"
            class="album-cover" />
        </div>
      </el-col>
      <el-col :span="10"
        class="song-title-col">
        <!-- 歌曲标题 -->
        <span class="song-title">{{ song.OriSongName || song.songname ||
          formatSongSinger(song.name) || '歌曲无版权.........' }}</span>
        <!-- 歌手名称（移动端显示） -->
        <span class="artist-mobile">{{ song.SingerName || song.author_name ||
          formatSongName(song.name) }}</span>
      </el-col>
      <el-col :span="8"
        class="artist-col">
        <!-- 歌手名称 -->
        {{ song.SingerName || formatSongName(song.name) }}
      </el-col>
      <el-col :span="4"
        class="duration-col">
        <!-- 歌曲时长 -->
        <span>{{ formatSongDuration(song) }}</span>
      </el-col>
    </el-row>
  </div>
</template>

<style scoped lang="scss">
/* 样式部分 */
.disabled-row {
  cursor: not-allowed;
  opacity: 0.6;
  /* 可选：降低透明度以表示不可用 */
}

.disabled-row:hover {
  background: none;
  /* 移除悬停效果 */
}

.song-list {
  background: #f8f9fa00;
  width: 100%;
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
  display: inline-block;
  margin-left: 0.5rem;
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
