import { defineStore } from 'pinia'
import { ref } from 'vue'
import ColorThief from 'color-thief-browser'

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
    const albumCoverColor = ref([255, 255, 255]) // 默认白色
    // Material You 动态配色（如果集成）
    const materialYouColor = ref([64, 158, 255]) // 默认蓝色

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
            const dominantColor = colorThief.getColor(img)
            setAlbumCoverColor(dominantColor)
          } catch (error) {
            console.error('ColorThief 提取颜色失败:', error)
            // 提取失败时，可以设置一个默认颜色
            setAlbumCoverColor([255, 255, 255])
          }
        }
        img.onerror = (error) => {
          console.error('图片加载失败，无法提取颜色:', error)
          // 图片加载失败时，可以设置一个默认颜色
          setAlbumCoverColor([255, 255, 255])
        }
      } catch (error) {
        console.error('提取颜色过程中发生错误:', error)
        setAlbumCoverColor([255, 255, 255])
      }
    }

    return {
      themeMode,
      albumCoverColor,
      materialYouColor,
      setThemeMode,
      setAlbumCoverColor,
      extractColorFromImage,
    }
  },
  {
    // 启用 Pinia 持久化插件，将 store 状态存储在本地
    persist: true,
  },
)
