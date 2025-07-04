const { exec } = require('child_process');

pollinations_url = 'https://text.pollinations.ai/openai';

async function getChatCompletion(messages) {
  const response = await fetch(pollinations_url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      "model": "openai-large",
      "messages": messages,
      "referrer": "windowswalker"
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

module.exports = { getChatCompletion, runCommand };