<script setup>
import 'aplayer/dist/APlayer.min.css';
import APlayer from 'aplayer';
import { ref, onMounted, watch } from 'vue';
import { usePlayStore } from '@/stores/PlaybackHistory';

// 获取 Pinia 中的播放历史
const playStore = usePlayStore();

// 用于存储播放器实例
let ap = null;

// 播放器初始化函数
const addMyAudio = () => {
  ap = new APlayer({
    container: document.getElementById("aplayer"),
    audio: playStore.playHistory // 直接传递播放历史
  });
};

// 监听播放历史变化并更新播放器
watch(() => playStore.playHistory, (newValue) => {
  if (ap) {
    // 先暂停播放器，避免播放状态冲突
    ap.pause();

    // 更新播放列表
    ap.list.clear(); // 清空当前的播放列表
    ap.list.add(playStore.playHistory); // 添加新的播放列表

    // 确保播放器准备好后再播放新歌曲
    ap.play(); // 播放新的歌曲
  }
}, { deep: true });

onMounted(() => {
  addMyAudio(); // 页面加载时初始化播放器

  // 监听播放进度变化
  if (ap) {
    ap.on('timeupdate', () => {
      playStore.setCurrentTime(ap.audio.currentTime);
    });
  }
});
</script>


<template>
  <div class="miniplayer">
    <div id="aplayer"></div>
  </div>

</template>


<style>
.miniplayer {
  margin: 0 auto;
  justify-content: center;
}
</style>
