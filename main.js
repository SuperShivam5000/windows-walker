const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const assistant = require('./assistant');
const memory = require('./memory');
const prompts = require('./prompts');
const robot = require('robotjs'); 

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

ipcMain.handle('delete-memories', async () => {
  memory.clearMemories();
  return { success: true };
});

ipcMain.handle('get-memories', async () => {
  const memories = memory.loadMemories();
  return { memories };
});

ipcMain.handle('send-command', async (event, userInput) => {
  try {
    let memories = memory.loadMemories();
    let memoryPrompt = memories.length ? prompts.getKnownMemoriesPrompt(memories) : '';
    messages = [
      {
        role: "system",
        content: prompts.getSystemPrompt() + memoryPrompt
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

      cmd = await assistant.getChatCompletion(messages);

      if (cmd === "6969") {
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
      commandLog.push({ command: cmd.replace("6969", ""), output });

      if (cmd.includes("6969")) {
        done = true;
        break;
      }

    }

    //Memory extraction step
    const memoryExtractPrompt = [
      ...messages,
      { role: "system", content: prompts.createNewMemoriesPrompt(memories) }
    ];
    let newMems = [];
    try {
      const memResp = await assistant.getChatCompletion(memoryExtractPrompt);
      console.log(memResp);
      newMems = JSON.parse(memResp);
    } catch { }
    if (Array.isArray(newMems) && newMems.length) {
      const memSet = new Set(memories);
      let newUnique = [];
      for (const m of newMems) {
        if (!memSet.has(m)) {
          memSet.add(m);
          newUnique.push(m);
        }
      }
      memories = Array.from(memSet);
      memory.saveMemories(memories);
      if (newUnique.length) {
        commandLog.push({ command: 'NEW MEMORY', output: '🆕 New memories:\n' + newUnique.join('\n') });
      }
    }
    //End memory extraction
    console.log(messages);
    return { commandLog };

  } catch (err) {
    return { error: err.message };
  }
});

ipcMain.on('invoke-dictation', () => {
  robot.keyToggle('command', 'down');
  robot.keyTap('h');
  robot.keyToggle('command', 'up');
});

ipcMain.on('close-dictation', () => {
  robot.keyTap('escape');
});