<template>
  <div class="setting-container">
    <h1>设置</h1>

    <section class="setting-section">
      <h2>主题配色</h2>
      <div class="setting-item">
        <label>选择主题模式：</label>
        <!-- Element Plus 单选按钮组，绑定到 themeStore.themeMode -->
        <el-radio-group v-model="themeStore.themeMode">
          <el-radio label="material_you">Material You 动态配色</el-radio>
          <el-radio label="album_cover">歌曲封面取色</el-radio>
        </el-radio-group>
      </div>

      <!-- Material You 配色选择区域，仅在 themeMode 为 'material_you' 时显示 -->
      <div
        v-if="themeStore.themeMode === 'material_you'"
        class="setting-item color-palette-selection"
      >
        <label>选择 Material You 配色：</label>
        <div class="color-palette-list">
          <div
            v-for="palette in themeStore.materialYouPalettes"
            :key="palette.name"
            class="color-box"
            :style="{
              backgroundColor: `rgb(${palette.color.join(',')})`,
              border:
                themeStore.materialYouColor.join(',') === palette.color.join(',')
                  ? '2px solid var(--el-color-primary)'
                  : '1px solid #ccc',
            }"
            @click="themeStore.setMaterialYouColor(palette.color)"
            :title="palette.name"
          ></div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { useThemeStore } from '@/stores/ThemeStore' // 引入 ThemeStore

// 获取 ThemeStore 实例，用于访问和修改主题相关的状态
const themeStore = useThemeStore()
</script>

<style scoped>
/* 设置页面容器的整体样式 */
.setting-container {
  padding: 20px; /* 内边距 */
  max-width: 800px; /* 最大宽度 */
  margin: 0 auto; /* 水平居中 */
}

/* 页面主标题样式 */
h1 {
  font-size: 28px; /* 字体大小 */
  color: #333; /* 字体颜色 */
  margin-bottom: 30px; /* 底部外边距 */
  text-align: center; /* 文本居中 */
}

/* 设置部分的通用样式 */
.setting-section {
  background-color: #fff; /* 背景色 */
  border-radius: 8px; /* 圆角 */
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05); /* 阴影效果 */
  padding: 25px; /* 内边距 */
  margin-bottom: 20px; /* 底部外边距 */
}

/* 设置部分标题样式 */
.setting-section h2 {
  font-size: 22px; /* 字体大小 */
  color: #555; /* 字体颜色 */
  margin-bottom: 20px; /* 底部外边距 */
  border-bottom: 1px solid #eee; /* 底部边框 */
  padding-bottom: 10px; /* 底部内边距 */
}

/* 单个设置项的布局 */
.setting-item {
  display: flex; /* Flex 布局 */
  align-items: center; /* 垂直居中对齐 */
  margin-bottom: 15px; /* 底部外边距 */
}

/* 设置项标签的样式 */
.setting-item label {
  font-size: 16px; /* 字体大小 */
  color: #666; /* 字体颜色 */
  margin-right: 20px; /* 右侧外边距 */
  min-width: 120px; /* 确保标签有足够的宽度，防止内容过长时布局混乱 */
}

/* Element Plus Radio 按钮组的样式调整 */
.el-radio-group {
  display: flex; /* Flex 布局 */
  gap: 20px; /* 元素间距 */
}

/* Element Plus Radio 按钮的自定义样式（如果需要） */
.el-radio {
  /* 可以根据项目设计需求，在这里添加或覆盖 Element Plus Radio 的默认样式 */
}

/* Material You 配色选择区域的样式 */
.color-palette-selection {
  margin-top: 20px; /* 顶部外边距 */
  flex-wrap: wrap; /* 允许换行 */
}

.color-palette-list {
  display: flex; /* Flex 布局 */
  gap: 10px; /* 色块间距 */
  flex-wrap: wrap; /* 允许换行 */
}

.color-box {
  width: 40px; /* 色块宽度 */
  height: 40px; /* 色块高度 */
  border-radius: 50%; /* 圆形 */
  cursor: pointer; /* 鼠标指针样式 */
  transition:
    transform 0.2s ease,
    border-color 0.2s ease; /* 过渡效果 */
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1); /* 阴影 */
  border: 1px solid #ccc; /* 默认边框 */
}

.color-box:hover {
  transform: scale(1.1); /* 鼠标悬停时放大 */
}

/* 选中色块的样式 */
.color-box.selected {
  border: 2px solid var(--el-color-primary); /* 选中时边框颜色 */
  box-shadow: 0 0 0 3px rgba(var(--el-color-primary-rgb), 0.3); /* 选中时额外阴影 */
}
</style>
