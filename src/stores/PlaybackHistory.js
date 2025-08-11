import { defineStore } from 'pinia'
import { ref, onMounted, watch } from 'vue'
import { getMusicDetail, searchLyric, getLyric, playSong as playSongApi } from '@/api/PlaySong'
import { useThemeStore } from '@/stores/ThemeStore' // 引入 ThemeStore
import { ElMessage } from 'element-plus' // 引入 Element Plus 的消息提示组件

/**
 * @module usePlayStore
 * @description Pinia Store 用于管理音乐播放器的全局状态和逻辑。
 * 确保 audioPlayer 实例在整个应用生命周期中持久化，解决页面跳转时音乐停止和播放器未初始化的问题。
 */
export const usePlayStore = defineStore(
  'PlayHistory',
  () => {
    // 播放列表：存储当前播放队列中的歌曲详细信息
    const MusicList = ref([])
    // 音乐ID（可能用于加载更多歌曲，当前未启用）
    const musicIds = ref(0)
    // 当前页码（可能用于分页加载，当前未启用）
    const page = ref(1)
    // 当前播放歌曲的哈希值，用于唯一标识歌曲
    const currentHash = ref('')
    // 当前播放时间（秒）
    const currentTime = ref(0)
    // 当前歌曲总时长（秒）
    const duration = ref(0)
    // 播放状态：true 为播放中，false 为暂停
    const isPlaying = ref(false)
    // HTML Audio 元素实例，用于实际的音频播放
    const audioPlayer = ref(null)
    // 播放列表中的总歌曲数（可能用于分页，当前未启用）
    const totalMusic = ref(0)
    // 当前播放歌曲的详细信息（名称、艺术家、封面、URL）
    const currentSongInfo = ref({
      name: '',
      artist: '',
      cover: '',
      url: '',
    })

    // 获取 ThemeStore 实例
    const themeStore = useThemeStore()

    /**
     * @function watchAudioPlayer
     * @description 监听 audioPlayer 实例的变化，用于调试和状态同步。
     * 当 audioPlayer 实例被创建或更新时，会打印相应的日志。
     */
    watch(audioPlayer, (newVal, oldVal) => {
      console.log('audioPlayer 实例变化:', { oldVal, newVal })
      if (newVal) {
        console.log('新的 audioPlayer 实例已创建或更新。')
      } else {
        console.log('audioPlayer 实例被设置为 null。')
      }
    })

    /**
     * @function initAudioPlayer
     * @description 初始化 HTML Audio 播放器实例，并绑定各种事件监听器。
     * 这些事件监听器用于更新播放进度、时长、处理播放结束和错误等。
     * 该函数在 store 挂载时调用一次，确保播放器实例的单例性。
     */
    const initAudioPlayer = () => {
      console.log('--- initAudioPlayer 被调用 ---')
      // 创建 Audio 实例并赋值给 audioPlayer ref
      audioPlayer.value = new Audio()
      console.log('音频播放器已初始化')

      // 监听时间更新事件，同步 currentTime
      audioPlayer.value.addEventListener('timeupdate', () => {
        currentTime.value = audioPlayer.value.currentTime
      })

      // 监听时长变化事件，同步 duration
      audioPlayer.value.addEventListener('durationchange', () => {
        duration.value = audioPlayer.value.duration || 0
        console.log('时长变化:', duration.value)
      })

      // 监听元数据加载完成事件
      audioPlayer.value.addEventListener('loadedmetadata', () => {
        console.log('音频元数据加载完成, readyState:', audioPlayer.value.readyState)
        console.log('音频时长:', audioPlayer.value.duration)
      })

      // 监听可以播放事件
      audioPlayer.value.addEventListener('canplay', () => {
        console.log('音频可以播放')
      })

      // 监听播放结束事件，自动播放下一首
      audioPlayer.value.addEventListener('ended', () => {
        console.log('播放结束')
        playNext()
      })

      // 监听播放错误事件
      audioPlayer.value.addEventListener('error', (e) => {
        console.error('音频播放错误:', e)
        console.error('错误代码:', audioPlayer.value.error.code)
        isPlaying.value = false // 播放出错时将播放状态设为暂停
      })
    }

    // 在 store 挂载时初始化音频播放器
    onMounted(() => {
      initAudioPlayer()
    })

    // 移除 onUnmounted 钩子中的 audioPlayer 销毁逻辑，确保播放器实例在整个应用生命周期中持久化。
    // 这样可以避免在组件卸载时播放器被销毁，导致音乐停止和“audioPlayer 未初始化”的错误。
    // onUnmounted(() => {
    //   if (audioPlayer.value) {
    //     audioPlayer.value.pause()
    //     audioPlayer.value = null
    //   }
    // })

    /**
     * @function setMusicIds
     * @param {number} ids - 音乐ID。
     * @description 设置音乐ID。
     */
    const setMusicIds = (ids) => {
      musicIds.value = ids
    }

    /**
     * @function setPage
     * @param {number} p - 页码。
     * @description 设置当前页码。
     */
    const setPage = (p) => {
      page.value = p
    }

    /**
     * @function setMusicList
     * @description 根据 currentHash 获取音乐详情并更新 MusicList。
     * （当前实现中，此函数似乎未完全实现其预期功能，可能需要进一步完善）
     */
    const setMusicList = async () => {
      try {
        const res = await getMusicDetail(currentHash.value)
        console.log('setMusicList res', res)
      } catch (error) {
        console.error('setMusicList 错误', error)
      }
    }

    /**
     * @function updateCurrentHash
     * @param {string} newHash - 新的歌曲哈希值。
     * @description 根据新的歌曲哈希值获取歌曲URL和歌词，并更新 MusicList 和 currentSongInfo。
     * 获取成功后尝试播放歌曲。
     */
    const updateCurrentHash = async (newHash) => {
      try {
        // 获取歌曲播放URL
        const res = await playSongApi(newHash)
        console.log('playSong res', res)
        if (!res) {
          throw new Error('playSong 返回数据格式不正确')
        }
        // 尝试获取歌曲URL，优先使用 backupUrl，如果不存在则尝试 url 字段
        let songUrl = ''
        if (res.backupUrl && res.backupUrl.length > 0) {
          songUrl = res.backupUrl[0]
        } else if (res.url) {
          // 假设 res 中可能存在一个名为 'url' 的字段
          songUrl = res.url
        }

        if (!songUrl) {
          console.warn('playSong 返回的数据中缺少可用的播放URL (backupUrl 或 url)')
          ElMessage.error('暂无该歌曲版权') // 显示错误提示
          return // 如果没有可用的URL，则直接返回，不进行后续操作
        }

        // 搜索并获取歌词
        const { candidates } = await searchLyric(newHash)
        let decodeContent = ''
        if (candidates?.length > 0) {
          const lyricRes = await getLyric(candidates[0].id, candidates[0].accesskey)
          decodeContent = lyricRes.decodeContent
        }

        // 更新 MusicList 中对应歌曲的 URL 和歌词
        const updatedMusicList = MusicList.value.map((item) => {
          if (item.hash === newHash) {
            return {
              ...item,
              url: songUrl, // 使用获取到的 songUrl
              lrc: decodeContent,
            }
          }
          return item
        })
        MusicList.value = updatedMusicList // 更新 MusicList
        currentHash.value = newHash // 更新当前播放歌曲的哈希

        // 在获取到 URL 后尝试播放歌曲
        const songIndex = MusicList.value.findIndex((item) => item.hash === newHash)
        if (songIndex !== -1) {
          console.log(
            'updateCurrentHash 成功获取URL，尝试自动播放歌曲:',
            MusicList.value[songIndex].name,
          )
          playSong(songIndex) // 尝试播放新获取URL的歌曲
        }
      } catch (error) {
        console.error('获取音乐详情失败', error)
      }
    }

    /**
     * @function setHashList
     * @param {string} hash - 歌曲哈希。
     * @param {string} name - 歌曲名称。
     * @param {string} artist - 艺术家名称。
     * @param {string} cover - 歌曲封面URL。
     * @description 向播放列表 MusicList 中添加一首歌曲，如果该歌曲已存在则不添加。
     */
    const setHashList = (hash, name, artist, cover) => {
      if (!MusicList.value.some((item) => item.hash === hash)) {
        MusicList.value.push({
          hash,
          name,
          artist,
          url: '', // URL 初始为空，需要通过 updateCurrentHash 获取
          cover,
          lrc: '', // 歌词初始为空，需要通过 updateCurrentHash 获取
        })
      }
    }

    /**
     * @function deleteHash
     * @description 清空播放列表 MusicList。
     */
    const deleteHash = () => {
      MusicList.value = []
    }

    /**
     * @function clearPlayList
     * @description 清空播放列表 MusicList。
     * （与 deleteHash 功能重复，可考虑合并或重命名）
     */
    const clearPlayList = () => {
      MusicList.value = []
    }

    /**
     * @function setCurrentTime
     * @param {number} time - 要设置的播放时间（秒）。
     * @description 设置当前播放时间，并更新 audioPlayer 的 currentTime。
     */
    const setCurrentTime = (time) => {
      currentTime.value = time
      if (audioPlayer.value) {
        audioPlayer.value.currentTime = time
      }
    }

    /**
     * @function togglePlay
     * @description 切换播放/暂停状态。
     * 如果 audioPlayer 未初始化，则会打印错误并返回。
     */
    const togglePlay = () => {
      console.log('--- togglePlay 被调用 ---')
      if (!audioPlayer.value) {
        console.error('togglePlay: audioPlayer 未初始化')
        return
      }
      if (isPlaying.value) {
        audioPlayer.value.pause()
      } else {
        audioPlayer.value.play()
      }
      isPlaying.value = !isPlaying.value // 切换播放状态
    }

    /**
     * @function playSong
     * @param {number} index - 要播放歌曲在 MusicList 中的索引。
     * @description 播放指定索引的歌曲。
     * 如果歌曲 URL 为空，则会打印错误。
     * 成功设置 src 后，尝试播放并更新播放状态和当前歌曲信息。
     */
    const playSong = (index) => {
      console.log('--- playSong 被调用，索引:', index, '---')
      console.log('当前 MusicList:', MusicList.value)
      const song = MusicList.value[index]
      if (song && audioPlayer.value) {
        if (!song.url) {
          console.error('播放失败: 歌曲URL为空', song)
          return
        }

        console.log('准备播放歌曲:', song.name)
        console.log('歌曲URL:', song.url)
        console.log('当前audioPlayer状态:', {
          readyState: audioPlayer.value.readyState,
          networkState: audioPlayer.value.networkState,
          error: audioPlayer.value.error,
        })

        audioPlayer.value.src = song.url // 设置音频源
        audioPlayer.value.load() // 显式调用 load 方法以确保加载

        // 尝试播放，并处理播放 Promise
        const playPromise = audioPlayer.value.play()
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              console.log('播放成功')
            })
            .catch((error) => {
              console.error('播放失败:', error)
              isPlaying.value = false // 播放失败时将播放状态设为暂停
            })
        }

        isPlaying.value = true // 设置播放状态为播放中
        currentHash.value = song.hash // 更新当前歌曲哈希
        // 处理歌曲封面 URL，将 64 替换为 512 以获取更高分辨率的图片
        const processedCover = song.cover
          ? song.cover.replace('/stdmusic/64/', '/stdmusic/512/')
          : ''

        // 更新当前歌曲信息
        currentSongInfo.value = {
          name: song.name,
          artist: song.artist,
          cover: processedCover, // 使用处理后的封面 URL
          url: song.url,
          lrc: song.lrc,
        }
        // 提取歌曲封面颜色并更新主题 store
        if (processedCover) {
          // 使用处理后的封面 URL 进行颜色提取
          themeStore.extractColorFromImage(processedCover)
        }
      }
    }

    /**
     * @function playNext
     * @description 根据当前播放模式播放下一首歌曲。
     * 支持顺序播放、单曲循环和随机播放。
     * 如果下一首歌曲URL为空，则会先获取URL再播放。
     */
    const playNext = async () => {
      const currentIndex = MusicList.value.findIndex((song) => song.hash === currentHash.value)
      if (currentIndex !== -1) {
        let nextIndex
        if (currentPlayMode.value === PlayMode.SHUFFLE) {
          // 随机播放模式
          let randomIndex
          do {
            randomIndex = Math.floor(Math.random() * MusicList.value.length)
          } while (randomIndex === currentIndex && MusicList.value.length > 1) // 避免重复播放当前歌曲，除非只有一首
          nextIndex = randomIndex
        } else if (currentPlayMode.value === PlayMode.LOOP) {
          // 单曲循环模式
          nextIndex = currentIndex
        } else {
          // 顺序播放模式
          nextIndex = (currentIndex + 1) % MusicList.value.length
        }

        const nextSong = MusicList.value[nextIndex]

        // 如果下一首歌曲URL为空，则先获取URL
        if (!nextSong.url) {
          console.log('下一首歌曲URL为空，正在获取URL:', nextSong.name)
          await updateCurrentHash(nextSong.hash)
        } else {
          playSong(nextIndex) // 直接播放
        }
      }
    }

    /**
     * @function playPrev
     * @description 根据当前播放模式播放上一首歌曲。
     * 支持顺序播放、单曲循环和随机播放。
     * 如果上一首歌曲URL为空，则会先获取URL再播放。
     */
    const playPrev = async () => {
      const currentIndex = MusicList.value.findIndex((song) => song.hash === currentHash.value)
      if (currentIndex !== -1) {
        let prevIndex
        if (currentPlayMode.value === PlayMode.SHUFFLE) {
          // 随机播放模式
          let randomIndex
          do {
            randomIndex = Math.floor(Math.random() * MusicList.value.length)
          } while (randomIndex === currentIndex && MusicList.value.length > 1)
          prevIndex = randomIndex
        } else if (currentPlayMode.value === PlayMode.LOOP) {
          // 单曲循环模式
          prevIndex = currentIndex
        } else {
          // 顺序播放模式
          prevIndex = (currentIndex - 1 + MusicList.value.length) % MusicList.value.length
        }

        const prevSong = MusicList.value[prevIndex]

        // 如果上一首歌曲URL为空，则先获取URL
        if (!prevSong.url) {
          console.log('上一首歌曲URL为空，正在获取URL:', prevSong.name)
          await updateCurrentHash(prevSong.hash)
        } else {
          playSong(prevIndex) // 直接播放
        }
      }
    }

    /**
     * @enum {string} PlayMode
     * @description 播放模式枚举。
     */
    const PlayMode = {
      SEQUENCE: '顺序播放',
      LOOP: '单曲循环',
      SHUFFLE: '随机播放',
    }
    // 当前播放模式，默认为顺序播放
    const currentPlayMode = ref(PlayMode.SEQUENCE)

    // 加载更多歌曲（当前已注释，如果需要可启用并完善）
    // const getMoreList = async () => {
    //   try {
    //     const newSongs = await getPlayListSong(musicIds.value, page.value + 1, 20) // 每次加载20首歌
    //     console.log('获取到更多歌曲:', newSongs.data.songs)
    //     if (newSongs && newSongs.data && newSongs.data.songs) {
    //       page.value++ // 更新页码
    //       MusicList.value.push(...newSongs.data.songs)
    //       console.log('已加载更多歌曲，当前歌单数量:', MusicList.value.length)
    //     } else {
    //       console.warn('未获取到更多歌曲或数据格式不正确。')
    //     }
    //   } catch (error) {
    //     console.error('加载更多歌曲失败:', error)
    //   }
    // }

    /**
     * @function togglePlayMode
     * @description 切换播放模式（顺序 -> 单曲循环 -> 随机 -> 顺序）。
     */
    const togglePlayMode = () => {
      switch (currentPlayMode.value) {
        case PlayMode.SEQUENCE:
          currentPlayMode.value = PlayMode.LOOP
          break
        case PlayMode.LOOP:
          currentPlayMode.value = PlayMode.SHUFFLE
          break
        case PlayMode.SHUFFLE:
          currentPlayMode.value = PlayMode.SEQUENCE
          break
        default:
          currentPlayMode.value = PlayMode.SEQUENCE
      }
      console.log('当前播放模式:', currentPlayMode.value)
    }

    // 导出所有状态和方法，供组件使用
    return {
      MusicList,
      currentHash,
      currentTime,
      duration,
      isPlaying,
      currentSongInfo,
      musicIds,
      page,
      totalMusic,
      audioPlayer, // 导出 audioPlayer 实例，供需要直接操作的组件使用（如音量控制）
      setPage,
      setMusicIds,
      setMusicList,
      updateCurrentHash,
      deleteHash,
      setHashList,
      clearPlayList,
      setCurrentTime,
      togglePlay,
      playSong,
      playNext,
      playPrev,
      togglePlayMode,
      currentPlayMode,
    }
  },
  {
    // 启用 Pinia 持久化插件，将 store 状态存储在本地，以便刷新页面后状态不丢失
    persist: true,
  },
)
