#!/usr/bin/env node
'use strict';

const { spawn } = require('child_process');
const path = require('path');

// 运行单个测试文件
function runTestFile(testFile) {
  return new Promise((resolve, reject) => {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`运行测试: ${path.basename(testFile)}`);
    console.log('='.repeat(60));

    const child = spawn('node', [testFile], {
      stdio: 'inherit'
    });

    child.on('close', (code) => {
      resolve(code);
    });

    child.on('error', reject);
  });
}

// 主函数
async function main() {
  const testsDir = __dirname;
  const testFiles = [
    path.join(testsDir, 'validate-edit.test.js'),
    path.join(testsDir, 'validate-bash.test.js')
  ];

  console.log('🚀 开始运行 File Guard 插件测试套件\n');

  let totalPassed = 0;
  let totalFailed = 0;

  for (const testFile of testFiles) {
    const exitCode = await runTestFile(testFile);
    if (exitCode === 0) {
      totalPassed++;
    } else {
      totalFailed++;
    }
  }

  // 总结
  console.log('\n' + '='.repeat(60));
  console.log('📊 测试套件总结');
  console.log('='.repeat(60));
  console.log(`测试文件: ${testFiles.length}`);
  console.log(`通过: ${totalPassed}`);
  console.log(`失败: ${totalFailed}`);
  console.log('='.repeat(60));

  if (totalFailed > 0) {
    console.log('\n❌ 部分测试失败');
    process.exit(1);
  } else {
    console.log('\n✅ 所有测试通过！');
    process.exit(0);
  }
}

// 运行测试
main().catch((error) => {
  console.error('测试运行失败:', error);
  process.exit(1);
});
