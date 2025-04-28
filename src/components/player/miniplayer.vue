<script setup>
import 'aplayer/dist/APlayer.min.css';
import APlayer from 'aplayer';
import { ref, onMounted, watch, onUnmounted } from 'vue';
import { usePlayStore } from '@/stores/PlaybackHistory';
import { nextTick } from 'vue';
// 获取 Pinia 中的播放历史
const playStore = usePlayStore();

// 用于存储播放器实例
let ap = null;

// 播放器初始化函数
const addMyAudio = () => {

  ap = new APlayer({
    container: document.getElementById("aplayer"),
    mutex: true,
    lrcType: 1,
    audio: playStore.MusicList, // 直接传递播放历史
    listFolded: true,
    listMaxHeight: 20,
  });
};

// 监听播放历史变化并更新播放器
watch(() => playStore.currentHash, async (newHash) => {
  ElMessage.success('正在切换音乐');
  ap.list.clear(); // 清空列表
  ap.list.add(playStore.MusicList); // 加上新的 MusicList
  if (ap && typeof newHash === 'string') {
    const index = ap.list.audios.findIndex(audio => audio.hash === newHash);
    if (index !== -1) {
      ap.list.switch(index);
      ap.play();
      // 等待切换完成后再触发 listswitch
      await nextTick(() => {
        // 这里的 listswitch 会在切换完之后触发
        ap.on('listswitch', (e) => {
          const currentIndex = e.index;
          console.log(currentIndex); // 这里应该是正确的当前音乐 index
        });
      });
    } else {
      console.warn('当前hash在列表中找不到', newHash);
    }
  }
});



onMounted(() => {
  addMyAudio();
  playStore.clearPlayList();

  if (ap) {
    ap.on('timeupdate', () => {
      if (ap.audio) {
        playStore.setCurrentTime(ap.audio.currentTime);
      }
    });
  }
});


// 页面销毁时销毁播放器
onUnmounted(() => {
  if (ap) {
    ap.destroy(); // 销毁播放器实例
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
