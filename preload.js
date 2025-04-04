const {contextBridge, ipcRenderer} = require('electron');

// Securely expose the properties on the window object
contextBridge.exposeInMainWorld('serverUrl', process.env.SERVER_URL);

// contextBridge.exposeInMainWorld('electron', {
//   downloadFile: (url) => ipcRenderer.invoke('download-file', url),
// });
