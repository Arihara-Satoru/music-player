import request from '@/utils/request'
//获取推荐音乐
export const getRecommandMusic = () => {
  return request.get('/top/card', { params: { card_id:1 } })
}
