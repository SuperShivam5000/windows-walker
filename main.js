const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const assistant = require('./assistant');

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'renderer.js'),
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  win.loadFile('index.html');
}

app.whenReady().then(() => {
  createWindow();
});

ipcMain.handle('send-command', async (event, userInput) => {
  try {
    const cmd = await assistant.getPowerShellCommand(userInput);
    return new Promise(resolve => {
      assistant.runCommand(cmd, output => {
        resolve({ command: cmd, output });
      });
    });
  } catch (err) {
    return { error: err.message };
  }
});
