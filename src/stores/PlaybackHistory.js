import { defineStore } from 'pinia';
import { ref } from 'vue';

export const usePlayStore = defineStore('PlayHistory', () => {
  // 播放历史，包含一首歌曲的详细信息
  const playHistory = ref([
    {
      name: '歌曲名称',
      artist: '歌手',
      url: 'https://example.com/song.mp3', // 替换为实际的歌曲链接
      cover: 'https://example.com/cover.jpg', // 替换为实际的封面图片链接
      lrc: 'https://example.com/lrc.lrc', // 替换为实际的歌词链接
    },
  ]);

  // 当前播放时间
  const currentTime = ref(0);

  // 用于更新播放历史
  const setPlayHistory = (name,  artist,url,cover,  lrc) => {
    playHistory.value = [
      { name, artist, url, cover, lrc },
    ];
  };

  // 更新当前播放时间
  const setCurrentTime = (time) => {
    currentTime.value = time;
  };

  return { playHistory, currentTime, setPlayHistory, setCurrentTime };
}, {
  persist: true, // 启用持久化
});
