# File Guard Plugin

防止 Claude Code 意外修改和删除当前项目目录之外的文件。

## 最新更新

### v1.1.0 (2026-01-26)

**重要修复**：修复了用户确认对话框不弹出的问题

- ✅ 修复 `ask()` 函数实现，现在会正确弹出用户确认对话框
- ✅ 添加 `.claude` 目录白名单，自动允许 Claude Code 系统文件
- ✅ 改进错误消息格式，提供更清晰的操作指引
- ✅ 更新测试套件，新增白名单测试用例

**技术细节**：之前的实现使用了 `exit code 2` 和 `stderr`，导致 Claude Code 将其当作阻塞错误而不是权限请求。现已修复为使用 `exit code 0` 和 `stdout`，符合 Claude Code Hook 协议规范。

## 功能特性

- **Edit 工具保护**：拦截对项目外文件的编辑操作
- **Bash rm 保护**：拦截对项目外文件的删除命令
- **智能白名单**：自动允许 `.claude` 目录等系统文件
- **用户确认对话框**：检测到项目外操作时弹出确认对话框
- **高性能**：使用 Node.js 实现，执行时间 <100ms
- **确定性逻辑**：不依赖 LLM，结果可预测
- **零配置**：自动复用 Claude Code 的工作目录机制

## 依赖要求

- **Node.js**：需要 Node.js 运行时（v14 或更高版本）
- **跨平台**：支持 Windows、macOS、Linux

检查 Node.js 版本：
```bash
node --version
```

如果未安装 Node.js，请访问 [nodejs.org](https://nodejs.org/) 下载安装。

## 安装方法

### 方式 1：从 my-claude-marketplaces 仓库安装

```bash
# 克隆仓库
git clone https://github.com/qqabcv520/my-claude-marketplaces.git

# 在项目中启用插件
cd your-project
claude --plugin-dir /path/to/my-claude-marketplaces/plugins/file-guard
```

### 方式 2：复制到项目

```bash
# 复制插件到项目的 .claude-plugin 目录
cp -r /path/to/my-claude-marketplaces/plugins/file-guard ./.claude-plugin/
```

## 使用示例

### 场景 1：编辑项目内文件（自动允许）

```
用户：请编辑 src/index.js 文件
Claude：[直接执行，无提示]
```

### 场景 2：编辑项目外文件（询问确认）

```
用户：请编辑 /etc/hosts 文件
Claude Code：[弹出权限确认对话框]
  ⚠️ 警告：尝试编辑项目外文件 /etc/hosts，请确认是否继续

  [允许] [拒绝]
用户：[选择允许或拒绝]
```

### 场景 3：编辑 .claude 目录文件（自动允许）

```
用户：请编辑 ~/.claude/plans/test.md
Claude：[直接执行，无提示 - 白名单]
```

### 场景 3：删除项目内文件（自动允许）

```
用户：删除 temp/cache.txt
Claude：[直接执行 rm temp/cache.txt]
```

### 场景 4：删除项目外文件（询问确认）

```
用户：删除 /tmp/important.txt
Claude Code：[弹出权限确认对话框]
  ⚠️ 警告：尝试删除项目外文件，请确认是否继续

  [允许] [拒绝]
用户：[选择允许或拒绝]
```

## 工作原理

### Hook 机制

插件使用 Claude Code 的 **PreToolUse Hook** 机制，在工具执行前进行拦截：

1. **Edit Hook**：监控 Edit 工具调用
   - 使用 Node.js 脚本验证文件路径
   - 检查路径是否在工作目录内
   - 项目外文件触发用户确认

2. **Bash Hook**：监控 Bash 命令
   - 使用 Node.js 脚本解析 rm 命令
   - 提取删除目标路径
   - 检查是否在项目外

### 技术实现

- **Command Hooks**：使用 Node.js 脚本实现验证逻辑
- **高性能**：执行时间 <100ms，不影响正常操作
- **确定性**：逻辑清晰，结果可预测
- **零 API 成本**：不消耗 LLM API 调用
   - 解析命令内容
   - 识别 rm 删除操作
   - 检查删除目标是否在项目外

### 工作目录判断

插件复用 Claude Code 的工作目录机制：

- `$CLAUDE_PROJECT_DIR`：当前项目根目录
- `/add-dir` 添加的目录：用户手动添加的额外工作目录

只要文件路径在这些目录内，操作就会被自动允许。

### 白名单机制

插件内置了智能白名单，自动允许以下目录的文件操作：

1. **Claude Code 系统目录**：`~/.claude/`（用户主目录下的 .claude 目录）
   - 包括计划文件、配置文件等 Claude Code 系统文件
   - 这些文件对 Claude Code 正常运行至关重要，应该被允许

2. **项目内 .claude 目录**：`<project>/.claude/`
   - 项目特定的 Claude Code 配置和状态文件

**为什么需要白名单？**

在 Plan Mode 中，Claude Code 需要编辑计划文件（位于 `~/.claude/plans/`），这些文件在项目目录外，但是 Claude Code 系统文件，应该被允许而不是弹出确认对话框。

**白名单优先级**：

1. 首先检查白名单（最高优先级）
2. 然后检查是否在项目目录内
3. 最后才询问用户确认

## 配置说明

### 默认行为

- ✅ 拦截 Edit 工具
- ✅ 拦截 Bash rm 命令
- ❌ 不拦截 Write 工具（创建新文件）
- ❌ 不拦截其他 Bash 命令（mv、cp 等）

### 自定义配置

如需修改拦截范围，编辑 `hooks/hooks.json`：

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Edit|Write",  // 添加 Write 工具
        "hooks": [...]
      }
    ]
  }
}
```

## 常见问题

### Q: 为什么不拦截 Write 工具？

A: Write 工具通常用于创建新文件，误操作风险较低。如需拦截，可以修改 hooks.json 配置。

### Q: 如何临时禁用保护？

A: 有两种方式：
1. 在 Claude Code 中选择"允许"继续操作
2. 临时移除插件：`rm -rf .claude-plugin/file-guard`

### Q: 插件会影响性能吗？

A: 影响极小。Node.js hook 的执行时间通常 <100ms，几乎不会被察觉。

### Q: 需要安装 Node.js 吗？

A: 是的。插件使用 Node.js 脚本实现验证逻辑，需要 Node.js v14 或更高版本。大多数开发环境都已安装 Node.js。

### Q: 支持符号链接吗？

A: 是的。插件会将路径转换为绝对路径后再判断，能够正确处理符号链接。

### Q: 如何查看 Hook 执行日志？

A: 使用调试模式启动 Claude Code：

```bash
claude --debug
```

日志中会显示 Hook 的执行情况和判断结果。

### Q: 确认对话框没有弹出怎么办？

A: 如果升级到 v1.1.0 后仍然没有弹出确认对话框：

1. **检查 Claude Code 版本**：确保使用最新版本的 Claude Code
2. **查看调试日志**：运行 `claude --debug` 查看 hook 输出
3. **验证修复**：运行测试套件确认修复生效：
   ```bash
   cd plugins/file-guard
   node hooks/scripts/tests/run-tests.js
   ```
4. **重启 Claude Code**：Hook 在启动时加载，修改后需要重启

### Q: 如何添加自定义白名单目录？

A: 当前版本内置了 `.claude` 目录白名单。如需添加更多目录，可以修改 `validate-edit.js` 和 `validate-bash.js` 中的 `isWhitelisted()` 函数。未来版本将支持通过配置文件自定义白名单。

## 技术细节

### Hook 配置结构

```json
{
  "description": "防止意外修改和删除项目外文件",
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Edit",
        "hooks": [{
          "type": "command",
          "command": "node ${CLAUDE_PLUGIN_ROOT}/hooks/scripts/validate-edit.js",
          "timeout": 10
        }]
      }
    ]
  }
}
```

### Node.js 脚本实现

插件使用两个 Node.js 脚本：

1. **validate-edit.js**：验证 Edit 工具的文件路径
2. **validate-bash.js**：验证 Bash rm 命令的目标路径

脚本特点：
- 从 stdin 读取 JSON 输入
- 使用 Node.js path 模块处理跨平台路径
- 输出标准 JSON 格式到 stdout/stderr
- 执行时间 <100ms

### 输出格式

Hook 返回标准的 JSON 格式：

```json
{
  "hookSpecificOutput": {
    "permissionDecision": "allow|ask|deny"
  },
  "systemMessage": "提示信息"
}
```

## 限制和注意事项

1. **Node.js 依赖**：需要系统安装 Node.js v14 或更高版本
2. **Hook 加载时机**：Hook 在 Claude Code 启动时加载，修改配置后需要重启
3. **路径解析**：使用 Node.js path 模块，正确处理相对路径和符号链接
4. **并行执行**：多个 Hook 并行执行，无法保证执行顺序

## 开发和测试

### 运行单元测试

插件包含完整的单元测试套件，覆盖各种场景：

```bash
# 运行所有测试
node hooks/scripts/tests/run-tests.js

