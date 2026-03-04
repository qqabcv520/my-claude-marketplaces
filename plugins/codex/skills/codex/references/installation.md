# Codex CLI 安装与配置

## 安装

```bash
npm install -g @openai/codex
```

安装完成后验证：

```bash
codex --version
```

## 配置 API Key

Codex 需要 OpenAI API Key 才能运行，支持三种配置方式：

### 方式一：环境变量（推荐）

```bash
export OPENAI_API_KEY=sk-...
```

可写入 `~/.bashrc` 或 `~/.zshrc` 使其永久生效。

### 方式二：项目 .env 文件

在项目根目录创建 `.env` 文件：

```
OPENAI_API_KEY=sk-...
```

### 方式三：首次运行时交互式输入

直接运行 `codex`，首次启动时会提示输入 API Key。

## 常见问题

**command not found: codex**
→ 未安装或 npm 全局路径未加入 PATH，执行 `npm install -g @openai/codex` 后重新打开终端。

**Authentication failed / 401 错误**
→ API Key 未配置或已过期，检查 `OPENAI_API_KEY` 环境变量是否正确设置。
