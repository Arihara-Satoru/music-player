<script setup>
import { ref, watch } from 'vue'
import { searchMusic } from '@/api/user'
const query = ref('')
const musicList = ref([])
const loading = ref(false)

const page = ref(1) // 当前页码
const pageSize = ref(20) // 每页显示的数量
const playlistCount = ref(0)

const handleSearch = async () => {
  loading.value = true
  console.log(query.value)
  const { data } = await searchMusic(query.value, page.value, pageSize.value)
  console.log(data)
  musicList.value = data.lists
  loading.value = false
  playlistCount.value = data.total
}

watch(
  page,
  () => {
    handleSearch()
  },
  { immediate: false },
) // immediate 决定是否立即执行

// console.log(musicList.value)
</script>

<template>
  <div class="search-container" v-loading="loading">
    <!-- 搜索头部区域 -->
    <header class="search-header">
      <div class="search-input-wrapper">
        <input
          v-model="query"
          @input="onSearch"
          type="text"
          @keydown.enter="handleSearch"
          placeholder="搜索歌曲、歌手、专辑..."
          class="search-input"
        />
        <button @click="handleSearch" class="search-button">
          <span class="search-icon">🔍</span>
        </button>
      </div>
    </header>

    <!-- 搜索结果区域 -->
    <section class="search-results-section" v-if="musicList.length">
      <h2 class="section-title">搜索结果</h2>
      <song-list :musicList="musicList" />
      <div class="pagination-wrapper">
        <PageSize v-model="page" :pageSize="pageSize" :playlistCount="playlistCount" />
      </div>
      <div style="height: 110px; width: 100%"></div>
    </section>

    <!-- 搜索历史或热门搜索区域（无结果时显示） -->
    <section class="search-placeholder-section" v-else>
      <div class="placeholder-content">
        <h2 class="section-title">热门搜索</h2>
        <div class="hot-searches">
          <span class="hot-tag">周杰伦</span>
          <span class="hot-tag">告白气球</span>
          <span class="hot-tag">邓紫棋</span>
          <span class="hot-tag">光年之外</span>
          <span class="hot-tag">林俊杰</span>
          <span class="hot-tag">不为谁而作的歌</span>
        </div>

        <h2 class="section-title">搜索历史</h2>
        <div class="search-history">
          <span class="history-tag">最近搜索1</span>
          <span class="history-tag">最近搜索2</span>
          <span class="history-tag">最近搜索3</span>
        </div>
        <p class="no-results-text">输入关键词开始搜索吧！</p>
      </div>
    </section>
  </div>
</template>

<style scoped>
.search-container {
  padding: 20px; /* 保持整体内边距 */
  background-color: #f5f7fa;
  min-height: calc(100vh - var(--header-height, 60px) - var(--footer-height, 80px));
  display: flex;
  flex-direction: column;
  align-items: center; /* 居中内容 */
  width: 100%; /* 确保容器占据全部宽度 */
  box-sizing: border-box;
}

.search-header {
  width: 100%;
  max-width: 1000px; /* 增加搜索框最大宽度 */
  margin-bottom: 30px;
  padding: 10px;
  background-color: #ffffff;
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: center;
}

.search-input-wrapper {
  display: flex;
  width: 100%;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
  transition: border-color 0.3s ease;
}

.search-input-wrapper:focus-within {
  border-color: #42b983; /* 聚焦时边框颜色 */
  box-shadow: 0 0 0 3px rgba(66, 185, 131, 0.2);
}

.search-input {
  flex-grow: 1;
  padding: 12px 15px;
  font-size: 1.1em;
  border: none;
  outline: none;
  background-color: transparent;
}

.search-input::placeholder {
  color: #999;
}

.search-button {
  background-color: #42b983;
  border: none;
  padding: 12px 20px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.search-button:hover {
  background-color: #36a073;
}

.search-icon {
  font-size: 1.2em;
  color: #fff;
}

.section-title {
  font-size: 1.5em;
  color: #34495e;
  margin-bottom: 20px;
  border-bottom: 2px solid #e0e0e0;
  padding-bottom: 10px;
  width: 100%;
  text-align: left;
}

.search-results-section {
  width: 100%;
  max-width: 1200px; /* 增加结果区域最大宽度 */
  background-color: #ffffff;
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  padding: 20px;
}

.pagination-wrapper {
  margin-top: 20px;
  display: flex;
  justify-content: center;
  padding-bottom: 20px;
}

.search-placeholder-section {
  width: 100%;
  max-width: 1000px; /* 增加占位符区域最大宽度 */
  background-color: #ffffff;
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  padding: 30px;
  text-align: center;
}

.placeholder-content {
  padding: 20px;
}

.hot-searches,
.search-history {
  margin-bottom: 30px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
}

.hot-tag,
.history-tag {
  background-color: #e9ecef;
  color: #495057;
  padding: 8px 15px;
  border-radius: 20px;
  font-size: 0.9em;
  cursor: pointer;
  transition:
    background-color 0.2s ease,
    color 0.2s ease;
}

.hot-tag:hover,
.history-tag:hover {
  background-color: #dee2e6;
  color: #212529;
}

.no-results-text {
  color: #888;
  font-size: 1.1em;
  margin-top: 30px;
}
</style>
