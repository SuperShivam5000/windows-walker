const fs = require('fs');
const path = require('path');
let MEM_FILE;

try {
  const electron = require('electron');
  const app = electron.app || (electron.remote && electron.remote.app);
  if (app) {
    MEM_FILE = path.join(app.getPath('userData'), 'memories.json');
  } else {
    MEM_FILE = path.join(__dirname, 'memories.json');
  }
} catch {
  MEM_FILE = path.join(__dirname, 'memories.json');
}

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

module.exports = { loadMemories, saveMemories, clearMemories };