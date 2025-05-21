const { exec } = require('child_process');
server_url = 'https://windows-walker-server.onrender.com';

async function pingServer() {
  try {
    const res = await fetch(server_url);
    const text = await res.text();
    console.log('Response from server:', text);
  } catch (err) {
    console.error('Could not reach server:', err.message);
  }
}

async function getPowerShellCommand(userInput) {
  const response = await fetch(server_url+'/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ input: userInput }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Server error: ${response.status} - ${errorText}`);
  }

  const result = await response.text();
  return result;
}

function runCommand(cmd, callback) {
  exec(`powershell -Command "${cmd}"`, (error, stdout, stderr) => {
    if (error || stderr) {
      callback(`❌ ${error?.message || stderr}`);
    } else {
      callback(`✅ Output: ${stdout || "Done"}`);
    }
  });
}

module.exports = { getPowerShellCommand, runCommand, pingServer };
