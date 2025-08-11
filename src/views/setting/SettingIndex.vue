<template>
  <div class="setting-container">
    <h1 class="page-title">设置</h1>

    <!-- 主题配色设置 -->
    <section class="setting-section">
      <h2 class="section-title">主题与外观</h2>
      <div class="setting-item">
        <label class="setting-label">选择主题模式：</label>
        <div class="setting-content">
          <!-- Element Plus 单选按钮组，绑定到 themeStore.themeMode -->
          <el-radio-group v-model="themeStore.themeMode">
            <el-radio label="material_you">Material You 动态配色</el-radio>
            <el-radio label="album_cover">歌曲封面取色</el-radio>
          </el-radio-group>
        </div>
      </div>

      <!-- Material You 配色选择区域，仅在 themeMode 为 'material_you' 时显示 -->
      <div
        v-if="themeStore.themeMode === 'material_you'"
        class="setting-item color-palette-selection"
      >
        <label class="setting-label">选择 Material You 配色：</label>
        <div class="setting-content color-palette-list">
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

    <!-- 播放设置占位符 -->
    <section class="setting-section">
      <h2 class="section-title">播放设置</h2>
      <div class="setting-item">
        <label class="setting-label">默认播放音质：</label>
        <div class="setting-content">
          <el-select placeholder="请选择音质">
            <el-option label="标准音质" value="standard"></el-option>
            <el-option label="高品质" value="high"></el-option>
            <el-option label="无损音质" value="lossless"></el-option>
          </el-select>
        </div>
      </div>
      <div class="setting-item">
        <label class="setting-label">自动播放下一首：</label>
        <div class="setting-content">
          <el-switch></el-switch>
        </div>
      </div>
    </section>

    <!-- 通知设置占位符 -->
    <section class="setting-section">
      <h2 class="section-title">通知设置</h2>
      <div class="setting-item">
        <label class="setting-label">新消息通知：</label>
        <div class="setting-content">
          <el-switch></el-switch>
        </div>
      </div>
      <div class="setting-item">
        <label class="setting-label">更新提醒：</label>
        <div class="setting-content">
          <el-switch></el-switch>
        </div>
      </div>
    </section>

    <!-- 关于我们占位符 -->
    <section class="setting-section">
      <h2 class="section-title">关于</h2>
      <div class="setting-item">
        <label class="setting-label">版本信息：</label>
        <div class="setting-content">
          <span>V1.0.0</span>
        </div>
      </div>
      <div class="setting-item">
        <label class="setting-label">检查更新：</label>
        <div class="setting-content">
          <el-button type="primary" size="small">检查更新</el-button>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { useThemeStore } from '@/stores/ThemeStore' // 引入 ThemeStore
import { ElRadioGroup, ElRadio, ElSelect, ElOption, ElSwitch, ElButton } from 'element-plus' // 引入 Element Plus 组件

// 获取 ThemeStore 实例，用于访问和修改主题相关的状态
const themeStore = useThemeStore()
</script>

<style scoped>
.setting-container {
  padding: 30px; /* 增加内边距 */
  max-width: 900px; /* 增加最大宽度 */
  margin: 0 auto;
  background-color: #f5f7fa; /* 轻微的背景色 */
  min-height: calc(100vh - var(--header-height, 60px) - var(--footer-height, 80px));
}

.page-title {
  font-size: 2.5em;
  color: #2c3e50;
  margin-bottom: 40px; /* 增加底部外边距 */
  text-align: center;
  font-weight: bold;
  letter-spacing: 1px;
}

.setting-section {
  background-color: #fff;
  border-radius: 12px; /* 增加圆角 */
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08); /* 增强阴影效果 */
  padding: 30px; /* 增加内边距 */
  margin-bottom: 30px; /* 增加底部外边距 */
}

.section-title {
  font-size: 1.8em;
  color: #34495e;
  margin-bottom: 25px; /* 增加底部外边距 */
  border-bottom: 2px solid #e0e0e0; /* 底部边框更明显 */
  padding-bottom: 15px; /* 增加底部内边距 */
  font-weight: bold;
}

.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between; /* 左右对齐 */
  padding: 15px 0; /* 增加垂直内边距 */
  border-bottom: 1px dashed #eee; /* 虚线分隔 */
}

.setting-item:last-child {
  border-bottom: none; /* 最后一个设置项无底部边框 */
}

.setting-label {
  font-size: 1.1em; /* 字体大小 */
  color: #444; /* 字体颜色 */
  flex-shrink: 0; /* 不收缩 */
  margin-right: 30px; /* 增加右侧外边距 */
  min-width: 150px; /* 确保标签有足够的宽度 */
}

.setting-content {
  flex-grow: 1; /* 占据剩余空间 */
  display: flex;
  align-items: center;
}

/* Element Plus Radio 按钮组的样式调整 */
.el-radio-group {
  display: flex;
  flex-wrap: wrap; /* 允许换行 */
  gap: 20px;
}

/* Element Plus Radio 按钮的自定义样式 */
.el-radio {
  /* 可以根据项目设计需求，在这里添加或覆盖 Element Plus Radio 的默认样式 */
}

/* Material You 配色选择区域的样式 */
.color-palette-selection {
  margin-top: 25px; /* 增加顶部外边距 */
  flex-wrap: wrap;
}

.color-palette-list {
  display: flex;
  gap: 12px; /* 增加色块间距 */
  flex-wrap: wrap;
}

.color-box {
  width: 45px; /* 增加色块宽度 */
  height: 45px; /* 增加色块高度 */
  border-radius: 50%;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    border-color 0.2s ease,
    box-shadow 0.2s ease;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.12); /* 增强阴影 */
  border: 2px solid transparent; /* 默认透明边框 */
}

.color-box:hover {
  transform: scale(1.15); /* 鼠标悬停时放大更多 */
}

/* 选中色块的样式 */
.color-box[style*='border: 2px solid var(--el-color-primary)'] {
  border-color: var(--el-color-primary); /* 选中时边框颜色 */
  box-shadow: 0 0 0 4px rgba(var(--el-color-primary-rgb), 0.4); /* 选中时额外阴影 */
}

/* 响应式调整 */
@media (max-width: 768px) {
  .setting-container {
    padding: 20px;
  }

  .setting-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .setting-label {
    margin-right: 0;
    margin-bottom: 5px;
    min-width: unset;
  }

  .setting-content {
    width: 100%;
    justify-content: flex-start;
  }

  .el-radio-group {
    flex-direction: column;
    gap: 10px;
  }
}
</style>
