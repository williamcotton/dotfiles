const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('ipcRenderer', ipcRenderer)

// ipcRenderer.on('stdin-response', (_event, arg) => {
//   console.log(new TextDecoder('utf-8').decode(arg))
// })
// ipcRenderer.send('stdin-request')

contextBridge.exposeInMainWorld('stdin', (callback) => {
  ipcRenderer.on('stdin-response', (_event, arg) => {
    callback(arg)
  })
  ipcRenderer.send('stdin-request')
});
