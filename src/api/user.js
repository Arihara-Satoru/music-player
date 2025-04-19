import request from '@/utils/request';

export const userInfo = ()=>{
  return request.get('/user/detail');
}

export const searchMusic = (keywords)=>{
  return request.get('/search', { params: { keywords } });
}

//领取一天vip
export const getVip = ()=>{
  return request.get('/youth/day/vip');
}
//获取vip状态
export const getVipStatus = ()=>{
  return request.get('/user/vip/detail');
}
