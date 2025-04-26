<script setup>
import { ref, computed, provide, watch } from 'vue';
import { getUserPlayList } from '@/api/user';
import router from '@/router';

const page = ref(1); // 当前页码
const pageSize = ref(15); // 每页显示的数量
const playlistCount = ref(0);
const playlist = ref([]);
const loading = ref(true);

const getPlayList = async () => {
  try {
    loading.value = true;
    const res = await getUserPlayList(page.value, pageSize.value);
    // console.log('歌曲', res);
    playlistCount.value = res.data.list_count;

    // 处理图片URL
    playlist.value = res.data.info.map(song => ({
      ...song,
      // 替换 {size} 占位符
      pic: song.pic
        // 指定具体尺寸
        .replace('{size}', '240')

        // 添加默认图保底处理
        || '/default-cover.jpg'
    }))
    loading.value = false;
  } catch (error) {
    console.error('加载歌单失败:', error);
    // 可以添加错误提示
    ElMessage.error('歌单加载失败，请稍后重试');
  }
};

const handleCardClick = async (song) => {
  // 处理点击歌单的逻辑
  router.push(`/layout/playlist/${song.global_collection_id}`)
};
watch(page, (newVal, oldVal) => {
  getPlayList();
})
getPlayList();
</script>

<template>
  <div class="playlist-container"
    v-loading="loading">
    <div class="header">
      <h1 class="title">我的歌单</h1>
      <div class="stats">共 {{ playlistCount }} 个歌单</div>
    </div>

    <div class="grid">
      <div v-for="(song, index) in playlist"
        :key="index"
        class="playlist-card"
        @click="handleCardClick(song)">
        <div class="card-overlay"></div>
        <img :src="song.pic || '/default-cover.jpg'"
          class="cover-image"
          alt="歌单封面">
        <div class="badge">{{ song.count }}首</div>
        <div class="card-content">
          <h3 class="song-name">{{ song.name }}</h3>
          <div class="meta-info">
            <span class="id-label">ID: {{ song.listid }}</span>
            <span class="global-tag">标签:{{ song.tags }}</span>
            <span class="global-intro">介绍:{{ song.intro || '无' }}</span>
          </div>
        </div>
      </div>
    </div>
    <PageSize v-model="page"
      :pageSize="pageSize"
      :playlistCount="playlistCount">
    </pageSize>
    <div style="height: 110px;width: 100%;"></div>
  </div>
</template>

<style scoped lang="scss">
.playlist-container {
  max-width: 1500px;
  margin: 0 auto;
  padding-top: 0px;
  margin-top: 0;
  transform: translateY(-30px);

  .header {
    margin-bottom: 2rem;
    text-align: center;

    .title {
      font-size: 2.5rem;
      color: #2c3e50;
      margin-bottom: 0.5rem;
      font-weight: 600;
    }

    .stats {
      color: #7f8c8d;
      font-size: 0.95rem;
    }
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 1.5rem;
  }

  .playlist-card {
    position: relative;
    background: #fff;
    width: 100%;
    height: 80%;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    cursor: pointer;

    &:hover {
      transform: translateY(-5px);
      box-shadow: 0 8px 15px rgba(0, 0, 0, 0.2);

      .card-overlay {
        opacity: 0.2;
      }
    }

    .card-overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(45deg, #3498db, #9b59b6);
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    .cover-image {
      width: 100%;
      height: auto;
      object-fit: cover;
    }

    .badge {
      position: absolute;
      top: 0.5rem;
      right: 0.5rem;
      background: rgba(255, 255, 255, 0.6);
      backdrop-filter: blur(10px);
      color: rgb(90, 90, 90);
      padding: 0.3rem 0.7rem;
      font-size: 0.85rem;
      border-radius: 30px;
    }

    .card-content {
      position: absolute;
      bottom: 0;
      width: 100%;
      height: 40px;
      text-align: center;
      background: rgba(255, 255, 255, 0.6);
      /* 半透明白色背景 */
      backdrop-filter: blur(5px);
      /* 毛玻璃效果 */
      border-radius: 12px;
      box-shadow: 0 -2px 5px rgba(0, 0, 0, 0.1);
      transition: 0.5s;

      &:hover {
        height: 80%;
        background: rgba(255, 255, 255, 0.8);
      }

      .song-name {
        margin: 0.5rem 0;
        color: #2c3e50;
        font-size: 1.2rem;
        font-weight: 600;
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-line-clamp: 2; // 兼容 WebKit 浏览器
        -webkit-box-orient: vertical;
        line-clamp: 2; // 标准属性
        display: block; // 配合 line-clamp 使用
      }

      .meta-info {
        margin-top: 0.8rem;
        font-size: 0.9rem;
        color: #7f8c8d;

        .id-label {
          display: block;
          background: #f1f2f631;
          margin-bottom: 0.3rem;
        }

        .global-tag {
          display: block;
          background: #f1f2f631;
          padding: 0.2rem 0.5rem;
          margin-bottom: 0.3rem;
        }

        .global-intro {
          display: block;
          background: #f1f2f631;
          padding: 0.2rem 0.5rem;
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .playlist-container {
    padding: 1rem;

    .grid {
      grid-template-columns: 1fr;
    }
  }
}
</style>
