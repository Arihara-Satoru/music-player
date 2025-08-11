import { defineStore } from 'pinia'
import { ref } from 'vue'
// import { argbFromRgb, themeFromSourceColor, hexFromArgb } from '@material/material-color-utilities' // 暂时注释，如果 Material You 动态配色功能需要，再启用

/**
 * @module useThemeStore
 * @description Pinia Store 用于管理应用程序的主题配色方案。
 * 支持 Material You 动态配色和从歌曲封面提取颜色两种模式。
 */
export const useThemeStore = defineStore(
  'Theme',
  () => {
    // 当前主题模式：'material_you' 或 'album_cover'
    const themeMode = ref('material_you') // 默认使用 Material You
    // 从歌曲封面提取的主色调（RGB 数组）
    const albumCoverColor = ref([64, 158, 255]) // 默认蓝色
    // Material You 动态配色（如果集成）
    const materialYouColor = ref([64, 158, 255]) // 默认蓝色

    // 预设的 Material You 配色方案列表
    const materialYouPalettes = ref([
      { name: '默认蓝', color: [64, 158, 255] },
      { name: '活力橙', color: [255, 152, 0] },
      { name: '清新绿', color: [76, 175, 80] },
      { name: '优雅紫', color: [156, 39, 176] },
      { name: '热情红', color: [244, 67, 54] },
    ])

    /**
     * @function setThemeMode
     * @param {string} mode - 主题模式，可以是 'material_you' 或 'album_cover'。
     * @description 设置当前的主题模式。
     */
    const setThemeMode = (mode) => {
      if (['material_you', 'album_cover'].includes(mode)) {
        themeMode.value = mode
        console.log('主题模式已设置为:', mode)
      } else {
        console.warn('无效的主题模式:', mode)
      }
    }

    /**
     * @function setMaterialYouColor
     * @param {Array<number>} color - Material You 的 RGB 颜色数组，例如 [R, G, B]。
     * @description 设置 Material You 的主色调。
     */
    const setMaterialYouColor = (color) => {
      if (
        Array.isArray(color) &&
        color.length === 3 &&
        color.every((c) => typeof c === 'number' && c >= 0 && c <= 255)
      ) {
        materialYouColor.value = color
        console.log('Material You 颜色已更新:', color)
      } else {
        console.warn('无效的 Material You 颜色:', color)
      }
    }

    /**
     * @function setAlbumCoverColor
     * @param {Array<number>} color - 从歌曲封面提取的 RGB 颜色数组，例如 [R, G, B]。
     * @description 设置从歌曲封面提取的主色调。
     */
    const setAlbumCoverColor = (color) => {
      if (
        Array.isArray(color) &&
        color.length === 3 &&
        color.every((c) => typeof c === 'number' && c >= 0 && c <= 255)
      ) {
        albumCoverColor.value = color
        console.log('歌曲封面颜色已更新:', color)
      } else {
        console.warn('无效的歌曲封面颜色:', color)
      }
    }

    /**
     * @function extractColorFromImage
     * @param {string} imageUrl - 歌曲封面的 URL。
     * @description 从给定的图片 URL 中提取主色调，并更新 albumCoverColor。
     * 使用 ColorThief 库进行颜色提取。
     */
    const extractColorFromImage = async () => {
      // 移除 imageUrl 参数
      console.warn('图片颜色提取功能已禁用。')
      // 无论如何都设置一个默认颜色，以确保主题颜色不会缺失
      setAlbumCoverColor([255, 255, 255]) // 默认白色
      setMaterialYouColor([64, 158, 255]) // 恢复 Material You 默认蓝色
    }

    return {
      themeMode,
      albumCoverColor,
      materialYouColor,
      setThemeMode,
      setAlbumCoverColor,
      extractColorFromImage,
      materialYouPalettes, // 暴露预设配色列表
      setMaterialYouColor, // 暴露设置 Material You 颜色的方法
    }
  },
  {
    // 启用 Pinia 持久化插件，将 store 状态存储在本地
    persist: true,
  },
)
