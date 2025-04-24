import request from '@/utils/request';
//获取歌曲URl
export const playSong = (hash) => {
  return request.get('/song/url', { params: { hash } });
}
