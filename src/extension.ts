import * as vscode from 'vscode';
import { exec } from 'child_process';

let statusBarItem: vscode.StatusBarItem;

export function activate(context: vscode.ExtensionContext) {
  const outputChannel = vscode.window.createOutputChannel('AF-Pull');
  outputChannel.show(true);
  outputChannel.appendLine('✅ AF-Pull extension activated...');

  // Create and show status bar item
  statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
  statusBarItem.text = '🕒 Last Pulled: Never';
  statusBarItem.tooltip = 'AF-Pull - Git Auto Pull Bot';
  statusBarItem.show();
  context.subscriptions.push(statusBarItem);

  // Register afpull.pullNow only if not already registered
  vscode.commands.getCommands().then((commands) => {
    if (!commands.includes('afpull.pullNow')) {
      const pullNowCommand = vscode.commands.registerCommand('afpull.pullNow', () => {
        autoPull(outputChannel);
      });
      context.subscriptions.push(pullNowCommand);
    } else {
      outputChannel.appendLine('⚠️ Command "afpull.pullNow" already exists. Skipping registration.');
    }
  });

  // Auto pull every 2 minutes
  setInterval(() => {
    autoPull(outputChannel);
  }, 2 * 60 * 1000); // 2 minutes
}

function autoPull(outputChannel: vscode.OutputChannel) {
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders || workspaceFolders.length === 0) {
    outputChannel.appendLine('❌ No workspace folder open.');
    return;
  }

  const cwd = workspaceFolders[0].uri.fsPath;
  const timestamp = new Date().toLocaleTimeString();

  // Fetch updates
  exec('git fetch', { cwd }, (fetchErr) => {
    if (fetchErr) {
      outputChannel.appendLine(`❌ ${timestamp} - Fetch failed: ${fetchErr.message}`);
      return;
    }

    // Check if local branch is behind
    exec('git status -uno', { cwd }, (statusErr, stdout) => {
      if (statusErr) {
        outputChannel.appendLine(`❌ ${timestamp} - Status check failed: ${statusErr.message}`);
        return;
      }

      if (stdout.includes('Your branch is behind')) {
        outputChannel.appendLine(`🔄 ${timestamp} - Remote changes detected. Pulling...`);

        exec('git pull --rebase', { cwd }, (pullErr, pullOut, pullErrOut) => {
          if (pullErr) {
            outputChannel.appendLine(`❌ Pull Error: ${pullErr.message}`);
            return;
          }
          if (pullErrOut) {
            outputChannel.appendLine(`⚠️ Pull Stderr: ${pullErrOut}`);
          }

          const pulledTime = new Date().toLocaleTimeString();
          updateStatusBar(pulledTime);
          outputChannel.appendLine(`✅ Pulled successfully at ${pulledTime}:\n${pullOut}`);
        });
      } else {
        outputChannel.appendLine(`✅ ${timestamp} - Already up to date.`);
        updateStatusBar(timestamp);
      }
    });
  });
}

function updateStatusBar(time: string) {
  statusBarItem.text = `🕒 Last Pulled: ${time}`;
  statusBarItem.tooltip = `AF-Pull - Last pulled at ${time}`;
  statusBarItem.show();
  setTimeout(() => {
    statusBarItem.hide();
  }
  , 5000); // Hide after 5 seconds
}


export function deactivate() {}

