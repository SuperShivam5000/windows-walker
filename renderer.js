const { ipcRenderer } = require('electron');

window.addEventListener('DOMContentLoaded', () => {
  document.getElementById("powershell-section").style.display = "none";

  const queryInput = document.getElementById("query");

  queryInput.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      sendCommand();
    }
  });

  async function withSpinner(action) {
    const loadingSpinner = document.getElementById("loading-spinner");
    loadingSpinner.style.display = "flex";
    document.getElementById("powershell-section").style.display = "none";
    try {
      await action();
    } finally {
      loadingSpinner.style.display = "none";
    }
  }

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

  const micBtn = document.getElementById("mic-btn");
  let sttTriggered = false;
  if (micBtn) {
    micBtn.addEventListener("click", () => {
      const queryInput = document.getElementById("query");
      if (queryInput) {
        queryInput.value = "";
        queryInput.focus();
      }
      sttTriggered = true;
      ipcRenderer.send("invoke-dictation");
    });
  }

  const queryInput2 = document.getElementById("query");
  let debounceTimer = null;
  let lastValue = "";
  if (queryInput2) {
    queryInput2.addEventListener("input", function () {
      if (!sttTriggered) return;
      if (debounceTimer) clearTimeout(debounceTimer);
      if (queryInput2.value && queryInput2.value !== lastValue) {
        debounceTimer = setTimeout(() => {
          if (queryInput2.value === lastValue && queryInput2.value.trim() !== "") {
            sttTriggered = false;
            window.sendCommand();
          }
        }, 1000);
        lastValue = queryInput2.value;
      }
    });
  }
});
