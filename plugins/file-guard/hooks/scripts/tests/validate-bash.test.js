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
  const scriptPath = path.join(__dirname, '..', 'validate-bash.js');
  const projectDir = 'F:\\code\\ta-claude-plugins';

  console.log('🧪 Testing validate-bash.js...\n');

  let passed = 0;
  let failed = 0;

  // 测试 1: 非 rm 命令应该允许
  try {
    const input = {
      tool_input: { command: 'ls /tmp' },
      tool_name: 'Bash'
    };
    const result = await runScript(scriptPath, input, { CLAUDE_PROJECT_DIR: projectDir });

    assert.strictEqual(result.code, 0, '应该返回退出码 0');
    const output = JSON.parse(result.stdout);
    assert.strictEqual(output.hookSpecificOutput.permissionDecision, 'allow', '非 rm 命令应该允许');

    console.log('✅ 测试 1: 非 rm 命令 - 通过');
    passed++;
  } catch (error) {
    console.log('❌ 测试 1: 非 rm 命令 - 失败');
    console.log('   错误:', error.message);
    failed++;
  }

  // 测试 2: 删除项目内文件应该允许
  try {
    const input = {
      tool_input: { command: `rm ${path.join(projectDir, 'test.txt')}` },
      tool_name: 'Bash'
    };
    const result = await runScript(scriptPath, input, { CLAUDE_PROJECT_DIR: projectDir });

    assert.strictEqual(result.code, 0, '应该返回退出码 0');
    const output = JSON.parse(result.stdout);
    assert.strictEqual(output.hookSpecificOutput.permissionDecision, 'allow', '项目内文件应该允许');

    console.log('✅ 测试 2: 删除项目内文件 - 通过');
    passed++;
  } catch (error) {
    console.log('❌ 测试 2: 删除项目内文件 - 失败');
    console.log('   错误:', error.message);
    failed++;
  }

  // 测试 3: 删除项目外文件应该询问
  try {
    const input = {
      tool_input: { command: 'rm /tmp/test.txt' },
      tool_name: 'Bash'
    };
    const result = await runScript(scriptPath, input, { CLAUDE_PROJECT_DIR: projectDir });

    assert.strictEqual(result.code, 0, '应该返回退出码 0');
    const output = JSON.parse(result.stdout);
    assert.strictEqual(output.hookSpecificOutput.permissionDecision, 'ask', '应该询问用户');
    assert.ok(output.hookSpecificOutput.permissionDecisionReason.includes('警告'), '应该包含警告信息');

    console.log('✅ 测试 3: 删除项目外文件 - 通过');
    passed++;
  } catch (error) {
    console.log('❌ 测试 3: 删除项目外文件 - 失败');
    console.log('   错误:', error.message);
    failed++;
  }

  // 测试 4: rm -rf 命令应该正确处理
  try {
    const input = {
      tool_input: { command: 'rm -rf /tmp/test' },
      tool_name: 'Bash'
    };
    const result = await runScript(scriptPath, input, { CLAUDE_PROJECT_DIR: projectDir });

    assert.strictEqual(result.code, 0, '应该返回退出码 0');
    const output = JSON.parse(result.stdout);
    assert.strictEqual(output.hookSpecificOutput.permissionDecision, 'ask', '应该询问用户');

    console.log('✅ 测试 4: rm -rf 命令 - 通过');
    passed++;
  } catch (error) {
    console.log('❌ 测试 4: rm -rf 命令 - 失败');
    console.log('   错误:', error.message);
    failed++;
  }

  // 测试 5: 多个目标文件（部分在项目外）
  try {
    const input = {
      tool_input: { command: `rm ${path.join(projectDir, 'test1.txt')} /tmp/test2.txt` },
      tool_name: 'Bash'
    };
    const result = await runScript(scriptPath, input, { CLAUDE_PROJECT_DIR: projectDir });

    assert.strictEqual(result.code, 0, '应该返回退出码 0');
    const output = JSON.parse(result.stdout);
    assert.strictEqual(output.hookSpecificOutput.permissionDecision, 'ask', '应该询问用户');

    console.log('✅ 测试 5: 多个目标文件（部分在项目外）- 通过');
    passed++;
  } catch (error) {
    console.log('❌ 测试 5: 多个目标文件（部分在项目外）- 失败');
    console.log('   错误:', error.message);
    failed++;
  }

  // 测试 6: 空命令应该允许
  try {
    const input = {
      tool_input: {},
      tool_name: 'Bash'
    };
    const result = await runScript(scriptPath, input, { CLAUDE_PROJECT_DIR: projectDir });

    assert.strictEqual(result.code, 0, '应该返回退出码 0');
    const output = JSON.parse(result.stdout);
    assert.strictEqual(output.hookSpecificOutput.permissionDecision, 'allow', '空命令应该允许');

    console.log('✅ 测试 6: 空命令 - 通过');
    passed++;
  } catch (error) {
    console.log('❌ 测试 6: 空命令 - 失败');
    console.log('   错误:', error.message);
    failed++;
  }

  // 测试 7: 无项目目录环境变量应该允许
  try {
    const input = {
      tool_input: { command: 'rm /tmp/test.txt' },
      tool_name: 'Bash'
    };
    const result = await runScript(scriptPath, input, {});

    assert.strictEqual(result.code, 0, '应该返回退出码 0');
    const output = JSON.parse(result.stdout);
    assert.strictEqual(output.hookSpecificOutput.permissionDecision, 'allow', '无项目目录应该允许');

    console.log('✅ 测试 7: 无项目目录环境变量 - 通过');
    passed++;
  } catch (error) {
    console.log('❌ 测试 7: 无项目目录环境变量 - 失败');
    console.log('   错误:', error.message);
    failed++;
  }

  // 测试 8: rm 命令但无目标（边界情况）
  try {
    const input = {
      tool_input: { command: 'rm -rf' },
      tool_name: 'Bash'
    };
    const result = await runScript(scriptPath, input, { CLAUDE_PROJECT_DIR: projectDir });

    assert.strictEqual(result.code, 0, '应该返回退出码 0');
    const output = JSON.parse(result.stdout);
    assert.strictEqual(output.hookSpecificOutput.permissionDecision, 'allow', '无目标应该允许');

    console.log('✅ 测试 8: rm 命令但无目标 - 通过');
    passed++;
  } catch (error) {
    console.log('❌ 测试 8: rm 命令但无目标 - 失败');
    console.log('   错误:', error.message);
    failed++;
  }

  // 测试 9: 删除 .claude 目录文件应该允许（白名单）
  try {
    const claudeDir = path.join(os.homedir(), '.claude', 'plans', 'test.md');
    const input = {
      tool_input: { command: `rm ${claudeDir}` },
      tool_name: 'Bash'
    };
    const result = await runScript(scriptPath, input, { CLAUDE_PROJECT_DIR: projectDir });

    assert.strictEqual(result.code, 0, '应该返回退出码 0');
    const output = JSON.parse(result.stdout);
    assert.strictEqual(output.hookSpecificOutput.permissionDecision, 'allow', '应该允许 .claude 目录');

    console.log('✅ 测试 9: .claude 目录白名单 - 通过');
    passed++;
  } catch (error) {
    console.log('❌ 测试 9: .claude 目录白名单 - 失败');
    console.log('   错误:', error.message);
    failed++;
  }

  // 测试 10: 无效 JSON 输入应该拒绝
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

      // 发送无效 JSON
      child.stdin.write('invalid json');
      child.stdin.end();
    });

    console.log('✅ 测试 10: 无效 JSON 输入 - 通过');
    passed++;
  } catch (error) {
    console.log('❌ 测试 10: 无效 JSON 输入 - 失败');
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
