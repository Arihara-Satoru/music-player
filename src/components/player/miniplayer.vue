<script setup>
import 'aplayer/dist/APlayer.min.css';
import APlayer from 'aplayer';
import { ref, onMounted } from 'vue';
import { usePlayStore } from '@/stores/PlaybackHistory';
const playStore = usePlayStore();
const audio = ref([
  {
    name: "China-Y", // 歌名
    artist: '徐梦圆', // 歌手
    url: playStore.playHistory[0], // 音频文件地址
    cover: 'http://imge.kugou.com/stdmusic/150/20170815/20170815070007812976.jpg', // 音乐封面地址
    lrc: "" // 歌词
  }
]);

const addMyAudio = () => {
  const ap = new APlayer({
    container: document.getElementById("aplayer"),
    audio: audio.value
  });
};

onMounted(() => {

  addMyAudio();
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