# 运行单个测试文件
node hooks/scripts/tests/validate-edit.test.js
node hooks/scripts/tests/validate-bash.test.js
```

### 测试覆盖

**validate-edit.js 测试**（7 个测试用例）：
- ✅ 项目内文件应该允许
- ✅ 项目外文件应该询问
- ✅ 相对路径正确处理
- ✅ 空文件路径应该允许
- ✅ 无项目目录环境变量应该允许
- ✅ 无效 JSON 输入应该拒绝
- ✅ .claude 目录应该允许（白名单）

**validate-bash.js 测试**（9 个测试用例）：
- ✅ 非 rm 命令应该允许
- ✅ 删除项目内文件应该允许
- ✅ 删除项目外文件应该询问
- ✅ rm -rf 命令正确处理
- ✅ 多个目标文件（部分在项目外）
- ✅ 空命令应该允许
- ✅ 无项目目录环境变量应该允许
- ✅ rm 命令但无目标（边界情况）
- ✅ .claude 目录应该允许（白名单）

### 手动测试

```bash
# 测试 Edit 验证脚本
echo '{"tool_input":{"file_path":"test.txt"},"tool_name":"Edit"}' | \
  node hooks/scripts/validate-edit.js

# 测试 Bash 验证脚本
echo '{"tool_input":{"command":"rm /tmp/test.txt"},"tool_name":"Bash"}' | \
  node hooks/scripts/validate-bash.js
```

## 后续优化方向

- [x] 修复用户确认对话框不弹出的问题（v1.1.0）
- [x] 支持 .claude 目录白名单（v1.1.0）
- [ ] 支持通过配置文件自定义白名单路径
- [ ] 添加操作日志记录
- [ ] 提供统计报告功能
- [ ] 扩展到 NotebookEdit 工具
- [ ] 支持更多 Bash 命令（mv、cp 等）

## 贡献指南

欢迎提交 Issue 和 Pull Request！

## 许可证

MIT License

## 相关资源

- [Claude Code 官方文档](https://docs.claude.com/en/docs/claude-code)
- [Hook 开发指南](https://docs.claude.com/en/docs/claude-code/hooks)
- [my-claude-marketplaces 仓库](https://github.com/qqabcv520/my-claude-marketplaces)
