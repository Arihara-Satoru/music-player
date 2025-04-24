const { app, BrowserWindow } = require('electron');
const path = require('path');
const { fork } = require('child_process');
const express = require('express');

let mainWindow;
let backendProcess;
let localServer;

function createWindow(urlToLoad) {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      contextIsolation: false,
      nodeIntegration: true,
    },
  });

  mainWindow.loadURL(urlToLoad);

  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  const isDev = !app.isPackaged;

  if (isDev) {
    const rootPath = path.join(__dirname, '..');
    backendProcess = fork(path.join(rootPath, 'KuGouMusicApi', 'index.js'), {
      cwd: rootPath,
    });
    createWindow('http://localhost:5173');
  } else {
    const backendPath = path.join(process.resourcesPath, 'KuGouMusicApi', 'index.js');
    backendProcess = fork(backendPath, {
      cwd: path.dirname(backendPath),
      execPath: process.execPath,
  });

    // 启动 Express 静态文件服务器（生产）
    const appServer = express();
    const staticPath = path.join(process.resourcesPath, 'dist');
    appServer.use(express.static(staticPath));

    // 启动本地服务器并加载前端（生产）
    localServer = appServer.listen(4173, () => {
      console.log('Local static server running at http://localhost:4173');
      createWindow('http://localhost:4173');
    });
  }

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow(isDev ? 'http://localhost:5173' : 'http://localhost:4173');
    }
  });
});

app.on('window-all-closed', function () {
  if (backendProcess && backendProcess.kill) backendProcess.kill();
  if (localServer) localServer.close();
  if (process.platform !== 'darwin') app.quit();
});
