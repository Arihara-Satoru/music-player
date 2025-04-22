import request from '@/utils/request';
//获取用户信息
export const userInfo = ()=>{
  return request.get('/user/detail');
}
//搜索歌曲
export const searchMusic = (keywords,page,pagesize)=>{
  return request.get('/search', { params: { keywords,page, pagesize } });
}

//领取一天vip
export const getVip = ()=>{
  return request.get('/youth/day/vip');
}
//获取vip状态
export const getVipStatus = ()=>{
  return request.get('/user/vip/detail');
}
//获取用户歌单
export const getUserPlayList = (page,pagesize)=>{
  return request.get('/user/playlist',{params: {page, pagesize }});
}
//获取歌单详情
// export const getPlayListDetail = (ids)=>{
//   return request.get('/playlist/detail', { params: { ids } });
// }
//获取歌单歌曲
export const getPlayListSong = (id,page, pagesize)=>{
  return request.get('/playlist/track/all', { params: { id,page, pagesize } });
}
