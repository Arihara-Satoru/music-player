import request from '@/utils/request';
//获取歌曲URl
export const playSong = (hash) => {
  return request.get('/song/url', { params: { hash,quality:'flac' } });
}
//歌词搜索
export const searchLyric = (hash) => {
  return request.get('/search/lyric', { params: { hash } });
}
//获取歌词
export const getLyric = (id, accesskey) => {
  return request.get('/lyric', { params: { id, accesskey,fmt:'lrc' } });
}
