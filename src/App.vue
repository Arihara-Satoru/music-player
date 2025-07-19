<script setup>
import { watch, onMounted } from 'vue'
import { useThemeStore } from '@/stores/ThemeStore'
import { argbFromRgb, themeFromSourceColor, rgbaFromArgb } from '@material/material-color-utilities'

const themeStore = useThemeStore()

/**
 * @function updateThemeColors
 * @description 根据当前主题模式和颜色，动态更新 CSS 变量。
 * 如果是 Material You 模式，使用 materialYouColor 生成主题。
 * 如果是专辑封面取色模式，使用 albumCoverColor 作为种子生成主题。
 */
const updateThemeColors = () => {
  let sourceColorRgb = [64, 158, 255] // 默认颜色

  if (themeStore.themeMode === 'material_you') {
    sourceColorRgb = themeStore.materialYouColor
  } else if (themeStore.themeMode === 'album_cover') {
    sourceColorRgb = themeStore.albumCoverColor
  }

  // 将 RGB 转换为 ARGB
  const argbColor = argbFromRgb(sourceColorRgb[0], sourceColorRgb[1], sourceColorRgb[2])
  // 从源颜色生成 Material You 主题
  const theme = themeFromSourceColor(argbColor)

  // 获取亮色方案的颜色
  const lightScheme = theme.schemes.light

  // 设置 CSS 变量
  const root = document.documentElement

  // 主色调
  const primaryRgbString = `rgb(${sourceColorRgb.join(',')})`
  root.style.setProperty('--color-primary', primaryRgbString)
  root.style.setProperty('--color-primary-rgb', `${sourceColorRgb.join(',')}`)
  console.log('App.vue: --color-primary:', primaryRgbString) // Debug log

  // Material You 调色板颜色
  // 示例：primary, secondary, tertiary, neutral, neutral-variant
  // 你可以根据需要添加更多 Material You 颜色
  // 辅助函数：将 RGBA 对象转换为 CSS rgba() 字符串
  const toRgbaString = (colorObj) => {
    if (!colorObj || typeof colorObj.r === 'undefined') {
      console.warn('Invalid color object:', colorObj)
      return 'rgba(0, 0, 0, 0)' // 返回一个默认透明色
    }
    return `rgba(${colorObj.r}, ${colorObj.g}, ${colorObj.b}, ${colorObj.a / 255})`
  }

  root.style.setProperty('--md-sys-color-primary', toRgbaString(rgbaFromArgb(lightScheme.primary)))
  root.style.setProperty(
    '--md-sys-color-on-primary',
    toRgbaString(rgbaFromArgb(lightScheme.onPrimary)),
  )
  root.style.setProperty(
    '--md-sys-color-primary-container',
    toRgbaString(rgbaFromArgb(lightScheme.primaryContainer)),
  )
  root.style.setProperty(
    '--md-sys-color-on-primary-container',
    toRgbaString(rgbaFromArgb(lightScheme.onPrimaryContainer)),
  )

  root.style.setProperty(
    '--md-sys-color-secondary',
    toRgbaString(rgbaFromArgb(lightScheme.secondary)),
  )
  root.style.setProperty(
    '--md-sys-color-on-secondary',
    toRgbaString(rgbaFromArgb(lightScheme.onSecondary)),
  )
  root.style.setProperty(
    '--md-sys-color-secondary-container',
    toRgbaString(rgbaFromArgb(lightScheme.secondaryContainer)),
  )
  root.style.setProperty(
    '--md-sys-color-on-secondary-container',
    toRgbaString(rgbaFromArgb(lightScheme.onSecondaryContainer)),
  )

  root.style.setProperty(
    '--md-sys-color-tertiary',
    toRgbaString(rgbaFromArgb(lightScheme.tertiary)),
  )
  root.style.setProperty(
    '--md-sys-color-on-tertiary',
    toRgbaString(rgbaFromArgb(lightScheme.onTertiary)),
  )
  root.style.setProperty(
    '--md-sys-color-tertiary-container',
    toRgbaString(rgbaFromArgb(lightScheme.tertiaryContainer)),
  )
  root.style.setProperty(
    '--md-sys-color-on-tertiary-container',
    toRgbaString(rgbaFromArgb(lightScheme.onTertiaryContainer)),
  )

  root.style.setProperty('--md-sys-color-error', toRgbaString(rgbaFromArgb(lightScheme.error)))
  root.style.setProperty('--md-sys-color-on-error', toRgbaString(rgbaFromArgb(lightScheme.onError)))
  root.style.setProperty(
    '--md-sys-color-error-container',
    toRgbaString(rgbaFromArgb(lightScheme.errorContainer)),
  )
  root.style.setProperty(
    '--md-sys-color-on-error-container',
    toRgbaString(rgbaFromArgb(lightScheme.onErrorContainer)),
  )

  const mdSysColorBackground = rgbaFromArgb(lightScheme.background)
  root.style.setProperty('--md-sys-color-background', toRgbaString(mdSysColorBackground))
  console.log('App.vue: --md-sys-color-background:', toRgbaString(mdSysColorBackground)) // Debug log

  root.style.setProperty(
    '--md-sys-color-on-background',
    toRgbaString(rgbaFromArgb(lightScheme.onBackground)),
  )
  root.style.setProperty('--md-sys-color-surface', toRgbaString(rgbaFromArgb(lightScheme.surface)))
  root.style.setProperty(
    '--md-sys-color-on-surface',
    toRgbaString(rgbaFromArgb(lightScheme.onSurface)),
  )
  root.style.setProperty(
    '--md-sys-color-surface-variant',
    toRgbaString(rgbaFromArgb(lightScheme.surfaceVariant)),
  )
  root.style.setProperty(
    '--md-sys-color-on-surface-variant',
    toRgbaString(rgbaFromArgb(lightScheme.onSurfaceVariant)),
  )
  root.style.setProperty('--md-sys-color-outline', toRgbaString(rgbaFromArgb(lightScheme.outline)))
  root.style.setProperty('--md-sys-color-shadow', toRgbaString(rgbaFromArgb(lightScheme.shadow)))
  root.style.setProperty(
    '--md-sys-color-inverse-surface',
    toRgbaString(rgbaFromArgb(lightScheme.inverseSurface)),
  )
  root.style.setProperty(
    '--md-sys-color-inverse-on-surface',
    toRgbaString(rgbaFromArgb(lightScheme.inverseOnSurface)),
  )
  root.style.setProperty(
    '--md-sys-color-inverse-primary',
    toRgbaString(rgbaFromArgb(lightScheme.inversePrimary)),
  )
  root.style.setProperty(
    '--md-sys-color-surface-tint',
    toRgbaString(rgbaFromArgb(lightScheme.surfaceTint)),
  )
  root.style.setProperty(
    '--md-sys-color-outline-variant',
    toRgbaString(rgbaFromArgb(lightScheme.outlineVariant)),
  )
  root.style.setProperty('--md-sys-color-scrim', toRgbaString(rgbaFromArgb(lightScheme.scrim)))
}

