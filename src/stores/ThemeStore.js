import { defineStore } from 'pinia'
import { ref } from 'vue'
import ColorThief from 'color-thief-browser'
import { argbFromRgb, themeFromSourceColor, hexFromArgb } from '@material/material-color-utilities'

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
    const extractColorFromImage = async (imageUrl) => {
      if (!imageUrl) {
        console.warn('未提供图片 URL，无法提取颜色。')
        return
      }
      try {
        const img = new Image()
        img.crossOrigin = 'Anonymous' // 解决跨域问题
        img.src = imageUrl
        img.onload = () => {
          try {
            const colorThief = new ColorThief()
            const dominantColor = colorThief.getColor(img) // dominantColor 是 [R, G, B] 数组

            // 验证 dominantColor 是否有效
            if (
              !Array.isArray(dominantColor) ||
              dominantColor.length !== 3 ||
              !dominantColor.every((c) => typeof c === 'number' && c >= 0 && c <= 255)
            ) {
              throw new Error('ColorThief 提取的颜色无效。')
            }

            setAlbumCoverColor(dominantColor) // 设置专辑封面提取的颜色

            // 使用提取的颜色作为 Material You 的种子颜色
            const argbColor = argbFromRgb(dominantColor[0], dominantColor[1], dominantColor[2])
            const theme = themeFromSourceColor(argbColor)

            // 将 Material You 生成的主色调设置为 materialYouColor
            // 这里我们使用 primary 颜色作为 Material You 的主色调
            const primaryArgb = theme.schemes.light.primary
            console.log('Material You primary ARGB:', primaryArgb) // 添加日志
            const primaryColorHex = hexFromArgb(primaryArgb)
            // 将十六进制颜色转换为 RGB 数组
            const r = parseInt(primaryColorHex.slice(1, 3), 16)
            const g = parseInt(primaryColorHex.slice(3, 5), 16)
            const b = parseInt(primaryColorHex.slice(5, 7), 16)
            setMaterialYouColor([r, g, b])

            console.log('从封面提取颜色并生成 Material You 主题:', dominantColor, [r, g, b])
          } catch (error) {
            console.error('ColorThief 提取颜色或 Material You 生成失败:', error)
            console.error('错误详情:', error) // 打印完整错误对象
            // 提取失败时，设置一个默认颜色
            setAlbumCoverColor([255, 255, 255])
            setMaterialYouColor([64, 158, 255]) // 恢复 Material You 默认色
          }
        }
        img.onerror = (error) => {
          console.error('图片加载失败，无法提取颜色:', error)
          console.error('错误详情:', error) // 打印完整错误对象
          // 图片加载失败时，设置一个默认颜色
          setAlbumCoverColor([255, 255, 255])
          setMaterialYouColor([64, 158, 255]) // 恢复 Material You 默认色
        }
      } catch (error) {
        console.error('提取颜色过程中发生错误:', error)
        console.error('错误详情:', error) // 打印完整错误对象
        setAlbumCoverColor([255, 255, 255])
        setMaterialYouColor([64, 158, 255]) // 恢复 Material You 默认色
      }
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
