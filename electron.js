const { app, BrowserWindow } = require('electron')
const { spawn } = require('child_process')
const path = require('path')

let backendProcess
let mainWindow

function startBackend() {
  // 判断开发/生产环境路径
  const backendPath = app.isPackaged
    ? path.join(process.resourcesPath, 'KuGouMusicApi/server.js') // 打包后路径
    : path.join(__dirname, '../KuGouMusicApi/server.js') // 开发环境路径

  backendProcess = spawn('node', [backendPath], {
    cwd: path.dirname(backendPath) // 设置工作目录
  })

  // 打印后端日志到控制台
  backendProcess.stdout.on('data', (data) => {
    console.log(`[Backend] ${data}`)
  })

  backendProcess.stderr.on('data', (data) => {
    console.error(`[Backend Error] ${data}`)
  })

  backendProcess.on('close', (code) => {
    console.log(`后端进程退出，代码 ${code}`)
    if (code !== 0) {
      showErrorDialog('后端服务启动失败，请检查日志')
    }
  })
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      // 生产环境建议启用安全设置：
      // contextIsolation: true,
      // preload: path.join(__dirname, 'preload.js')
    },
    show: false,
    title: '你的应用名称',
    icon: path.join(__dirname, 'assets/icon.png') // 应用图标
  })

  // 开发环境加载Vite
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173')
    mainWindow.webContents.openDevTools()
  }
  // 生产环境加载打包文件
  else {
    mainWindow.loadFile(path.join(__dirname, 'dist/index.html'))
      .catch(err => {
        console.error('加载页面失败:', err)
        showErrorDialog('无法加载应用界面，请重新安装')
      })
  }

  // 窗口就绪后显示
  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  })

  // 窗口关闭事件
  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

function showErrorDialog(message) {
  const { dialog } = require('electron')
  dialog.showErrorBox('应用错误', message)
}

// 应用准备就绪
app.whenReady().then(() => {
  startBackend() // 启动后端服务
  createWindow() // 创建窗口

  // macOS特殊处理
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// 应用关闭时清理
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    // 确保后端进程退出
    if (backendProcess) {
      backendProcess.kill()
      backendProcess = null
    }
    app.quit()
  }
})

// 异常处理
process.on('uncaughtException', (err) => {
  console.error('未捕获异常:', err)
  showErrorDialog(`应用异常: ${err.message}`)
})