// 监听主题模式和颜色变化，动态更新主题
watch(
  () => themeStore.themeMode,
  () => updateThemeColors(),
)
watch(
  () => themeStore.materialYouColor,
  () => updateThemeColors(),
)
watch(
  () => themeStore.albumCoverColor,
  () => updateThemeColors(),
)

// 组件挂载时初始化主题颜色
onMounted(() => {
  updateThemeColors()
})
</script>

<template>
  <router-view></router-view>
</template>

<style>
/* 全局 CSS 变量定义，作为回退或默认值 */
:root {
  --color-primary: 64, 158, 255; /* 默认主色调 RGB */
  --color-primary-rgb: 64, 158, 255; /* 默认主色调 RGB */

  /* Material You 默认颜色变量 */
  --md-sys-color-primary: #409eff;
  --md-sys-color-on-primary: #ffffff;
  --md-sys-color-primary-container: #d0e4ff;
  --md-sys-color-on-primary-container: #001c3b;

  --md-sys-color-secondary: #535f70;
  --md-sys-color-on-secondary: #ffffff;
  --md-sys-color-secondary-container: #d7e3f8;
  --md-sys-color-on-secondary-container: #101c2b;

  --md-sys-color-tertiary: #6b5778;
  --md-sys-color-on-tertiary: #ffffff;
  --md-sys-color-tertiary-container: #f3daff;
  --md-sys-color-on-tertiary-container: #251431;

  --md-sys-color-error: #ba1a1a;
  --md-sys-color-on-error: #ffffff;
  --md-sys-color-error-container: #ffdad6;
  --md-sys-color-on-error-container: #410002;

  --md-sys-color-background: #fcfcff;
  --md-sys-color-on-background: #1a1c1e;
  --md-sys-color-surface: #fcfcff;
  --md-sys-color-on-surface: #1a1c1e;
  --md-sys-color-surface-variant: #dfe2eb;
  --md-sys-color-on-surface-variant: #43474e;
  --md-sys-color-outline: #73777f;
  --md-sys-color-shadow: #000000;
  --md-sys-color-inverse-surface: #2f3033;
  --md-sys-color-inverse-on-surface: #f1f0f4;
  --md-sys-color-inverse-primary: #9ecaff;
  --md-sys-color-surface-tint: #0061a4;
  --md-sys-color-outline-variant: #c3c7cf;
  --md-sys-color-scrim: #000000;
}

/* 确保所有元素都继承这些变量 */
body {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  background-color: var(--md-sys-color-background);
  color: var(--md-sys-color-on-background);
}

/* 示例：Element Plus 主题色变量覆盖 */
/* 确保 Element Plus 组件也能响应主题变化 */
:root {
  --el-color-primary: var(--md-sys-color-primary);
  --el-color-primary-light-3: var(--md-sys-color-primary-container);
  --el-color-primary-light-5: var(--md-sys-color-primary-container);
  --el-color-primary-light-7: var(--md-sys-color-primary-container);
  --el-color-primary-light-8: var(--md-sys-color-primary-container);
  --el-color-primary-light-9: var(--md-sys-color-primary-container);
  --el-color-primary-dark-2: var(--md-sys-color-on-primary-container);

  --el-fill-color-blank: var(--md-sys-color-surface);
  --el-text-color-primary: var(--md-sys-color-on-surface);
  --el-text-color-regular: var(--md-sys-color-on-surface-variant);
  --el-border-color: var(--md-sys-color-outline-variant);
  --el-bg-color: var(--md-sys-color-background);
  --el-bg-color-overlay: var(--md-sys-color-surface);
}
</style>
