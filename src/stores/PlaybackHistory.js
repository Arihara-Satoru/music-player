import { defineStore } from 'pinia'
import { ref, onMounted, onUnmounted } from 'vue'
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
    const currentSongInfo = ref({
      name: '',
      artist: '',
      cover: '',
      url: '',
    })

    // 初始化音频播放器
    const initAudioPlayer = () => {
      audioPlayer.value = new Audio()
      audioPlayer.value.volume = 0.7
      console.log('初始化音频播放器')

      audioPlayer.value.addEventListener('timeupdate', () => {
        currentTime.value = audioPlayer.value.currentTime
        console.log('时间更新:', currentTime.value)
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
        MusicList.value = MusicList.value.map((item) => {
          if (item.hash === newHash) {
            return {
              ...item,
              url: res?.backupUrl?.[0] || '',
              lrc: decodeContent,
            }
          }
          return item
        })
        currentHash.value = newHash
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
      if (!audioPlayer.value) return
      if (isPlaying.value) {
        audioPlayer.value.pause()
      } else {
        audioPlayer.value.play()
      }
      isPlaying.value = !isPlaying.value
    }

    const playSong = (index) => {
      const song = MusicList.value[index]
      if (song && audioPlayer.value) {
        if (!song.url) {
          console.error('播放失败: 歌曲URL为空')
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

    const playNext = () => {
      const currentIndex = MusicList.value.findIndex((song) => song.hash === currentHash.value)
      if (currentIndex !== -1) {
        const nextIndex = (currentIndex + 1) % MusicList.value.length
        playSong(nextIndex)
      }
    }

    const playPrev = () => {
      const currentIndex = MusicList.value.findIndex((song) => song.hash === currentHash.value)
      if (currentIndex !== -1) {
        const prevIndex = (currentIndex - 1 + MusicList.value.length) % MusicList.value.length
        playSong(prevIndex)
      }
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
    }
  },
  {
    persist: true,
  },
)
