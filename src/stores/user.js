import {defineStore} from 'pinia';
import {ref} from 'vue';

export const useUserStore = defineStore('user', () => {
  const token = ref('');
  const setToken = (data) => {
    token.value = data;
  };

  const getToken = () => {
    return token.value;
  };

  const removeToken = () => {
    token.value = '';
  };

  return {token, setToken, getToken, removeToken};
},
{
  persist: true, // 启用持久化
});
