import {defineStore} from 'pinia';
import {ref} from 'vue';

export const useUserStore = defineStore('user', () => {
  const userId= ref('');
  const token = ref('');
  const userPicUrl = ref('');
  const userName = ref('');
  const setUserId = (data) => {
    userId.value = data;
  };
  const setToken = (data) => {
    token.value = data;
  };

  const setUserName = (data) => {
    userName.value = data;
  };

  const setUserPicUrl = (url) => {
    userPicUrl.value = url;
  };

  const removeToken = () => {
    token.value = '';
  };

  const removeUserId = () => {
    userId.value = '';
  };

  const removeUserName = () => {
    userName.value = '';
  };

  const removeUserPicUrl = () => {
    userPicUrl.value = '';
  };

  return {
    token,
    userId,
    userPicUrl,
    userName,
    setUserPicUrl,
    setUserId,
    setToken,
    setUserName,
    removeToken,
    removeUserPicUrl,
    removeUserId,
    removeUserName,
  };
},
{
  persist: true, // 启用持久化
});
