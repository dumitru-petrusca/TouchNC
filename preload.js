const { contextBridge } = require('electron');

// Securely expose the properties on the window object
contextBridge.exposeInMainWorld('serverUrl', process.env.SERVER_URL);
