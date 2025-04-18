import request from '@/utils/request';

// 获取手机验证码
export const getPhoneCode = (mobile) => {
  return request.get('/captcha/sent', { params: { mobile } });
};

// 登录
export const login = ({ mobile, code }) => {
  return request.get('/login/cellphone', { params: { mobile, code } });
};
