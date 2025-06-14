const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const assistant = require('./assistant');
const fs = require('fs');

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

const MEM_FILE = path.join(__dirname, 'memories.json');

function loadMemories() {
  if (!fs.existsSync(MEM_FILE)) return [];
  try {
    return JSON.parse(fs.readFileSync(MEM_FILE, 'utf-8'));
  } catch {
    return [];
  }
}

function saveMemories(memories) {
  fs.writeFileSync(MEM_FILE, JSON.stringify(memories, null, 2));
}

function clearMemories() {
  fs.writeFileSync(MEM_FILE, '[]');
}

ipcMain.handle('delete-memories', async () => {
  clearMemories();
  return { success: true };
});

ipcMain.handle('send-command', async (event, userInput) => {
  try {
    let memories = loadMemories();
    // Inject memories into the system prompt
    let memoryPrompt = memories.length ? `\nKnown memories: ${JSON.stringify(memories)}` : '';
    messages = [
      {
        role: "system",
        content: assistant.systemPrompt + memoryPrompt
      },
      {
        role: "user",
        content: userInput
      }
    ];

    const commandLog = [];

    // Show all current memories in the log at the start
    if (memories.length) {
      commandLog.push({ command: 'MEMORY', output: '💾 Known memories:\n' + memories.join('\n') });
    }

    let done = false;
    let cmd = "";
    while (!done) {

      cmd = await assistant.getPowerShellCommand(messages);

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
      commandLog.push({ command: cmd, output });

      if (cmd.includes("6969")) {
        done = true;
        break;
      }
      // --- Memory extraction step ---
      // Ask the LLM for new memories after each loop, providing current memories to avoid repeats
      const memoryExtractPrompt = [
        ...messages,
        { role: "system", content: `Current memories: ${JSON.stringify(memories)}\nExtract any new memories (URIs, process names, file paths, device names, etc) from this conversation. Do NOT repeat any of the above memories. Return as a JSON array of sentences, each describing a memory in the form: 'The <type> for <description> is <value>'. If none, return []. Only return JSON.` }
      ];
      let newMems = [];
      try {
        const memResp = await assistant.getPowerShellCommand(memoryExtractPrompt);
        newMems = JSON.parse(memResp);
      } catch {}
      if (Array.isArray(newMems) && newMems.length) {
        // Merge new memories, avoid duplicates
        const memSet = new Set(memories);
        let newUnique = [];
        for (const m of newMems) {
          if (!memSet.has(m)) {
            memSet.add(m);
            newUnique.push(m);
          }
        }
        memories = Array.from(memSet);
        saveMemories(memories);
        if (newUnique.length) {
          commandLog.push({ command: 'MEMORY', output: '🆕 New memories:\n' + newUnique.join('\n') });
        }
      }
      // --- End memory extraction ---
    }
    return { commandLog };

  } catch (err) {
    return { error: err.message };
  }
});
