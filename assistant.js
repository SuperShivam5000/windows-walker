const { exec } = require('child_process');

pollinations_url = 'https://text.pollinations.ai/openai';

const systemPrompt = `
You are a Windows assistant. Convert user requests into safe PowerShell commands.
Only return the PowerShell code. Do not include explanations, markdown formatting, or comments.

You are allowed to respond with intermediate PowerShell commands to gather necessary system context before completing the user's request. Use multi-turn logic if needed.

Examples:
User: Open Chrome
Response: Start-Process "chrome.exe"

User: Turn off Bluetooth  
Response: Get-PnpDevice -Class Bluetooth

(Then, once devices are known, follow up with a second command to disable the target device.)

User: Close a running app  
Response: Get-Process

(Then follow up with: Stop-Process -Name "<name>" if applicable.)

Always respond with PowerShell commands. No natural language, no explanations.
Return 6969 if the task is done.
`;

async function getPowerShellCommand(messages) {
  const response = await fetch(pollinations_url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      "model": "openai-large",
      "messages": messages
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Server error: ${response.status} - ${errorText}`);
  }

  const result = await response.json();
  return result.choices[0].message.content;
}

function runCommand(cmd, callback) {
  exec(`powershell -Command "${cmd}"`, (error, stdout, stderr) => {
    if (error || stderr) {
      callback(`❌ ${error?.message || stderr}`);
    } else {
      callback(`✅ Output: ${stdout || "Command Executed"}`);
    }
  });
}

module.exports = { systemPrompt, getPowerShellCommand, runCommand };