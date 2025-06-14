function getSystemPrompt() {
    return `
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
Return 6969 if the task is done.`;
}

function getKnownMemoriesPrompt(memories) {
    return `
\nKnown memories: ${JSON.stringify(memories)}`;
}

function createNewMemoriesPrompt(memories) {
    return `
Current memories: ${JSON.stringify(memories)}\nExtract any new memories (URIs, process names, file paths, device names, etc) from this conversation. 
Do NOT repeat any of the above memories. Return as a JSON array of sentences, each describing a memory in the form: 'The <type> for <description> is <value>'. 
If none, return []. Only return JSON.`;
}

module.exports = { getSystemPrompt, getKnownMemoriesPrompt, createNewMemoriesPrompt };