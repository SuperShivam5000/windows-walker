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

    if (result.error) {
      outputEl.textContent = `❗ Error: ${result.error}`;
    } else {
      outputEl.textContent = `💡 Command: ${result.command}\n\n${result.output}`;
    }

    psSection.style.display = "block";
    queryInput.value = "";
  };
});
