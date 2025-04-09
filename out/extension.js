"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const child_process_1 = require("child_process");
let statusBarItem;
function activate(context) {
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
        }
        else {
            outputChannel.appendLine('⚠️ Command "afpull.pullNow" already exists. Skipping registration.');
        }
    });
    // Commit + Push Command (with pre-commit pull)
    const smartCommitPush = vscode.commands.registerCommand('afpull.commitPushWithPull', async () => {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders || workspaceFolders.length === 0) {
            vscode.window.showErrorMessage('❌ No workspace folder open.');
            return;
        }
        const cwd = workspaceFolders[0].uri.fsPath;
        // Step 1: Fetch and check status
        (0, child_process_1.exec)('git fetch', { cwd }, (fetchErr) => {
            if (fetchErr) {
                vscode.window.showErrorMessage(`❌ Fetch failed: ${fetchErr.message}`);
                return;
            }
            (0, child_process_1.exec)('git status -uno', { cwd }, async (statusErr, stdout) => {
                if (statusErr) {
                    vscode.window.showErrorMessage(`❌ Status check failed: ${statusErr.message}`);
                    return;
                }
                const isBehind = stdout.includes('Your branch is behind');
                if (isBehind) {
                    const pullChoice = await vscode.window.showWarningMessage('📥 Your branch is behind. Pull before committing?', 'Pull Now', 'Cancel');
                    if (pullChoice === 'Pull Now') {
                        (0, child_process_1.exec)('git pull --rebase', { cwd }, (pullErr, pullOut) => {
                            if (pullErr) {
                                vscode.window.showErrorMessage(`❌ Pull failed: ${pullErr.message}`);
                                outputChannel.appendLine(`❌ Pull Error: ${pullErr.message}`);
                                return;
                            }
                            outputChannel.appendLine(`✅ Pulled before commit:\n${pullOut}`);
                            continueToCommit();
                        });
                    }
                    else {
                        vscode.window.showWarningMessage('❌ Commit cancelled (must pull first).');
                        return;
                    }
                }
                else {
                    continueToCommit();
                }
            });
        });
        // Step 2: Commit + Push
        async function continueToCommit() {
            const commitMsg = await vscode.window.showInputBox({
                prompt: 'Enter commit message',
                placeHolder: 'Fix bug / Add feature...',
            });
            if (!commitMsg) {
                vscode.window.showWarningMessage('⚠️ Commit cancelled (no message entered).');
                return;
            }
            (0, child_process_1.exec)(`git commit -am "${commitMsg}"`, { cwd }, (commitErr, commitOut) => {
                if (commitErr) {
                    vscode.window.showErrorMessage(`❌ Commit failed: ${commitErr.message}`);
                    return;
                }
                outputChannel.appendLine(`✅ Committed:\n${commitOut}`);
                (0, child_process_1.exec)('git push', { cwd }, (pushErr, pushOut) => {
                    if (pushErr) {
                        vscode.window.showErrorMessage(`❌ Push failed: ${pushErr.message}`);
                        return;
                    }
                    vscode.window.showInformationMessage('🚀 Push Successful!');
                    outputChannel.appendLine(`🚀 Pushed:\n${pushOut}`);
                });
            });
        }
    });
    context.subscriptions.push(smartCommitPush);
    // Auto pull every 2 minutes
    setInterval(() => {
        autoPull(outputChannel);
    }, 2 * 60 * 1000); // every 2 minutes
}
function autoPull(outputChannel) {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) {
        outputChannel.appendLine('❌ No workspace folder open.');
        return;
    }
    const cwd = workspaceFolders[0].uri.fsPath;
    const timestamp = new Date().toLocaleTimeString();
    (0, child_process_1.exec)('git fetch', { cwd }, (fetchErr) => {
        if (fetchErr) {
            outputChannel.appendLine(`❌ ${timestamp} - Fetch failed: ${fetchErr.message}`);
            return;
        }
        (0, child_process_1.exec)('git status -uno', { cwd }, (statusErr, stdout) => {
            if (statusErr) {
                outputChannel.appendLine(`❌ ${timestamp} - Status check failed: ${statusErr.message}`);
                return;
            }
            if (stdout.includes('Your branch is behind')) {
                outputChannel.appendLine(`🔄 ${timestamp} - Remote changes detected. Pulling...`);
                (0, child_process_1.exec)('git pull --rebase', { cwd }, (pullErr, pullOut) => {
                    if (pullErr) {
                        outputChannel.appendLine(`❌ Pull Error: ${pullErr.message}`);
                        return;
                    }
                    const pulledTime = new Date().toLocaleTimeString();
                    updateStatusBar(pulledTime);
                    outputChannel.appendLine(`✅ Pulled at ${pulledTime}:\n${pullOut}`);
                });
            }
            else {
                outputChannel.appendLine(`✅ ${timestamp} - Already up to date.`);
                updateStatusBar(timestamp);
            }
        });
    });
}
function updateStatusBar(time) {
    statusBarItem.text = `🕒 Last Pulled: ${time}`;
    statusBarItem.tooltip = `AF-Pull - Last pulled at ${time}`;
    statusBarItem.show();
    setTimeout(() => {
        statusBarItem.hide();
    }, 5000);
}
function deactivate() { }
