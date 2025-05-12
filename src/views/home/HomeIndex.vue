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
        type: 'ai'
      }
    })
  } catch (error) {
    console.error('获取AI推荐失败:', error)
  }
}
</script>

<template>
  <section class="search-results"
    v-if="songs.length">
    <song-list :musicList="songs" />
  </section>
  <div class="recommend-container"
    v-else>
    <div class="recommend-card"
      @click="recommandMusic()">
      <h3>每日推荐</h3>
      <p>发现每日为你精选的音乐</p>
    </div>

    <div class="recommend-card"
      @click="fetchAIRecommend">
      <h3>AI推荐</h3>
      <p>基于你的喜好智能推荐</p>
    </div>
  </div>
</template>

<style scoped>
.search-results {
  display: flex;
  width: 100%;
}

.recommend-container {
  display: flex;
  gap: 20px;
  padding: 20px;
  height: 100px;
}

.recommend-card {
  flex: 1;
  padding: 20px;
  border-radius: 8px;
  background: #81a7ad;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.recommend-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.recommend-card h3 {
  margin: 0 0 10px 0;
  font-size: 18px;
  color: #333;
}

.recommend-card p {
  margin: 0;
  font-size: 14px;
  color: #666;
}
</style>
