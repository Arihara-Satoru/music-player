<template>
  <div class="search-index">
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
      <ul>
        <li v-for="(result, index) in searchMusic"
          :key="index"
          class="result-item">
          {{ result }}
        </li>
      </ul>
    </section>
    <!-- <p v-else
      class="no-results"
      v-if="query">No results found.</p> -->
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { searchMusic } from '@/api/user'
const query = ref('')
const musicList = ref([])
const handleSearch = async () => {
  console.log(query.value)
  const { data } = await searchMusic(query.value)
  console.log(data)
  musicList.value = data
}

// console.log(musicList)
</script>

<style scoped>
.search-index {
  width: 100%;
  height: 60vh;
  /* 使容器高度占满整个视口 */
  padding: 16px;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  /* 使子元素垂直排列 */
}

.search-header {
  width: 600px;
  margin-bottom: 16px;
}

.search-input {
  width: 100%;
  padding: 8px;
  font-size: 16px;
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
</style>
