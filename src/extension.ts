import * as vscode from 'vscode';
import { exec } from 'child_process';

let statusBarItem: vscode.StatusBarItem;

export function activate(context: vscode.ExtensionContext) {
  const outputChannel = vscode.window.createOutputChannel('AF-Pull');
  outputChannel.show(true);
  outputChannel.appendLine('✅ AF-Pull extension activated...');

  // Status Bar
  statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
  statusBarItem.text = '🕒 Last Pulled: Never';
  statusBarItem.tooltip = 'AF-Pull - Git Auto Pull Bot';
  statusBarItem.show();
  context.subscriptions.push(statusBarItem);

  // Pull Now Command
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

  // Commit + Push Command
  const commitPushWithPull = vscode.commands.registerCommand('afpull.commitPushWithPull', async () => {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) {
      vscode.window.showErrorMessage('❌ No workspace folder open.');
      return;
    }

    const cwd = workspaceFolders[0].uri.fsPath;
    const timestamp = new Date().toLocaleTimeString();

    // Git Fetch
    exec('git fetch', { cwd }, (fetchErr) => {
      if (fetchErr) {
        vscode.window.showErrorMessage(`❌ Fetch failed: ${fetchErr.message}`);
        return;
      }

      // Check if branch is behind
      exec('git status -uno', { cwd }, async (statusErr, stdout) => {
        if (statusErr) {
          vscode.window.showErrorMessage(`❌ Status failed: ${statusErr.message}`);
          return;
        }

        const isBehind = stdout.includes('Your branch is behind');

        const proceed = async () => {
          const commitMsg = await vscode.window.showInputBox({
            prompt: 'Enter commit message',
            placeHolder: 'Fix bug / Add feature...',
          });

          if (!commitMsg) {
            vscode.window.showWarningMessage('⚠️ Commit cancelled (no message entered).');
            return;
          }

          exec(`git commit -am "${commitMsg}"`, { cwd }, (commitErr, commitOut) => {
            if (commitErr) {
              vscode.window.showErrorMessage(`❌ Commit failed: ${commitErr.message}`);
              return;
            }

            outputChannel.appendLine(`✅ Committed:\n${commitOut}`);

            exec('git push', { cwd }, (pushErr, pushOut) => {
              if (pushErr) {
                vscode.window.showErrorMessage(`❌ Push failed: ${pushErr.message}`);
                return;
              }

              vscode.window.showInformationMessage('🚀 Push Successful!');
              outputChannel.appendLine(`🚀 Pushed:\n${pushOut}`);
            });
          });
        };

        if (isBehind) {
          vscode.window.showInformationMessage('🔄 Pulling before commit...');
          exec('git pull --rebase', { cwd }, (pullErr, pullOut) => {
            if (pullErr) {
              vscode.window.showErrorMessage(`❌ Pull failed (check for conflicts): ${pullErr.message}`);
              return;
            }

            outputChannel.appendLine(`✅ Pulled before commit:\n${pullOut}`);
            proceed();
          });
        } else {
          proceed();
        }
      });
    });
  });

  context.subscriptions.push(commitPushWithPull);

  // Auto pull every 2 minutes
  setInterval(() => {
    autoPull(outputChannel);
  }, 2 * 60 * 1000); // every 2 minutes
}

function autoPull(outputChannel: vscode.OutputChannel) {
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders || workspaceFolders.length === 0) {
    outputChannel.appendLine('❌ No workspace folder open.');
    return;
  }

  const cwd = workspaceFolders[0].uri.fsPath;
  const timestamp = new Date().toLocaleTimeString();

  exec('git fetch', { cwd }, (fetchErr) => {
    if (fetchErr) {
      outputChannel.appendLine(`❌ ${timestamp} - Fetch failed: ${fetchErr.message}`);
      return;
    }

    exec('git status -uno', { cwd }, (statusErr, stdout) => {
      if (statusErr) {
        outputChannel.appendLine(`❌ ${timestamp} - Status check failed: ${statusErr.message}`);
        return;
      }

      if (stdout.includes('Your branch is behind')) {
        outputChannel.appendLine(`🔄 ${timestamp} - Remote changes detected. Pulling...`);
        exec('git pull --rebase', { cwd }, (pullErr, pullOut) => {
          if (pullErr) {
            outputChannel.appendLine(`❌ Pull Error: ${pullErr.message}`);
            return;
          }

          const pulledTime = new Date().toLocaleTimeString();
          updateStatusBar(pulledTime);
          outputChannel.appendLine(`✅ Pulled at ${pulledTime}:\n${pullOut}`);
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
  }, 5000);
}

export function deactivate() {}
