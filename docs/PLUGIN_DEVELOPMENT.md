# Claude Code 插件开发指南

本文档提供 Claude Code 插件开发的最佳实践、调试技巧和常见问题解决方案。

## 目录

- [插件基础](#插件基础)
- [插件结构](#插件结构)
- [开发工作流](#开发工作流)
- [最佳实践](#最佳实践)
- [调试技巧](#调试技巧)
- [常见问题](#常见问题)

## 插件基础

### 什么是 Claude Code 插件？

Claude Code 插件是扩展 Claude Code 功能的模块化组件，可以添加自定义命令、技能和钩子。

### 插件类型

1. **单个插件**：独立的功能模块
2. **Marketplace**：包含多个插件的集合

### 核心概念

- **Commands（命令）**：用户可调用的斜杠命令（如 `/ps-init`）
- **Skills（技能）**：AI 自动触发的能力
- **Hooks（钩子）**：在特定事件触发的自动化操作

## 插件结构

### 单个插件结构

```
my-plugin/
├── .claude-plugin/
│   └── plugin.json           # 插件配置文件（必需）
├── commands/                 # 命令目录（可选）
│   ├── my-command.md
│   └── another-command.md
├── skills/                   # 技能目录（可选）
│   ├── skill.md
│   ├── examples/
│   └── references/
├── hooks/                    # 钩子目录（可选）
│   └── hooks.json
└── README.md                 # 插件说明（推荐）
```

### Marketplace 结构

```
my-marketplace/
├── .claude-plugin/
│   └── marketplace.json      # Marketplace 配置（必需）
├── plugins/
│   ├── plugin-a/
│   │   ├── .claude-plugin/
│   │   │   └── plugin.json
│   │   └── ...
│   └── plugin-b/
│       ├── .claude-plugin/
│       │   └── plugin.json
│       └── ...
└── README.md
```

### plugin.json 配置

```json
{
  "name": "my-plugin",
  "version": "1.0.0",
  "description": "插件描述",
  "author": {
    "name": "作者名称"
  },
  "repository": "https://github.com/username/repo",
  "license": "MIT",
  "keywords": ["keyword1", "keyword2"],
  "commands": ["./commands"],
  "skills": ["./skills"],
  "hooks": ["./hooks/hooks.json"]
}
```

**必需字段：**
- `name`：插件唯一标识符（kebab-case）
- `version`：语义化版本号
- `description`：简短描述

**可选字段：**
- `author`：作者信息
- `repository`：仓库地址
- `license`：许可证类型
- `keywords`：关键词数组
- `commands`：命令目录或文件路径数组
- `skills`：技能目录或文件路径数组
- `hooks`：钩子配置文件路径数组

### marketplace.json 配置

```json
{
  "name": "my-marketplace",
  "version": "1.0.0",
  "description": "Marketplace 描述",
  "owner": {
    "name": "所有者名称"
  },
  "plugins": [
    {
      "name": "plugin-a",
      "source": "./plugins/plugin-a",
      "description": "插件 A 描述"
    },
    {
      "name": "plugin-b",
      "source": "./plugins/plugin-b",
      "description": "插件 B 描述"
    }
  ]
}
```

## 开发工作流

### 1. 创建新插件

```bash
# 创建插件目录结构
mkdir -p my-plugin/.claude-plugin
mkdir -p my-plugin/commands
mkdir -p my-plugin/skills
mkdir -p my-plugin/hooks

# 创建 plugin.json
cat > my-plugin/.claude-plugin/plugin.json << 'EOF'
{
  "name": "my-plugin",
  "version": "1.0.0",
  "description": "我的插件",
  "commands": ["./commands"],
  "skills": ["./skills"]
}
EOF
```

### 2. 开发命令

命令文件使用 Markdown 格式，包含以下部分：

```markdown
# 命令名称

命令描述

## 使用方法

\`\`\`bash
/my-command [参数]
\`\`\`

## 功能特性

- 特性 1
- 特性 2

## 执行指令

当此命令被调用时，执行以下步骤：

### 步骤 1：...

描述步骤 1

### 步骤 2：...

描述步骤 2
```

**命令文件命名规范：**
- 使用 kebab-case（如 `my-command.md`）
- 文件名应与命令名对应（`/my-command` → `my-command.md`）

### 3. 开发技能

技能文件定义 AI 自动触发的能力：

```markdown
# 技能名称

技能描述

## 触发条件

描述何时触发此技能

## 执行流程

描述技能执行的步骤

## 示例

提供使用示例
```

**技能组织：**
- 主技能文件：`skill.md` 或 `SKILL.md`
- 示例：`examples/` 目录
- 参考资料：`references/` 目录

### 4. 开发钩子

钩子配置使用 JSON 格式：

```json
{
  "hooks": [
    {
      "event": "PreToolUse",
      "condition": "toolName === 'Write'",
      "action": "inject-context",
      "context": "团队编码规范"
    }
  ]
}
```

**支持的事件：**
- `PreToolUse`：工具调用前
- `PostToolUse`：工具调用后
- `SessionStart`：会话开始
- `SessionEnd`：会话结束

### 5. 本地测试

```bash
# 安装本地插件
claude-code plugin install ./my-plugin

# 查看已安装插件
claude-code plugin list

# 测试命令
/my-command

# 卸载插件
claude-code plugin uninstall my-plugin
```

### 6. 发布插件

1. **创建 Git 仓库**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/username/my-plugin.git
   git push -u origin main
   ```

2. **添加 README.md**
   - 插件描述
   - 安装方法
   - 使用示例
   - 贡献指南

3. **发布到 GitHub**
   - 创建 Release
   - 添加版本标签
   - 编写 Release Notes

## 最佳实践

### 命令设计

1. **命名规范**
   - 使用简短、描述性的名称
   - 使用 kebab-case（如 `/my-command`）
   - 避免与内置命令冲突

2. **参数设计**
   - 提供清晰的参数说明
   - 使用可选参数提供灵活性
   - 提供默认值

3. **用户体验**
   - 提供清晰的使用说明
   - 包含示例
   - 提供错误提示

### 技能设计

1. **触发条件**
   - 明确定义触发条件
   - 避免过度触发
   - 提供用户控制选项

2. **渐进式披露**
   - 主文件包含核心内容
   - 详细内容放到 examples/ 和 references/
   - 使用 Reference 机制引导 AI

3. **性能优化**
   - 避免加载不必要的内容
   - 使用条件加载
   - 控制文档大小

### 钩子设计

1. **事件选择**
   - 选择合适的事件类型
   - 避免过度干预
   - 提供禁用选项

2. **条件判断**
   - 使用精确的条件表达式
   - 避免误触发
   - 考虑边界情况

3. **性能影响**
   - 最小化钩子执行时间
   - 避免阻塞操作
   - 使用异步操作

### 文档规范

1. **README.md**
   - 清晰的插件描述
   - 完整的安装说明
   - 详细的使用示例
   - 贡献指南

2. **命令文档**
   - 使用 Markdown 格式
   - 包含使用方法和示例
   - 提供执行指令

3. **代码注释**
   - 使用中文注释
   - 解释复杂逻辑
   - 提供示例

### 版本管理

1. **语义化版本**
   - MAJOR：不兼容的 API 变更
   - MINOR：向后兼容的功能新增
   - PATCH：向后兼容的问题修复

2. **变更日志**
   - 记录每个版本的变更
   - 使用 CHANGELOG.md
   - 包含破坏性变更说明

3. **依赖管理**
   - 明确依赖关系
   - 使用版本范围
   - 定期更新依赖

## 调试技巧

### 1. 查看插件状态

```bash
# 列出已安装插件
claude-code plugin list

# 查看插件详情
claude-code plugin info my-plugin
```

### 2. 测试命令

```bash
# 直接调用命令
/my-command

# 查看命令帮助
/help my-command
```

### 3. 调试技能

- 在技能文件中添加调试输出
- 使用 `console.log` 或注释说明执行步骤
- 测试不同触发条件

### 4. 调试钩子

- 检查钩子配置是否正确
- 验证条件表达式
- 测试不同事件触发

### 5. 日志查看

```bash
# 查看 Claude Code 日志
claude-code logs

# 查看特定插件日志
claude-code logs --plugin my-plugin
```

## 常见问题

### Q1: 插件无法加载

**可能原因：**
- `plugin.json` 格式错误
- 路径配置不正确
- 缺少必需字段

**解决方法：**
1. 验证 JSON 格式
2. 检查路径是否正确
3. 确保包含 name, version, description

### Q2: 命令无法识别

**可能原因：**
- 命令文件命名不正确
- 未在 `plugin.json` 中配置
- 命令名冲突

**解决方法：**
1. 检查文件命名（kebab-case）
2. 确认 `commands` 字段配置
3. 使用唯一的命令名

### Q3: 技能未触发

**可能原因：**
- 触发条件不明确
- 技能文件路径错误
- 技能描述不清晰

**解决方法：**
1. 明确定义触发条件
2. 检查 `skills` 字段配置
3. 优化技能描述

### Q4: 钩子不生效

**可能原因：**
- 钩子配置格式错误
- 事件类型不正确
- 条件表达式错误

**解决方法：**
1. 验证 JSON 格式
2. 检查事件类型
3. 测试条件表达式

### Q5: 插件冲突

**可能原因：**
- 命令名冲突
- 钩子冲突
- 资源冲突

**解决方法：**
1. 使用唯一的命令名
2. 检查钩子优先级
3. 避免全局资源修改

### Q6: 性能问题

**可能原因：**
- 文档过大
- 钩子执行时间长
- 频繁触发

**解决方法：**
1. 控制文档大小（<500行）
2. 优化钩子逻辑
3. 使用条件加载

## 进阶主题

### 1. 多语言支持

- 提供多语言文档
- 使用语言检测
- 支持本地化

### 2. 插件依赖

- 声明依赖关系
- 检查依赖版本
- 处理依赖冲突

### 3. 插件配置

- 提供配置选项
- 使用配置文件
- 支持用户自定义

### 4. 插件更新

- 自动检查更新
- 提供更新通知
- 支持增量更新

### 5. 插件测试

- 编写测试用例
- 自动化测试
- 集成测试

## 相关资源

- [Claude Code 官方文档](https://docs.anthropic.com/claude-code)
- [插件开发指南](https://docs.anthropic.com/claude-code/plugins)
- [示例插件](https://github.com/anthropics/claude-code-examples)
- [问题反馈](https://github.com/qqabcv520/my-claude-marketplaces/issues)

## 贡献

欢迎贡献改进建议和示例！请参考 [CONTRIBUTING.md](./CONTRIBUTING.md)。

---

**最后更新：** 2025-12-26
**维护者：** mifan
