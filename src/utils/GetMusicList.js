import { usePlayStore } from "@/stores/PlaybackHistory";
const playstore = usePlayStore();

export const getMusic = async (hash, ids, MusicListObj) => {
  if (ids !== undefined) {
    playstore.deleteHash(); // 清空原来的 hash 列表

    // 确保传入的 MusicListObj 是有效的对象
    if (MusicListObj && typeof MusicListObj === 'object') {
      Object.keys(MusicListObj).forEach(key => {
        const song = MusicListObj[key];

        // 确保 singerinfo 数组存在并且至少有一个元素
        const singerName = song.singerinfo && Array.isArray(song.singerinfo) && song.singerinfo[0] ? song.singerinfo[0].name : '未知歌手';

        // 确保 cover 字段有效，并且替换 {size} 为 64
        const coverUrl = song.cover ? song.cover.replace('{size}', '64') : '';

        playstore.setHashList(song.hash, song.name, singerName, coverUrl);
      });
    } else {
      console.error("传入的 MusicListObj 结构不正确", MusicListObj);
    }
  } else {
    playstore.setHashList(hash);
  }

  playstore.updateCurrentHash(hash); // 切换播放
  return { getMusic };
}
