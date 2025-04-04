import {app, BrowserWindow, dialog, ipcMain, net} from 'electron';
import path from 'path';
import fs from 'fs';
import {fileURLToPath} from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.whenReady().then(() => {
  let mainWindow = new BrowserWindow({
    width: 1920,
    height: 1080,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true,
      allowRunningInsecureContent: false,
      preload: path.join(__dirname, 'preload.js') // Path to your preload script
    },
  });

  const isDev = process.env.NODE_ENV === 'development';
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }
  mainWindow.loadFile(path.join(__dirname, 'dist', 'index.html'));
});

// Handle app close for macOS
app.on('window-all-closed', () => {
  app.quit();
});

// Handle file download request from renderer
// ipcMain.handle('download-file', (event, url) => {
//   dialog.showSaveDialog({
//     title: 'Save File',
//     defaultPath: path.join(app.getPath('downloads'), 'downloaded-file'),
//     filters: [{name: 'All Files', extensions: ['*']}],
//   }).then(result => {
//     if (!result.canceled) {
//       const savePath = result.filePath;
//       const request = net.request(url);
//       request.on('response', (response) => {
//         response.pipe(fs.createWriteStream(savePath));
//         response.on('end', () => console.log(`Download complete: ${savePath}`));
//       });
//       request.on('error', (error) => console.error(`Download error: ${error}`));
//       request.end();
//     } else {
//       console.log('Download canceled by the user');
//     }
//   }).catch(err => console.error('Error opening save dialog:', err));
// });