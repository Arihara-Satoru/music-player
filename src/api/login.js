import request from '@/utils/request';

// 获取手机验证码
export const getPhoneCode = (mobile) => {
  return request.get('/captcha/sent', { params: { mobile } });
};

// 验证码登录
export const login = ({ mobile, code }) => {
  return request.get('/login/cellphone', { params: { mobile, code } });
};

//账号密码登录
export const loginPwd = ({ username, password }) => {
  return request.get('/login', { params: { username, password } });
};

//微信扫码登录
export const loginWx = (code) => {
  return request.get('/login/openplat', {
    params: { code }
  });
};

// 生成微信登录二维码
export const createWxLoginQR = () => {
  return request.get('/login/wx/create', {
    params: {
      timestamp: Date.now() // 带上时间戳防止缓存
    }
  })
}

// 检查微信登录状态
export const checkWxLoginStatus = (uuid) => {
  return request.get('/login/wx/check', {
    params: {
      uuid,
      timestamp: Date.now() // 带上时间戳防止缓存
    }
  })
}

// 生成二维码key
export const generateQRKey = () => {
  return request.get('/login/qr/key', {
    params: {
      timestamp: Date.now()
    }
  })
}

// 生成二维码
export const generateQRCode = (key, qrimg = true) => {
  return request.get('/login/qr/create', {
    params: {
      key,
      qrimg,
      timestamp: Date.now()
    }
  })
}

// 检查二维码状态
export const checkQRStatus = (key) => {
  return request.get('/login/qr/check', {
    params: {
      key,
      timestamp: Date.now()
    }
  })
}
