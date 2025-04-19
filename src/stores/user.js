import {defineStore} from 'pinia';
import {ref} from 'vue';

export const useUserStore = defineStore('user', () => {
  const userId= ref('');
  const token = ref('');
  const setUserId = (data) => {
    userId.value = data;
  };
  const setToken = (data) => {
    token.value = data;
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

  return {token, userId,setUserId, setToken, getToken, removeToken,removeUserId};
},
{
  persist: true, // 启用持久化
});
