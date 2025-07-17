import { ref, onMounted, onUnmounted, watch } from 'vue'
import { usePlayStore } from '@/stores/PlaybackHistory'
import { getPlayListSong } from '@/api/user'
import { getMusic } from '@/utils/GetMusicList'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'

export function useMiniPlayer() {
  const router = useRouter()
  const playStore = usePlayStore()
  const audioPlayer = ref(null)
  const isPlaying = ref(false)
  const currentTime = ref(0)
  const duration = ref(0)
  const volume = ref(0.7)
  const showPlaylist = ref(false)
  const isSeeking = ref(false)
  let seekTimer = null
  const isShow = ref(true)
  const playMode = ref('sequence') // sequence, random, single, loop
  const currentSongInfo = ref({ name: '', artist: '', cover: '' })

  const startSeek = (e) => {
    if (isSeeking.value) return // ✅ 防止重复进入

    e.preventDefault()
    e.stopPropagation()
    seekTimer = setTimeout(() => {
      isSeeking.value = true
      isShow.value = true
    }, 700)
    e.target.dataset.startTime = Date.now()
  }

  const handleDrag = (e) => {
    if (!isSeeking.value) return

    e.preventDefault()
    const clientX = e.clientX || e.touches[0].clientX
    const rect = document.querySelector('.player-container').getBoundingClientRect()
    const percent = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width))
    const newTime = percent * duration.value
    currentTime.value = newTime
    seek(newTime)
  }

  const endSeek = (e) => {
    e.preventDefault()
    e.stopPropagation()
    clearTimeout(seekTimer)

    const startTime = parseInt(e.target.dataset.startTime || '0')
    const pressDuration = Date.now() - startTime
    const isLongPress = pressDuration >= 700

    // 强制结束拖动状态
    isSeeking.value = false
    isShow.value = true

    // 清除计时器和数据
    seekTimer = null
    delete e.target.dataset.startTime

    // 短按时跳转到播放页面
    if (!isLongPress && pressDuration < 700 && !e.target.closest('button')) {
      router.push({ path: '/PlayIndex' })
    }
  }

  // 初始化音频元素
  onMounted(() => {
    audioPlayer.value = new Audio()
    audioPlayer.value.volume = volume.value

    audioPlayer.value.addEventListener('timeupdate', () => {
      currentTime.value = audioPlayer.value.currentTime
      duration.value = audioPlayer.value.duration || 0
      if (isPlaying.value) {
        playStore.setCurrentTime(currentTime.value)
      }
    })

    audioPlayer.value.addEventListener('ended', () => {
      playNext()
    })

    // 添加全局鼠标/触摸松开监听
    window.addEventListener('mouseup', endSeek)
    window.addEventListener('touchend', endSeek)
  })

  onUnmounted(() => {
    window.removeEventListener('mouseup', endSeek)
    window.removeEventListener('touchend', endSeek)
  })

  // 播放控制方法
  const togglePlay = () => {
    if (isPlaying.value) {
      audioPlayer.value.pause()
    } else {
      audioPlayer.value.play()
    }
    isPlaying.value = !isPlaying.value
  }

  const seek = (time) => {
    audioPlayer.value.currentTime = time
  }

  const playSong = (index) => {
    const song = playStore.MusicList[index]
    if (song) {
      audioPlayer.value.src = song.url
      audioPlayer.value.play()
      isPlaying.value = true
      playStore.updateCurrentHash(song.hash)
      currentSongInfo.value = {
        name: song.name,
        artist: song.artist,
        cover: song.cover,
      }
    }
  }

  const playNext = () => {
    const currentIndex = playStore.MusicList.findIndex(
      (song) => song.hash === playStore.currentHash,
    )
    if (currentIndex === -1) return

    let nextIndex
    switch (playMode.value) {
      case 'random':
        nextIndex = Math.floor(Math.random() * playStore.MusicList.length)
        break
      case 'single':
        nextIndex = currentIndex
        break
      case 'loop':
        nextIndex = (currentIndex + 1) % playStore.MusicList.length
        break
      default: // sequence
        nextIndex = currentIndex + 1
        if (nextIndex >= playStore.MusicList.length) {
          isPlaying.value = false
          return
        }
    }
    playSong(nextIndex)
  }

  const togglePlayMode = () => {
    const modes = ['sequence', 'random', 'single', 'loop']
    const currentIndex = modes.indexOf(playMode.value)
    playMode.value = modes[(currentIndex + 1) % modes.length]
  }

  const playPrev = () => {
    const currentIndex = playStore.MusicList.findIndex(
      (song) => song.hash === playStore.currentHash,
    )
    if (currentIndex !== -1) {
      const prevIndex = (currentIndex - 1 + playStore.MusicList.length) % playStore.MusicList.length
      playSong(prevIndex)
    }
  }

  const getMoreList = async () => {
    // 获取更多列表逻辑
    const res = await getPlayListSong(playStore.musicIds, Number(playStore.page) + 1, 20)
    if (res.data.songs.length < 20) {
      ElMessage('已无更多歌曲')
      return
    }
    playStore.setPage(Number(playStore.page) + 1)
    await getMusic('', playStore.musicIds, res.data.songs, '', Number(playStore.page) + 1)
  }

  // 监听播放列表变化
  watch(
    () => playStore.currentHash,
    (newHash) => {
      if (newHash) {
        const currentSong = playStore.MusicList.find((song) => song.hash === newHash)
        if (currentSong) {
          audioPlayer.value.src = currentSong.url
          audioPlayer.value.play()
          isPlaying.value = true
          currentSongInfo.value = {
            name: currentSong.name,
            artist: currentSong.artist,
            cover: currentSong.cover,
          }
        }
      }
    },
  )

  return {
    audioPlayer,
    isPlaying,
    currentTime,
    duration,
    volume,
    showPlaylist,
    isSeeking,
    isShow,
    playMode,
    currentSongInfo,
    startSeek,
    handleDrag,
    endSeek,
    togglePlay,
    seek,
    playSong,
    playNext,
    togglePlayMode,
    playPrev,
    getMoreList,
  }
}
