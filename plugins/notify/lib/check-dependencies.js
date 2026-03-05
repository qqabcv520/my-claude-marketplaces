#!/usr/bin/env node

/**
 * 依赖检查工具
 * 检查必需的 npm 依赖是否已安装
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function tryAutoInstall(pluginRoot) {
  try {
    execSync('npm install --prefer-offline --no-audit --no-fund', {
      cwd: pluginRoot,
      timeout: 15000,
      stdio: 'pipe'
    });

    // 重新检查依赖是否安装成功
    const nodeModulesPath = path.join(pluginRoot, 'node_modules');
    const requiredDeps = ['node-notifier'];
    for (const dep of requiredDeps) {
      if (!fs.existsSync(path.join(nodeModulesPath, dep))) {
        return false;
      }
    }
    return true;
  } catch (e) {
    return false;
  }
}

function checkDependencies() {
  const pluginRoot = process.env.CLAUDE_PLUGIN_ROOT || path.join(__dirname, '..');
  const nodeModulesPath = path.join(pluginRoot, 'node_modules');

  // 检查 node_modules 是否存在
  let needsInstall = false;
  if (!fs.existsSync(nodeModulesPath)) {
    needsInstall = true;
  } else {
    // 检查关键依赖
    const requiredDeps = ['node-notifier'];
    for (const dep of requiredDeps) {
      if (!fs.existsSync(path.join(nodeModulesPath, dep))) {
        needsInstall = true;
        break;
      }
    }
  }

  if (!needsInstall) {
    return true;
  }

  // 尝试自动安装
  console.error('[notify] 依赖缺失，正在尝试自动安装...');
  if (tryAutoInstall(pluginRoot)) {
    console.error('[notify] 依赖自动安装成功');
    return true;
  }

  // 自动安装失败，提示用户
  console.error('[notify] 依赖自动安装失败，请运行 /notify:init 初始化插件');
  return false;
}

module.exports = checkDependencies;
checkDependencies.tryAutoInstall = tryAutoInstall;

// 如果直接运行此脚本
if (require.main === module) {
  if (checkDependencies()) {
    console.log('✅ 所有依赖已正确安装');
  } else {
    process.exit(1);
  }
}
