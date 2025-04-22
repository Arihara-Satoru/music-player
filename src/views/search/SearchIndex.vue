<script setup>
import { ref, watch } from 'vue'
import { searchMusic } from '@/api/user'
const query = ref('')
const musicList = ref([])
const loading = ref(false)

const page = ref(1); // 当前页码
const pageSize = ref(20); // 每页显示的数量
const playlistCount = ref(0);

const handleSearch = async () => {
  loading.value = true
  console.log(query.value)
  const { data } = await searchMusic(query.value, page.value, pageSize.value)
  console.log(data)
  musicList.value = data.lists
  loading.value = false
  playlistCount.value = data.total
}

watch(page, (newVal, oldVal) => {
  handleSearch()
}, { immediate: false }) // immediate 决定是否立即执行

// console.log(musicList.value)
</script>

<template>
  <div class="animation"
    v-loading="loading"
    :class="musicList.length ? 'search-indexup' : 'search-index'">
    <header class="search-header">
      <input v-model="query"
        @input="onSearch"
        type="text"
        @keydown.enter="handleSearch"
        placeholder="输入内容来搜索歌曲"
        class="search-input" />
    </header>
    <section class="search-results"
      v-if="musicList.length">
      <song-list :musicList="musicList" />
    </section>
    <PageSize v-model="page"
      :pageSize="pageSize"
      :playlistCount="playlistCount"
      v-if="musicList.length">
    </pageSize>
  </div>
</template>

<style scoped>
template {
  display: flex;
  flex-direction: column;
}

.search-index {
  margin: 0 auto;
  width: 600px;
  height: 60vh;
  /* 使容器高度占满整个视口 */
  padding: 16px;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  /* 使子元素垂直排列 */
}

.search-indexup {
  width: 100%;
  height: 100vh;
  /* 使容器高度占满整个视口 */
  padding: 16px;
  top: 0;
  display: flex;
  flex-direction: column;
  transition: 0.3s ease-in-out;
}

.search-header {
  translate: 1s;
  width: 100%;
  margin-bottom: 16px;
}

.search-input {
  width: 100%;
  padding: 8px;
  font-size: 16px;
  border-radius: 5px;
}

.search-results {
  margin-top: 16px;
}

.result-item {
  padding: 8px 0;
  border-bottom: 1px solid #ddd;
}

.no-results {
  color: #888;
  margin-top: 16px;
}


.example-pagination-block {
  width: 100%;
  margin: 10px;
  display: flex;
  text-align: center;
  justify-content: center;
}

.el-pagination {
  margin-bottom: 16px;
}
</style>
