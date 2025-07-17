import { defineStore } from 'pinia'
import { ref, onMounted, onUnmounted, watch } from 'vue' // 引入 watch
import { getMusicDetail, searchLyric, getLyric, playSong as playSongApi } from '@/api/PlaySong'

export const usePlayStore = defineStore(
  'PlayHistory',
  () => {
    // 播放历史，包含一首歌曲的详细信息
    const MusicList = ref([])
    const musicIds = ref(0)
    const page = ref(1)
    const currentHash = ref('')
    const currentTime = ref(0)
    const duration = ref(0)
    const isPlaying = ref(false)
    const audioPlayer = ref(null)
    const totalMusic = ref(0)
    const currentSongInfo = ref({
      name: '',
      artist: '',
      cover: '',
      url: '',
    })

    // 监听 audioPlayer 的变化
    watch(audioPlayer, (newVal, oldVal) => {
      console.log('audioPlayer 实例变化:', { oldVal, newVal })
      if (newVal) {
        console.log('新的 audioPlayer 实例已创建或更新。')
      } else {
        console.log('audioPlayer 实例被设置为 null。')
      }
    })

    // 初始化音频播放器
    // 初始化音频播放器
    const initAudioPlayer = () => {
      console.log('--- initAudioPlayer 被调用 ---') // 添加日志
      audioPlayer.value = new Audio()
      console.log('音频播放器已初始化')

      audioPlayer.value.addEventListener('timeupdate', () => {
        currentTime.value = audioPlayer.value.currentTime
        // console.log('时间更新:', currentTime.value) // 减少频繁日志
      })

      audioPlayer.value.addEventListener('durationchange', () => {
        duration.value = audioPlayer.value.duration || 0
        console.log('时长变化:', duration.value)
      })

      audioPlayer.value.addEventListener('loadedmetadata', () => {
        console.log('音频元数据加载完成, readyState:', audioPlayer.value.readyState)
        console.log('音频时长:', audioPlayer.value.duration)
      })

      audioPlayer.value.addEventListener('canplay', () => {
        console.log('音频可以播放')
      })

      audioPlayer.value.addEventListener('ended', () => {
        console.log('播放结束')
        playNext()
      })

      audioPlayer.value.addEventListener('error', (e) => {
        console.error('音频播放错误:', e)
        console.error('错误代码:', audioPlayer.value.error.code)
        isPlaying.value = false
      })
    }

    onMounted(() => {
      initAudioPlayer()
    })

    onUnmounted(() => {
      if (audioPlayer.value) {
        audioPlayer.value.pause()
        audioPlayer.value = null
      }
    })

    const setMusicIds = (ids) => {
      musicIds.value = ids
    }

    const setPage = (p) => {
      page.value = p
    }

    const setMusicList = async () => {
      try {
        const res = await getMusicDetail(currentHash.value)
        console.log('setMusicList res', res)
      } catch (error) {
        console.error('setMusicList 错误', error)
      }
    }

    const updateCurrentHash = async (newHash) => {
      try {
        const res = await playSongApi(newHash)
        console.log('playSong res', res)
        if (!res) {
          throw new Error('playSong 返回数据格式不正确')
        }
        if (!res.backupUrl?.length) {
          console.warn('playSong 返回的数据中缺少 backupUrl')
          return
        }
        const { candidates } = await searchLyric(newHash)
        let decodeContent = ''
        if (candidates?.length > 0) {
          const lyricRes = await getLyric(candidates[0].id, candidates[0].accesskey)
          decodeContent = lyricRes.decodeContent
        }
        // 找到并更新 MusicList 中的歌曲 URL
        const updatedMusicList = MusicList.value.map((item) => {
          if (item.hash === newHash) {
            return {
              ...item,
              url: res?.backupUrl?.[0] || '',
              lrc: decodeContent,
            }
          }
          return item
        })
        MusicList.value = updatedMusicList // 更新 MusicList
        currentHash.value = newHash

        // 在获取到 URL 后尝试播放歌曲
        const songIndex = MusicList.value.findIndex((item) => item.hash === newHash)
        if (songIndex !== -1) {
          console.log(
            'updateCurrentHash 成功获取URL，尝试自动播放歌曲:',
            MusicList.value[songIndex].name,
          )
          playSong(songIndex) // 尝试播放
        }
      } catch (error) {
        console.error('获取音乐详情失败', error)
      }
    }

    const setHashList = (hash, name, artist, cover) => {
      if (!MusicList.value.some((item) => item.hash === hash)) {
        MusicList.value.push({
          hash,
          name,
          artist,
          url: '',
          cover,
          lrc: '',
        })
      }
    }

    const deleteHash = () => {
      MusicList.value = []
    }

    const clearPlayList = () => {
      MusicList.value = []
    }

    const setCurrentTime = (time) => {
      currentTime.value = time
      if (audioPlayer.value) {
        audioPlayer.value.currentTime = time
      }
    }

    const togglePlay = () => {
      console.log('--- togglePlay 被调用 ---') // 添加日志
      if (!audioPlayer.value) {
        console.error('togglePlay: audioPlayer 未初始化') // 添加错误日志
        return
      }
      if (isPlaying.value) {
        audioPlayer.value.pause()
      } else {
        audioPlayer.value.play()
      }
      isPlaying.value = !isPlaying.value
    }

    const playSong = (index) => {
      console.log('--- playSong 被调用，索引:', index, '---') // 添加日志
      console.log('当前 MusicList:', MusicList.value) // 打印 MusicList
      const song = MusicList.value[index]
      if (song && audioPlayer.value) {
        if (!song.url) {
          console.error('播放失败: 歌曲URL为空', song) // 打印 song 对象
          return
        }

        console.log('准备播放歌曲:', song.name)
        console.log('歌曲URL:', song.url)
        console.log('当前audioPlayer状态:', {
          readyState: audioPlayer.value.readyState,
          networkState: audioPlayer.value.networkState,
          error: audioPlayer.value.error,
        })

        audioPlayer.value.src = song.url
        audioPlayer.value.load() // 显式调用load

        const playPromise = audioPlayer.value.play()
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              console.log('播放成功')
            })
            .catch((error) => {
              console.error('播放失败:', error)
              isPlaying.value = false
            })
        }

        isPlaying.value = true
        currentHash.value = song.hash
        currentSongInfo.value = {
          name: song.name,
          artist: song.artist,
          cover: song.cover,
          url: song.url,
        }
      }
    }

    const playNext = async () => {
      const currentIndex = MusicList.value.findIndex((song) => song.hash === currentHash.value)
      if (currentIndex !== -1) {
        let nextIndex
        if (currentPlayMode.value === PlayMode.SHUFFLE) {
          // 随机播放
          let randomIndex
          do {
            randomIndex = Math.floor(Math.random() * MusicList.value.length)
          } while (randomIndex === currentIndex && MusicList.value.length > 1) // 避免重复播放当前歌曲，除非只有一首
          nextIndex = randomIndex
        } else if (currentPlayMode.value === PlayMode.LOOP) {
          // 单曲循环
          nextIndex = currentIndex
        } else {
          // 顺序播放
          nextIndex = (currentIndex + 1) % MusicList.value.length
        }

        const nextSong = MusicList.value[nextIndex]

        if (!nextSong.url) {
          console.log('下一首歌曲URL为空，正在获取URL:', nextSong.name)
          await updateCurrentHash(nextSong.hash)
        } else {
          playSong(nextIndex)
        }
      }
    }

    const playPrev = async () => {
      const currentIndex = MusicList.value.findIndex((song) => song.hash === currentHash.value)
      if (currentIndex !== -1) {
        let prevIndex
        if (currentPlayMode.value === PlayMode.SHUFFLE) {
          // 随机播放
          let randomIndex
          do {
            randomIndex = Math.floor(Math.random() * MusicList.value.length)
          } while (randomIndex === currentIndex && MusicList.value.length > 1)
          prevIndex = randomIndex
        } else if (currentPlayMode.value === PlayMode.LOOP) {
          // 单曲循环
          prevIndex = currentIndex
        } else {
          // 顺序播放
          prevIndex = (currentIndex - 1 + MusicList.value.length) % MusicList.value.length
        }

        const prevSong = MusicList.value[prevIndex]

        if (!prevSong.url) {
          console.log('上一首歌曲URL为空，正在获取URL:', prevSong.name)
          await updateCurrentHash(prevSong.hash)
        } else {
          playSong(prevIndex)
        }
      }
    }

    // 播放模式枚举
    const PlayMode = {
      SEQUENCE: '顺序播放',
      LOOP: '单曲循环',
      SHUFFLE: '随机播放',
    }
    const currentPlayMode = ref(PlayMode.SEQUENCE) // 默认顺序播放

    // 加载更多歌曲
    // const getMoreList = async () => {
    //   // 改为 async 函数
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

    // 切换播放模式
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
      // 可以在这里添加根据播放模式调整播放列表的逻辑
    }

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
      audioPlayer, // 导出audioPlayer
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
      togglePlayMode, // 导出新方法
      currentPlayMode, // 导出播放模式
    }
  },
  {
    persist: true,
  },
)
