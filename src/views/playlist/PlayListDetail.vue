<script setup>
import { ref, watch } from 'vue' // 引入 watch
import { useRoute } from 'vue-router'
import { getPlayListSong } from '@/api/user'
import { usePlayStore } from '@/stores/PlaybackHistory'

const playStore = usePlayStore()
const route = useRoute()
const id = ref(null)
const page = ref(1) // 当前页码
const playlistCount = ref(0)
const musicList = ref([])
const loading = ref(false)
const playlistTitle = ref('') // 新增：歌单标题

// 新增：用于缓存歌单ID和歌曲数据
const cachedPlaylistId = ref(null)
const cachedMusicList = ref([])

const res = ref(null)

// 获取播放列表详情的异步函数
const getPlayListDetail = async () => {
  // 从路由参数中获取列表ID和类型
  const currentId = route.params.listid
  const type = route.query.type

  // 处理每日推荐
  if (type === 'daily_recommend') {
    console.log('正在加载每日推荐歌曲...')
    musicList.value = playStore.dailyRecommendSongs
    playlistCount.value = musicList.value.length
    playlistTitle.value = '每日推荐' // 设置标题
    loading.value = false
    return
  }

  // 如果当前歌单ID与缓存的歌单ID相同，并且缓存中有数据，则直接使用缓存数据
  if (currentId === cachedPlaylistId.value && cachedMusicList.value.length > 0) {
    console.log('使用缓存数据')
    id.value = currentId
    musicList.value = cachedMusicList.value
    playStore.totalMusic = musicList.value.length
    playlistCount.value = musicList.value.length
    playlistTitle.value = res.value?.data.list_info?.name || '歌单详情' // 从缓存中获取标题
    return // 结束函数，不发送请求
  }

  // 设置加载状态为true
  loading.value = true
  // 更新当前歌单ID
  id.value = currentId
  // 重置页码
  page.value = 1

  // 根据列表ID和当前页码获取播放列表歌曲信息
  res.value = await getPlayListSong(id.value, page.value, 300)
  // 更新播放列表歌曲总数到存储
  playStore.totalMusic = res.value.data.count
  // 设置当前播放列表歌曲数量
  playlistCount.value = res.value.data.count
  // 设置当前页的音乐列表
  musicList.value = res.value.data.songs
  // 如果播放列表歌曲数量大于当前音乐列表长度，则继续加载更多歌曲
  while (playlistCount.value > musicList.value.length) {
    // 加载更多歌曲信息
    const moreMusic = await getPlayListSong(id.value, ++page.value, 300)
    // 将新获取的歌曲信息拼接到音乐列表中
    musicList.value = musicList.value.concat(moreMusic.data.songs) // 拼接
    console.log('page', page.value)
  }
  console.log('歌单', res.value.data)

  // 设置歌单标题
  playlistTitle.value = res.value?.data.list_info?.name || '歌单详情'

  // 缓存当前歌单ID和歌曲数据
  cachedPlaylistId.value = currentId
  cachedMusicList.value = musicList.value

  // 设置加载状态为false
  loading.value = false
}

// 监听路由参数的变化，当listid或type变化时重新获取歌单详情
// 监听路由参数的变化，当listid或type变化时重新获取歌单详情
watch(
  () => [route.params.listid, route.query.type], // 监听两个参数
  ([newId, newType], oldValues) => {
    // oldValues 可能是 undefined
    // 在第一次执行 watch 时，oldValues 会是 undefined。
    // 为了避免解构 undefined 导致的错误，我们进行安全检查。
    const oldId = oldValues ? oldValues[0] : undefined
    const oldType = oldValues ? oldValues[1] : undefined

    if (newId !== oldId || newType !== oldType) {
      getPlayListDetail()
    }
  },
  { immediate: true }, // 立即执行一次，以便在组件初次加载时获取数据
)
</script>

<template>
  <div style="width: 100%" v-loading="loading">
    <songList :musicList="musicList">{{ playlistTitle }}</songList>
    <!-- <PageSize v-model="page" :pageSize="pageSize" :playlistCount="playlistCount"> </PageSize> -->
    <div style="height: 110px; width: 100%"></div>
  </div>
</template>

<style></style>
