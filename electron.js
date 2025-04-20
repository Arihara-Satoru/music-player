const { app, BrowserWindow } = require('electron')
const path = require('path')

function createWindow() {
  let win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false,
    },
    show: false
  })

  if (process.env.NODE_ENV === 'development') {
    win.loadURL('http://localhost:5173')
    win.webContents.openDevTools()
  } else {
    const indexPath = path.join(__dirname, './dist/index.html');
    win.loadFile(indexPath).catch(err => {
      console.error("加载失败:", err);
    });
  }

  win.once('ready-to-show', () => {
    win.show()
  })

  win.on('closed', () => {
    win = null
  })
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})
