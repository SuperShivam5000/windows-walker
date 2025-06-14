# Windows Walker
![image](https://github.com/user-attachments/assets/1fd2eb94-4ee2-4562-9191-806368f36731)          
## 🚀 Windows Walker – What Copilot for Windows should have been.

When Microsoft Copilot first arrived, it hinted at a future where you could control your system with natural language. That functionality was quickly dropped and I was disappointed — so I built **Windows Walker** to bring it back.

Windows Walker is your personal AI-powered Windows assistant. Give it simple voice or text commands, and it translates them into real system actions using PowerShell under the hood.

🧠 Powered by ChatGPT + PowerShell, and wrapped in a clean Electron UI, it acts just like a human assistant would.

💬 Try telling it things like:          
"Open notepad"           
"Open chrome and go to chatgpt.com"         
"Turn on bluetooth"         
"Turn on dark mode"        
...and it just does it. No scripting, no right-clicks, no settings-hunting.        

🖥️ Tech Stack: Node.js, Electron.js, PowerShell, [Pollinations.AI](https://pollinations.ai/)         
Feedback and contributions are always welcome! 🙌

## 🆕 New Features
🔁 1) Multi-turn Conversations           
Windows Walker now supports multi-turn interactions — meaning it can reason through a sequence of commands to accomplish complex tasks.           
Example:         
User: Open Oblivion from start menu          
Walker:          
Command: Get-StartApps          
-Reads list of installed apps and filters for “Oblivion”          
Command: Start-Process "shell:AppsFolder\BethesdaSoftworks.ProjectAltar_3275kfvn8vcwc!AppUEGameShipping"          
-Launches The Elder Scrolls IV: Oblivion Remastered        

🧠 2) Memory (Stateful Assistant)          
Walker now remembers useful context like AppIDs, file paths, URIs, process names, and more — for faster and more intelligent responses in the future.            
Example:            
After the Oblivion example above, Walker stores:        

“The AppID for The Elder Scrolls IV: Oblivion Remastered is BethesdaSoftworks.ProjectAltar_3275kfvn8vcwc!AppUEGameShipping”            
So next time you say "Open Oblivion", it just runs the correct command immediately.              

You can also teach Walker custom facts like:              
“Please remember that AdiAI is present on my desktop”                

## 🎥 Video Demonstration
[Watch The Video](https://www.youtube.com/watch?v=mcH4TlnGenQ)          
[Multi-Turn Conversation + Memory Demonstration](https://www.youtube.com/watch?v=Bih6vcDwiz8)

## 📜 License
This project is licensed under a Non-Commercial MIT License.          

You are free to use, copy, modify, and distribute this software for non-commercial purposes only.         
Commercial use is strictly prohibited without prior written permission from the author.         

See the LICENSE file for full details.          
