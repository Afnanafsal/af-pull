# 🚀 AF-Pull — Git Auto Pull for VS Code

🟢 Keep your VS Code workspace always up to date with this smart auto-pull extension!  
**AF-Pull** automatically runs `git pull --rebase` every **2 minutes** — only if your branch is behind — with status bar updates and logs.

> 🔗 **[View on VS Code Marketplace →](https://marketplace.visualstudio.com/items?itemName=afnanafsal.af-pull)**  
> 🔍 Or search for: `AF-Pull` or `afnanafsal` in the VS Code Extensions tab

---

## ✨ Features

- ✅ Auto `git pull --rebase` every 2 minutes
- 🔄 Only pulls when the local branch is behind (no unnecessary pulls!)
- 🕒 Status bar shows **Last Pulled: [time]**
- 📋 Logs all activity in **AF-Pull** Output panel
- 🖱️ Run pull manually via `AF-Pull: Pull Now` command

---

## 💡 Why Use AF-Pull?

Tired of switching windows just to run `git pull`?

This extension is perfect for:

- Bot projects like **Af-**
- Automation workflows
- Teams working on rapidly changing repos

Always stay synced with zero distractions.

---

## ⚙️ Installation

### 🔧 Install via VS Code Marketplace (Recommended)

1. Go to [**AF-Pull on Marketplace**](https://marketplace.visualstudio.com/items?itemName=afnanafsal.af-pull)
2. Click **Install**
3. Done! It will auto-activate on startup

### 🔍 Install via VS Code Extensions Tab

1. Open **VS Code**
2. Go to the **Extensions** view (`Ctrl+Shift+X`)
3. Search for `AF-Pull` or `afnanafsal`
4. Click **Install**
5. Done! It will auto-activate on startup

### 📦 Install via `.vsix` file

1. Open **VS Code**
2. `Ctrl+Shift+P` → Run: `Extensions: Install from VSIX`
3. Choose the `.vsix` file from your local system

---

## 🛠️ Usage

- Open your Git workspace
- Every 2 minutes:
  - `git fetch` runs silently
  - If you're behind, `git pull --rebase` is triggered
- Check status via:
  - The 🕒 **Status Bar**
  - The **Output → AF-Pull** panel
- Use the command palette to **pull manually**

---

## 🔧 Commands

| Command                  | What it Does                    |
|--------------------------|---------------------------------|
| `AF-Pull: Pull Now`      | Instantly trigger `git pull`    |

You can also bind this command to a custom shortcut via VS Code settings.

