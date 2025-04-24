// preload.js
const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('api', {
  fetchData: (url) => fetch(url).then(response => response.json())
});
