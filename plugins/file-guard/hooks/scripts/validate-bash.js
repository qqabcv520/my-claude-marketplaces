#!/usr/bin/env node
'use strict';

const path = require('path');
const os = require('os');

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
    validateBash(input);
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

function validateBash(input) {
  const command = input.tool_input?.command;
  const projectDir = process.env.CLAUDE_PROJECT_DIR;

  if (!command) {
    approve();
    return;
  }

  // 检查是否包含 rm 命令
  if (!command.match(/\brm\b/)) {
    approve();
    return;
  }

  if (!projectDir) {
    // 如果没有项目目录，默认允许（避免阻塞）
    approve();
    return;
  }

  // 解析 rm 的目标路径
  // 匹配 rm 命令及其参数
  const rmMatch = command.match(/\brm\s+(?:-[a-zA-Z]+\s+)*(.+)/);
  if (!rmMatch) {
    approve();
    return;
  }

  // 提取目标路径（过滤掉选项参数）
  const targets = rmMatch[1]
    .split(/\s+/)
    .filter(t => t && !t.startsWith('-'));

  if (targets.length === 0) {
    approve();
    return;
  }

  const normalizedProjectDir = path.resolve(projectDir);

  // 检查所有目标是否都在项目内或白名单中
  for (const target of targets) {
    const absolutePath = path.resolve(target);

    // 1. 先检查白名单
    if (isWhitelisted(absolutePath, normalizedProjectDir)) {
      continue;
    }

    // 2. 再检查是否在项目目录内
    if (!absolutePath.startsWith(normalizedProjectDir)) {
      ask(`警告：尝试删除项目外文件 ${absolutePath}，请确认是否继续`);
      return;
    }
  }

  // 所有目标都在项目内或白名单中
  approve();
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
