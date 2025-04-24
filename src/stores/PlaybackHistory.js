import {defineStore} from 'pinia';
import {ref} from 'vue';

export const usePlayStore = defineStore('PlayHistory', () => {
  const playHistory = ref([]);
  const setPlayHistory = (data) => {
    playHistory.value = data;
  };
  return { playHistory, setPlayHistory };
},
{
  persist: true, // 启用持久化
});

