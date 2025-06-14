const fs = require('fs');
const path = require('path');

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

module.exports = { loadMemories, saveMemories, clearMemories };