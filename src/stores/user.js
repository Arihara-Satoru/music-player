import {defineStore} from 'pinia';
import {ref} from 'vue';

export const useUserStore = defineStore('user', () => {
  const userId= ref('');
  const token = ref('');
  const userPicUrl = ref('');
  const setUserId = (data) => {
    userId.value = data;
  };
  const setToken = (data) => {
    token.value = data;
  };

  const setUserPicUrl = (url) => {
    userPicUrl.value = url;
  };

  const getToken = () => {
    return token.value;
  };

  const removeToken = () => {
    token.value = '';
  };

  const removeUserId = () => {
    userId.value = '';
  };

  const removeUserPicUrl = () => {
    userPicUrl.value = '';
  };

  return {token,
    userId,
    userPicUrl,
    setUserPicUrl,
    setUserId,
    setToken,
    getToken,
    removeToken,
    removeUserPicUrl,
    removeUserId};
},
{
  persist: true, // 启用持久化
});
