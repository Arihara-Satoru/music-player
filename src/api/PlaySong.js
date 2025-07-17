import request from '@/utils/request'
//获取歌曲URl
export const playSong = (hash) => {
  return request.get('/song/url', { params: { hash } })
}
//歌词搜索
export const searchLyric = (hash) => {
  return request.get('/search/lyric', { params: { hash, man: 'yes' } })
}
//获取歌词
export const getLyric = (id, accesskey) => {
  return request.get('/lyric', { params: { id, accesskey, fmt: 'lrc', decode: 'true' } })
}
//获取音乐详情
export const getMusicDetail = (hash) => {
  return request.get('/privilege/lite', { params: { hash } })
}
//获取歌单详情
export const getPlayListDetail = (ids) => {
  return request.get('/playlist/detail', { params: { ids } })
}
