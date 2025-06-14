const { ipcRenderer } = require('electron');

window.addEventListener('DOMContentLoaded', () => {
  const queryInput = document.getElementById("query");

  queryInput.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      sendCommand();
    }
  });

  window.sendCommand = async function () {
    const query = queryInput.value;
    const result = await ipcRenderer.invoke('send-command', query);
    const outputEl = document.getElementById("output");
    const psSection = document.getElementById("powershell-section");

    psSection.style.display = "block";

    if (result.error) {
      outputEl.textContent = `❗ Error: ${result.error}`;
    } else {
      const log = result.commandLog.map(entry =>
        `💡 Command: ${entry.command}\n${entry.output}`
      ).join("\n\n");
      outputEl.textContent = log;
    }

    queryInput.value = "";
  };

  const delBtn = document.getElementById("delete-memories");
  delBtn.addEventListener("click", async () => {
    await ipcRenderer.invoke('delete-memories');
    const outputEl = document.getElementById("output");
    const psSection = document.getElementById("powershell-section");
    psSection.style.display = "block";
    outputEl.textContent = '🗑️ All memories deleted.';
  });
});
