import { defineStore } from 'pinia';
import { ref,watch,computed } from 'vue';
import {getMusicDetail,searchLyric,getLyric,playSong} from "@/api/PlaySong";

export const usePlayStore = defineStore('PlayHistory', () => {
  const hashList = ref([]); // 用于存储当前播放的歌曲的 hash 值
  // 播放历史，包含一首歌曲的详细信息
  const MusicList = ref([
    {
      hash: '', // 歌曲的唯一标识符
      // 歌曲的详细信息
      // 这些信息可以从 API 获取，或者在添加到播放列表时传入
      name: '歌曲名称',
      artist: '歌手',
      url: 'https://example.com/song.mp3', // 替换为实际的歌曲链接
      cover: 'https://example.com/cover.jpg', // 替换为实际的封面图片链接
      lrc: 'https://example.com/lrc.lrc', // 替换为实际的歌词链接
    },
  ]);

  //当前播放的歌曲的hash值
  const currentHash = ref();

  // 当前播放时间
  const currentTime = ref(0);
  // 用于更新播放历史
  const setMusicList = async () => {
    try {
      const res = await getMusicDetail(currentHash.value);
      console.log('setMusicList res', res);
    } catch (error) {
      console.error('setMusicList 错误', error);
    }
  };

  //更改当前播放的音乐hash
  const updateCurrentHash = (newHash) => {
    currentHash.value = newHash;
  };

  const setHashList = (hash,name,artist,cover) => {
    const index = hashList.value.indexOf(hash);
    if (index === -1) {
      hashList.value.push(hash); // 将新的 hash 添加到列表的开头
      MusicList.value.push({
        hash: hash,
        name: name,
        artist: artist,
        url: '',
        cover: cover,
        lrc: '',
      });
    }
  }
  //删除hashList中的全部hash
  const deleteHash = () => {
    hashList.value = [];
    MusicList.value = [];
  }

  const clearPlayList = () => {
    MusicList.value = [];
  }

  // 更新当前播放时间
  const setCurrentTime = (time) => {
    currentTime.value = time;
  };

  watch(currentHash, async (newHash) => {
    if (!newHash) return; // 防止是空的
    try {
      const res = await playSong(newHash);
      const { candidates } = await searchLyric(newHash); // 搜索歌词候选
      const { decodeContent } = await getLyric(candidates[0].id, candidates[0].accesskey); // 获取歌词内容
      const index = hashList.value.indexOf(newHash);
      console.log(`当前是列表的第${ index+1 }首`, index);
      MusicList.value = MusicList.value.map((item) => {
        if (item.hash === newHash) {
          return {
            ...item,
            url: res.backupUrl[0],
            lrc: decodeContent,
          };
        }
        return item;
      });
    } catch (error) {
      console.error('获取音乐详情失败', error);
    }
  });


  return {
    MusicList,
    currentHash,
    hashList,
    currentTime,
    setMusicList,
    updateCurrentHash,
    deleteHash,
    setHashList,
    clearPlayList,
    setCurrentTime
  };
}, {
  persist: true, // 启用持久化
});
