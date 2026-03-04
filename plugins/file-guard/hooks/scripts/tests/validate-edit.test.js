#!/usr/bin/env node
'use strict';

const assert = require('assert');
const { spawn } = require('child_process');
const path = require('path');
const os = require('os');

// 测试辅助函数
function runScript(scriptPath, input, env = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn('node', [scriptPath], {
      env: { ...process.env, ...env }
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    child.on('close', (code) => {
      resolve({ code, stdout, stderr });
    });

    child.on('error', reject);

    // 发送输入
    child.stdin.write(JSON.stringify(input));
    child.stdin.end();
  });
}

// 测试套件
async function runTests() {
  const scriptPath = path.join(__dirname, '..', 'validate-edit.js');
  const projectDir = 'F:\\code\\ta-claude-plugins';

  console.log('🧪 Testing validate-edit.js...\n');

  let passed = 0;
  let failed = 0;

  // 测试 1: 项目内文件应该允许
  try {
    const input = {
      tool_input: { file_path: path.join(projectDir, 'test.txt') },
      tool_name: 'Edit'
    };
    const result = await runScript(scriptPath, input, { CLAUDE_PROJECT_DIR: projectDir });

    assert.strictEqual(result.code, 0, '应该返回退出码 0');
    const output = JSON.parse(result.stdout);
    assert.strictEqual(output.hookSpecificOutput.permissionDecision, 'allow', '应该允许项目内文件');

    console.log('✅ 测试 1: 项目内文件 - 通过');
    passed++;
  } catch (error) {
    console.log('❌ 测试 1: 项目内文件 - 失败');
    console.log('   错误:', error.message);
    failed++;
  }

  // 测试 2: 项目外文件应该询问
  try {
    const input = {
      tool_input: { file_path: 'C:\\Windows\\System32\\hosts' },
      tool_name: 'Edit'
    };
    const result = await runScript(scriptPath, input, { CLAUDE_PROJECT_DIR: projectDir });

    assert.strictEqual(result.code, 0, '应该返回退出码 0');
    const output = JSON.parse(result.stdout);
    assert.strictEqual(output.hookSpecificOutput.permissionDecision, 'ask', '应该询问用户');
    assert.ok(output.hookSpecificOutput.permissionDecisionReason.includes('警告'), '应该包含警告信息');

    console.log('✅ 测试 2: 项目外文件 - 通过');
    passed++;
  } catch (error) {
    console.log('❌ 测试 2: 项目外文件 - 失败');
    console.log('   错误:', error.message);
    failed++;
  }

  // 测试 3: 相对路径应该正确处理
  try {
    const input = {
      tool_input: { file_path: './test.txt' },
      tool_name: 'Edit'
    };
    const result = await runScript(scriptPath, input, { CLAUDE_PROJECT_DIR: projectDir });

    // 相对路径会被解析为当前工作目录，可能在项目内或外
    assert.ok(result.code === 0, '应该返回退出码 0');

    console.log('✅ 测试 3: 相对路径处理 - 通过');
    passed++;
  } catch (error) {
    console.log('❌ 测试 3: 相对路径处理 - 失败');
    console.log('   错误:', error.message);
    failed++;
  }

  // 测试 4: 空文件路径应该允许
  try {
    const input = {
      tool_input: {},
      tool_name: 'Edit'
    };
    const result = await runScript(scriptPath, input, { CLAUDE_PROJECT_DIR: projectDir });

    assert.strictEqual(result.code, 0, '应该返回退出码 0');
    const output = JSON.parse(result.stdout);
    assert.strictEqual(output.hookSpecificOutput.permissionDecision, 'allow', '空路径应该允许');

    console.log('✅ 测试 4: 空文件路径 - 通过');
    passed++;
  } catch (error) {
    console.log('❌ 测试 4: 空文件路径 - 失败');
    console.log('   错误:', error.message);
    failed++;
  }

  // 测试 5: 无项目目录环境变量应该允许（避免阻塞）
  try {
    const input = {
      tool_input: { file_path: '/tmp/test.txt' },
      tool_name: 'Edit'
    };
    const result = await runScript(scriptPath, input, {});

    assert.strictEqual(result.code, 0, '应该返回退出码 0');
    const output = JSON.parse(result.stdout);
    assert.strictEqual(output.hookSpecificOutput.permissionDecision, 'allow', '无项目目录应该允许');

    console.log('✅ 测试 5: 无项目目录环境变量 - 通过');
    passed++;
  } catch (error) {
    console.log('❌ 测试 5: 无项目目录环境变量 - 失败');
    console.log('   错误:', error.message);
    failed++;
  }

  // 测试 6: 无效 JSON 应该拒绝
  try {
    const child = spawn('node', [scriptPath], {
      env: { ...process.env, CLAUDE_PROJECT_DIR: projectDir }
    });

    let stdout = '';
    child.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    await new Promise((resolve) => {
      child.on('close', (code) => {
        assert.strictEqual(code, 0, '应该返回退出码 0');
        const output = JSON.parse(stdout);
        assert.strictEqual(output.hookSpecificOutput.permissionDecision, 'deny', '应该拒绝');
        assert.ok(output.hookSpecificOutput.permissionDecisionReason.includes('JSON parse error'), '应该包含 JSON 错误');
        resolve();
      });

      child.stdin.write('invalid json');
      child.stdin.end();
    });

    console.log('✅ 测试 6: 无效 JSON 输入 - 通过');
    passed++;
  } catch (error) {
    console.log('❌ 测试 6: 无效 JSON 输入 - 失败');
    console.log('   错误:', error.message);
    failed++;
  }

  // 测试 7: .claude 目录应该允许
  try {
    const claudeDir = path.join(os.homedir(), '.claude', 'plans', 'test.md');
    const input = {
      tool_input: { file_path: claudeDir },
      tool_name: 'Edit'
    };
    const result = await runScript(scriptPath, input, { CLAUDE_PROJECT_DIR: projectDir });

    assert.strictEqual(result.code, 0, '应该返回退出码 0');
    const output = JSON.parse(result.stdout);
    assert.strictEqual(output.hookSpecificOutput.permissionDecision, 'allow', '应该允许 .claude 目录');

    console.log('✅ 测试 7: .claude 目录白名单 - 通过');
    passed++;
  } catch (error) {
    console.log('❌ 测试 7: .claude 目录白名单 - 失败');
    console.log('   错误:', error.message);
    failed++;
  }

  // 总结
  console.log('\n' + '='.repeat(50));
  console.log(`测试完成: ${passed} 通过, ${failed} 失败`);
  console.log('='.repeat(50));

  process.exit(failed > 0 ? 1 : 0);
}

// 运行测试
runTests().catch((error) => {
  console.error('测试运行失败:', error);
  process.exit(1);
});
