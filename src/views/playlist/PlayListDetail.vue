<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { getPlayListSong } from '@/api/user'
import { usePlayStore } from '@/stores/PlaybackHistory'

const playStore = usePlayStore()
const route = useRoute()
const id = ref(null)

const page = ref(1); // 当前页码
const pageSize = ref(20); // 每页显示的数量
const playlistCount = ref(0);
const musicList = ref([])
const loading = ref(false)
const getPlayListDetail = async () => {
  loading.value = true
  id.value = route.params.listid
  const res = await getPlayListSong(id.value, page.value, pageSize.value)
  playlistCount.value = res.data.count
  musicList.value = res.data.songs
  console.log('歌单', res.data)
  loading.value = false
}

watch(page, (newVal, oldVal) => {
  getPlayListDetail()
})
getPlayListDetail()
</script>

<template>
  <div style="width: 100%;"
    v-loading="loading">
    <songList :musicList="musicList"></songList>
    <PageSize v-model="page"
      :pageSize="pageSize"
      :playlistCount="playlistCount">
    </pageSize>
    <div style="height: 110px;width: 100%;"></div>
  </div>

</template>

<style></style>
