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
        }
        else {
            outputChannel.appendLine('⚠️ Command "afpull.pullNow" already exists. Skipping registration.');
        }
    });
    // Auto pull every 2 minutes
    setInterval(() => {
        autoPull(outputChannel);
    }, 2 * 60 * 1000); // 2 minutes
}
function autoPull(outputChannel) {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) {
        outputChannel.appendLine('❌ No workspace folder open.');
        return;
    }
    const cwd = workspaceFolders[0].uri.fsPath;
    const timestamp = new Date().toLocaleTimeString();
    // Fetch updates
    (0, child_process_1.exec)('git fetch', { cwd }, (fetchErr) => {
        if (fetchErr) {
            outputChannel.appendLine(`❌ ${timestamp} - Fetch failed: ${fetchErr.message}`);
            return;
        }
        // Check if local branch is behind
        (0, child_process_1.exec)('git status -uno', { cwd }, (statusErr, stdout) => {
            if (statusErr) {
                outputChannel.appendLine(`❌ ${timestamp} - Status check failed: ${statusErr.message}`);
                return;
            }
            if (stdout.includes('Your branch is behind')) {
                outputChannel.appendLine(`🔄 ${timestamp} - Remote changes detected. Pulling...`);
                (0, child_process_1.exec)('git pull --rebase', { cwd }, (pullErr, pullOut, pullErrOut) => {
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
    }, 5000); // Hide after 5 seconds
}
function deactivate() { }
