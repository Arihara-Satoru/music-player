import { usePlayStore } from "@/stores/PlaybackHistory";
const playstore = usePlayStore();

export const getMusic = async (hash, ids, MusicListObj, info,page) => {
  if (ids !== '') {
    if(ids !== playstore.musicIds) {
      playstore.clearPlayList(); // 清空播放列表
      playstore.setMusicIds(ids); // 设置新的音乐 ID
    }
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
    playstore.setHashList(hash, info[0], info[1], info[2].replace('{size}', '64')); // 设置当前播放的音乐信息
  }
  if(hash){
    playstore.updateCurrentHash(hash); // 切换播放
    playstore.setPage(page)
  }else{
    console.log('没有hash');
  }

  return { getMusic };
}
