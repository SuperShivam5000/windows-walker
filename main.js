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
    messages = [
      {
        role: "system",
        content: assistant.systemPrompt
      },
      {
        role: "user",
        content: userInput
      }
    ];

    const commandLog = [];

    let done = false;
    let cmd = "";
    while (!done) {

      cmd = await assistant.getPowerShellCommand(messages);

      if (cmd === "-1") {
        done = true;
        break;
      }

      messages.push({ role: "assistant", content: cmd });

      const output = await new Promise(resolve => {
        assistant.runCommand(cmd, result => {
          resolve(result);
        });
      });

      messages.push({ role: "system", content: output });
      commandLog.push({ command: cmd, output });
      if (output.includes("Done")) {
        done = true;
        break;
      }
    }
    return { commandLog };

  } catch (err) {
    return { error: err.message };
  }
});
