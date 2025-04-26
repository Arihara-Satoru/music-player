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
//刷新token
export const refreshToken = (token ,userid)=>{
  return request.get('/login/token', { params: { token, userid } });
}
//获取歌单歌曲
export const getPlayListSong = (id,page, pagesize)=>{
  return request.get('/playlist/track/all', { params: { id,page, pagesize } });
}
//判断接口是否健康
export const checkHealth = ()=>{
  return request.get('/health');
}
