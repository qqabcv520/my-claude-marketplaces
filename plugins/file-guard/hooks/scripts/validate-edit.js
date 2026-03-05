#!/usr/bin/env node
'use strict';

const path = require('path');
const os = require('os');

// 读取 stdin JSON 输入
let inputData = '';
process.stdin.setEncoding('utf8');

process.stdin.on('data', (chunk) => {
  inputData += chunk;
});

process.stdin.on('end', () => {
  try {
    const input = JSON.parse(inputData);
    // 非 bypass 模式下跳过验证，Claude Code 自身会处理权限
    if (input.permission_mode !== 'bypassPermissions') {
      return;
    }
    validateEdit(input);
  } catch (error) {
    denyWithError(`JSON parse error: ${error.message}`);
  }
});

function isWhitelisted(absolutePath, projectDir) {
  // 白名单模式
  const whitelistPatterns = [
    // Claude Code 系统目录（用户主目录下的 .claude）
    path.join(os.homedir(), '.claude')
  ];

  // 如果有项目目录，添加项目内的 .claude 目录
  if (projectDir) {
    whitelistPatterns.push(path.join(projectDir, '.claude'));
  }

  for (const pattern of whitelistPatterns) {
    if (absolutePath.startsWith(pattern)) {
      return true;
    }
  }

  return false;
}

function validateEdit(input) {
  const filePath = input.tool_input?.file_path;
  const projectDir = process.env.CLAUDE_PROJECT_DIR;

  if (!filePath) {
    approve();
    return;
  }

  if (!projectDir) {
    // 如果没有项目目录，默认允许（避免阻塞）
    approve();
    return;
  }

  // 转换为绝对路径
  const absolutePath = path.resolve(filePath);
  const normalizedProjectDir = path.resolve(projectDir);

  // 1. 先检查白名单
  if (isWhitelisted(absolutePath, normalizedProjectDir)) {
    approve();
    return;
  }

  // 2. 再检查是否在项目目录内
  if (absolutePath.startsWith(normalizedProjectDir)) {
    approve();
    return;
  }

  // 3. 项目外文件，询问用户
  ask(`警告：尝试编辑项目外文件 ${absolutePath}，请确认是否继续`);
}

function approve() {
  const output = {
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "allow"
    }
  };
  console.log(JSON.stringify(output));
  process.exit(0);
}

function ask(message) {
  const output = {
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "ask",
      permissionDecisionReason: message
    }
  };
  console.log(JSON.stringify(output));
  process.exit(0);
}

function denyWithError(message) {
  const output = {
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "deny",
      permissionDecisionReason: `Error: ${message}`
    }
  };
  console.log(JSON.stringify(output));
  process.exit(0);
}
