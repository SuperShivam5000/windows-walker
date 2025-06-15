const { ipcRenderer } = require('electron');

window.addEventListener('DOMContentLoaded', () => {
  // Hide logs window on load
  document.getElementById("powershell-section").style.display = "none";

  const queryInput = document.getElementById("query");

  queryInput.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      sendCommand();
    }
  });

  // Utility function to show spinner during async actions
  async function withSpinner(action) {
    const loadingSpinner = document.getElementById("loading-spinner");
    loadingSpinner.style.display = "flex";
    // Hide logs window while loading
    document.getElementById("powershell-section").style.display = "none";
    try {
      await action();
    } finally {
      loadingSpinner.style.display = "none";
    }
  }

  // Utility function to show/hide logs window based on message
  function showLogIfMessage(msg) {
    const psSection = document.getElementById("powershell-section");
    if (msg && msg.trim().length > 0) {
      psSection.style.display = "block";
    } else {
      psSection.style.display = "none";
    }
  }

  window.sendCommand = async function () {
    const query = queryInput.value;
    const outputEl = document.getElementById("output");
    outputEl.textContent = "";
    await withSpinner(async () => {
      const result = await ipcRenderer.invoke('send-command', query);
      let logMsg = "";
      if (result.error) {
        logMsg = `❗ Error: ${result.error}`;
      } else {
        logMsg = result.commandLog.map(entry =>
          `💡 Command: ${entry.command}\n${entry.output}`
        ).join("\n\n");
      }
      outputEl.textContent = logMsg;
      showLogIfMessage(logMsg);
      queryInput.value = "";
    });
  };

  // Show Memories button logic
  const showMemBtn = document.getElementById("show-memories");
  showMemBtn.addEventListener("click", async () => {
    const outputEl = document.getElementById("output");
    outputEl.textContent = "";
    await withSpinner(async () => {
      const result = await ipcRenderer.invoke('get-memories');
      let logMsg = "";
      if (result.memories && result.memories.length) {
        logMsg = '💾 Known memories:\n' + result.memories.join('\n');
      } else {
        logMsg = 'ℹ️ No memories found.';
      }
      outputEl.textContent = logMsg;
      showLogIfMessage(logMsg);
    });
  });

  const delBtn = document.getElementById("delete-memories");
  delBtn.addEventListener("click", async () => {
    const outputEl = document.getElementById("output");
    outputEl.textContent = "";
    await withSpinner(async () => {
      let logMsg = "";
      try {
        await ipcRenderer.invoke('delete-memories');
        logMsg = '🗑️ All memories deleted.';
      } catch {
        logMsg = '❗ Error deleting memories.';
      }
      outputEl.textContent = logMsg;
      showLogIfMessage(logMsg);
    });
  });
});
