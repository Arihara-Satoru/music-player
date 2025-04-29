<script setup>
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';

const router = useRouter();

const emit = defineEmits(['update:modelValue']);
const props = defineProps({
  playlistCount: {
    type: Number,
    default: 0
  },
  pageSize: {
    type: Number,
    default: 15
  },
  page: {
    type: Number,
    default: 1
  }
});

const currentpage = ref(props.page);

const handlePageChange = (newPage) => {
  emit('update:modelValue', newPage);
  currentpage.value = newPage;
  router.push({ query: { page: currentpage.value } });
  console.log('当前页码：', newPage);
};
</script>

<template>
  <div class="example-pagination-block">
    <el-pagination layout="prev, pager, next"
      :total="playlistCount"
      :page-size="pageSize"
      :current-page="currentpage"
      @current-change="handlePageChange" />
  </div>
</template>

<style scoped lang="scss">
.example-pagination-block {
  width: 100%;
  margin: 10px;
  display: flex;
  text-align: center;
  justify-content: center;
}

.el-pagination {
  margin-bottom: 16px;
}
</style>
