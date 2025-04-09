# 🚀 AF-Pull — Git Auto Pull (with Smart Push Sync) for VS Code

🟢 Keep your VS Code workspace always up to date with this smart auto-pull + controlled push extension!  
**AF-Pull** automatically runs `git pull --rebase` every **2 minutes** — only if your branch is behind — with status bar updates and logs.  
🛡️ It also **warns you if you try to push without pulling the latest changes**, helping prevent conflicts!

> 🔗 **[View on VS Code Marketplace →](https://marketplace.visualstudio.com/items?itemName=afnanafsal.af-pull)**  
> 🔍 Or search for: `AF-Pull` or `afnanafsal` in the VS Code Extensions tab

---

## ✨ Features

- ✅ Auto `git pull --rebase` every 2 minutes
- 🔄 Only pulls when the local branch is behind (no unnecessary pulls!)
- 🛑 Prevents or warns when trying to `push` before pulling (smart sync!)
- 🕒 Status bar shows **Last Pulled: [time]**
- 📋 Logs all activity in **AF-Pull** Output panel
- 🖱️ Run pull manually via `AF-Pull: Pull Now` command

---

## 💡 Why Use AF-Pull?

Tired of switching terminals just to stay updated?

This extension is perfect for:

- Bot projects like **Af-**
- Automation workflows
- Teams working on rapidly changing repos
- Preventing push/pull conflicts by making sure you're synced first

Always stay up to date and avoid push failures due to being behind.

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

- Open any Git workspace
- Every 2 minutes:
  - `git fetch` runs silently
  - If you're behind, `git pull --rebase` triggers automatically
- If you try to push while behind:
  - You’ll be warned to pull first
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

---

## 🔒 Smart Push Protection (Optional Feature)

If you're working on a team, this extension will **warn or stop you from pushing** until you've pulled the latest remote changes.  
This ensures you're always pushing on top of the latest version, reducing chances of:

- ❌ Push rejected (non-fast-forward)
- 🧨 Merge conflicts
- 🤕 Force pushes by mistake

> Stay synced. Avoid surprises. Push safely. 🚦

---

## 🧪 Demo (Coming Soon)

Check out the full walkthrough of the extension in action, including pull logs, status bar updates, and push warnings.

---

## 🧑‍💻 Author

**Afnan Afsal** — [@afnanafsal](https://github.com/afnanafsal)

If you like this, ⭐ the [GitHub repo](https://github.com/afnanafsal/af-pull) or leave a review on the [Marketplace](https://marketplace.visualstudio.com/items?itemName=afnanafsal.af-pull)!

---

## 📜 License

MIT — 2025 afnanafsal

