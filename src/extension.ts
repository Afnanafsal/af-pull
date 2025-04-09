import * as vscode from 'vscode';
import { exec } from 'child_process';
import { promisify } from 'util';
import player from 'play-sound';

const execPromise = promisify(exec);
let statusBarItem: vscode.StatusBarItem;
const soundPlayer = player();

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 5000;

export function activate(context: vscode.ExtensionContext) {
  const outputChannel = vscode.window.createOutputChannel('AF-Pull');
  outputChannel.appendLine('✅ AF-Pull activated...');
  outputChannel.show(true);

  statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
  statusBarItem.text = '🕒 Last Pulled: Never';
  statusBarItem.tooltip = 'AF-Pull - Git Auto Pull Bot';
  statusBarItem.command = 'afpull.pullNow';
  statusBarItem.show();
  context.subscriptions.push(statusBarItem);

  context.subscriptions.push(
    vscode.commands.registerCommand('afpull.pullNow', () => autoPull(outputChannel))
  );

  setInterval(() => autoPull(outputChannel), 2 * 60 * 1000); // Every 2 minutes
}

async function autoPull(outputChannel: vscode.OutputChannel) {
  const cwd = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
  if (!cwd) return;

  const timestamp = new Date().toLocaleTimeString();
  const workingFile = vscode.window.activeTextEditor?.document.uri.fsPath;

  try {
    await execPromise('git fetch', { cwd });

    const { stdout: statusOut } = await execPromise('git status -uno', { cwd });

    if (!statusOut.includes('Your branch is behind')) {
      updateStatusBar(timestamp);
      outputChannel.appendLine(`✅ ${timestamp} - Repository is up to date.`);
      return;
    }

    outputChannel.appendLine(`🔄 ${timestamp} - Remote changes detected. Pulling...`);

    const { stdout: localStatusOut } = await execPromise('git status --porcelain', { cwd });

    const filesToPull = localStatusOut.split('\n').filter(line => {
      const file = line.split(' ')[1];
      return file !== workingFile;
    });

    if (filesToPull.length > 0) {
      await handleAutoPull(cwd, outputChannel, timestamp);

      if (filesToPull.some(file => file === workingFile)) {
        vscode.window.showInformationMessage(`📄 The working file has new changes pulled!`);
      }
    }

  } catch (err: unknown) {
    if (err instanceof Error) {
      outputChannel.appendLine(`❌ ${new Date().toLocaleTimeString()} - Git operation failed: ${err.message}`);
      vscode.window.showErrorMessage(`❌ Git operation failed: ${err.message}`);
    } else {
      outputChannel.appendLine(`❌ Unknown error during Git operation.`);
      vscode.window.showErrorMessage(`❌ Unknown error during Git operation.`);
    }
    await retryPull(cwd, outputChannel, new Date().toLocaleTimeString(), err instanceof Error ? err.message : "Unknown error");
  }
}

async function retryPull(cwd: string, outputChannel: vscode.OutputChannel, timestamp: string, lastErrorMessage: string, attempt = 1): Promise<void> {
  if (attempt > MAX_RETRIES) {
    outputChannel.appendLine(`❌ Max retries reached. Pull failed.`);
    vscode.window.showErrorMessage(`❌ Max retries reached. Pull failed.`);
    return;
  }

  outputChannel.appendLine(`⚠️ Retry ${attempt}/${MAX_RETRIES} after ${RETRY_DELAY_MS / 1000}s delay...`);
  setTimeout(async () => {
    try {
      await execPromise('git pull --rebase', { cwd });
      outputChannel.appendLine(`✅ Successfully retried pull at ${timestamp}`);
      vscode.window.showInformationMessage(`✅ Pull succeeded after retry`);
    } catch (err) {
      await retryPull(cwd, outputChannel, timestamp, err instanceof Error ? err.message : "Unknown error", attempt + 1);
    }
  }, RETRY_DELAY_MS);
}

async function handleAutoPull(cwd: string, outputChannel: vscode.OutputChannel, timestamp: string) {
  try {
    // Check for unstaged changes
    const { stdout: status } = await execPromise('git status --porcelain', { cwd });

    if (status.includes(' M ')) {
      // Stash changes if there are unstaged changes
      outputChannel.appendLine(`⚠️ Unstaged changes detected. Stashing changes...`);
      const stashResult = await execPromise('git stash -u save "Auto stashed changes by AF-Pull"', { cwd });

      if (stashResult.stdout.includes('No local changes to save')) {
        outputChannel.appendLine(`✅ No changes to stash.`);
      } else {
        outputChannel.appendLine(`✅ Stashed changes.`);
      }

      // Perform the pull
      await execPromise('git pull --rebase', { cwd });

      // Reapply the stashed changes
      outputChannel.appendLine(`🔄 Reapplying stashed changes...`);
      await execPromise('git stash pop', { cwd });

      outputChannel.appendLine(`✅ Pulled successfully and reapplied stashed changes at ${timestamp}`);
      vscode.window.showInformationMessage(`✅ Pull successful with stashed changes reapplied!`);

      // Play success sound
      soundPlayer.play('media/success.mp3', (err: any) => {
        if (err) console.log("Error playing sound:", err);
      });
    } else {
      // If no unstaged changes, just perform the pull
      await execPromise('git pull --rebase', { cwd });
      outputChannel.appendLine(`✅ Pulled at ${timestamp}`);
      vscode.window.showInformationMessage(`✅ Pull successful!`);
    }

  } catch (err) {
    if (err instanceof Error) {
      outputChannel.appendLine(`❌ Pull Error: ${err.message}`);
      vscode.window.showErrorMessage(`❌ Pull failed: ${err.message}`);
    } else {
      outputChannel.appendLine(`❌ Pull Error: Unknown error.`);
      vscode.window.showErrorMessage(`❌ Pull failed: Unknown error.`);
    }
  }
}

function updateStatusBar(time: string) {
  statusBarItem.text = `🕒 Last Pulled: ${time}`;
  statusBarItem.show();
}

export function deactivate() {}
