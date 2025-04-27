<script setup>
import 'aplayer/dist/APlayer.min.css';
import APlayer from 'aplayer';
import { ref, onMounted, watch, onUnmounted } from 'vue';
import { usePlayStore } from '@/stores/PlaybackHistory';

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
    listMaxHeight: 30,
  });
};

// ap.on('listswitch', (e) => {
//   const currentIndex = e.index;
//   // 获取当前播放歌曲的hash值
//   const currentSongHash = player.list[currentIndex].hash;
//   console.log(currentSongHash);
//   playStore.updateCurrentHash(currentSongHash)
// });

// 监听播放历史变化并更新播放器
watch(() => playStore.MusicList, (newValue) => {
  if (ap && Array.isArray(newValue) && newValue.length > 0) {
    ap.pause();
    ap.list.clear();
    ap.list.add(newValue);
    ap.play();
  }
}, { deep: true });


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
