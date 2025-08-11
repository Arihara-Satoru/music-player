<script setup>
import { useRouter } from 'vue-router'
import { getRecommandMusic } from '@/api/RecommandMusic'
import { ref } from 'vue'

const router = useRouter()
const songs = ref([])
const recommandMusic = async () => {
  try {
    // 调用每日推荐接口
    const response = await getRecommandMusic()
    console.log('每日推荐数据:', response)
    songs.value = response.data.song_list
    console.log('歌曲列表:', songs.value)
  } catch (error) {
    console.error('获取每日推荐失败:', error)
  }
}

const fetchAIRecommend = async () => {
  try {
    // 获取当前播放历史或喜欢的音乐ID
    const audioIds = '1,2,3' // 这里应该是动态获取的album_audio_id
    // 调用AI推荐接口
    const response = await fetch(`/ai/recommend?album_audio_id=${audioIds}`)
    const data = await response.json()
    // 处理返回的数据
    router.push({
      name: 'playlist',
      query: {
        id: data.id,
        type: 'ai',
      },
    })
  } catch (error) {
    console.error('获取AI推荐失败:', error)
  }
}
</script>

<template>
  <div class="home-container">
    <!-- 欢迎信息或标题 -->
    <h1 class="page-title">欢迎来到音乐播放器</h1>

    <!-- 每日推荐和AI推荐卡片 -->
    <section class="recommendation-section">
      <h2 class="section-title">为你推荐</h2>
      <div class="recommend-cards-wrapper">
        <div class="recommend-card daily-recommend" @click="recommandMusic()">
          <div class="card-icon">🎵</div>
          <h3>每日推荐</h3>
          <p>发现每日为你精选的音乐</p>
        </div>

        <div class="recommend-card ai-recommend" @click="fetchAIRecommend">
          <div class="card-icon">🤖</div>
          <h3>AI推荐</h3>
          <p>基于你的喜好智能推荐</p>
        </div>
      </div>
    </section>

    <!-- 歌曲列表（如果存在） -->
    <section class="search-results" v-if="songs.length">
      <h2 class="section-title">推荐歌曲</h2>
      <song-list :musicList="songs" />
    </section>

    <!-- 占位符内容：热门歌单 -->
    <section class="placeholder-section">
      <h2 class="section-title">热门歌单</h2>
      <div class="placeholder-grid">
        <div class="placeholder-item">
          <div class="placeholder-cover"></div>
          <p>歌单名称 1</p>
        </div>
        <div class="placeholder-item">
          <div class="placeholder-cover"></div>
          <p>歌单名称 2</p>
        </div>
        <div class="placeholder-item">
          <div class="placeholder-cover"></div>
          <p>歌单名称 3</p>
        </div>
        <div class="placeholder-item">
          <div class="placeholder-cover"></div>
          <p>歌单名称 4</p>
        </div>
      </div>
    </section>

    <!-- 占位符内容：新歌速递 -->
    <section class="placeholder-section">
      <h2 class="section-title">新歌速递</h2>
      <div class="placeholder-grid">
        <div class="placeholder-item">
          <div class="placeholder-cover"></div>
          <p>新歌名称 1</p>
        </div>
        <div class="placeholder-item">
          <div class="placeholder-cover"></div>
          <p>新歌名称 2</p>
        </div>
        <div class="placeholder-item">
          <div class="placeholder-cover"></div>
          <p>新歌名称 3</p>
        </div>
        <div class="placeholder-item">
          <div class="placeholder-cover"></div>
          <p>新歌名称 4</p>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.home-container {
  /* 移除左右内边距，让内容铺满 */
  padding: 20px 0;
  background-color: #f5f7fa; /* 轻微的背景色 */
  min-height: calc(
    100vh - var(--header-height, 60px) - var(--footer-height, 80px)
  ); /* 确保内容区域有最小高度 */
  width: 100%; /* 确保容器占据全部宽度 */
  box-sizing: border-box; /* 包含padding和border在宽度内 */
}

.page-title {
  font-size: 2.5em;
  color: #2c3e50;
  margin-bottom: 30px;
  text-align: center;
  font-weight: bold;
  letter-spacing: 1px;
  padding: 0 20px; /* 标题也添加左右内边距 */
}

.section-title {
  font-size: 1.8em;
  color: #34495e;
  margin-bottom: 20px;
  border-bottom: 2px solid #e0e0e0;
  padding-bottom: 10px;
  padding-left: 20px; /* 标题也添加左内边距 */
}

.recommendation-section {
  margin-bottom: 40px;
}

.recommend-cards-wrapper {
  display: flex;
  gap: 25px;
  justify-content: center;
  flex-wrap: wrap; /* 允许卡片换行 */
  padding: 0 20px; /* 为卡片内部添加左右内边距，避免贴边 */
}

.recommend-card {
  flex: 1;
  min-width: 280px; /* 最小宽度，防止过小 */
  max-width: 400px; /* 最大宽度 */
  padding: 30px;
  border-radius: 12px;
  background: linear-gradient(135deg, #6dd5ed, #2193b0); /* 渐变背景 */
  color: #fff; /* 白色文字 */
  cursor: pointer;
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.15);
}

.recommend-card.daily-recommend {
  background: linear-gradient(135deg, #ff9a9e, #fad0c4);
}

.recommend-card.ai-recommend {
  background: linear-gradient(135deg, #a18cd1, #fbc2eb);
}

.recommend-card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 12px 25px rgba(0, 0, 0, 0.25);
}

.card-icon {
  font-size: 3em;
  margin-bottom: 15px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  width: 80px;
  height: 80px;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.recommend-card h3 {
  margin: 0 0 10px 0;
  font-size: 24px;
  font-weight: bold;
}

.recommend-card p {
  margin: 0;
  font-size: 16px;
  opacity: 0.9;
}

.search-results {
  margin-top: 40px;
  padding-top: 20px;
  border-top: 1px solid #e0e0e0;
}

.placeholder-section {
  margin-top: 40px;
}

.placeholder-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); /* 响应式网格 */
  gap: 20px;
  padding: 0 20px; /* 为占位符网格内部添加左右内边距 */
}

.placeholder-item {
  background-color: #ffffff;
  border-radius: 10px;
  padding: 15px;
  text-align: center;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
  transition: transform 0.2s ease;
}

.placeholder-item:hover {
  transform: translateY(-5px);
}

.placeholder-cover {
  width: 100%;
  height: 150px;
  background-color: #e0e0e0; /* 占位符颜色 */
  border-radius: 8px;
  margin-bottom: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #888;
  font-size: 1.2em;
}

.placeholder-item p {
  font-size: 15px;
  color: #555;
  margin: 0;
}
</style>
