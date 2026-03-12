---
name: ps-exec
description: 执行 /ps-plan 创建的计划，支持分阶段执行、subAgent 协调和进度追踪
argument-hint: 可选 计划文件路径

---

# 计划执行命令

此命令用于执行 `/ps-plan` 创建的计划文件。目标不是“自己写代码”，而是**稳定编排执行、持续写回 task.md、完成全局验证和独立 review，再做收尾**。

## 使用方法

```bash
/ps-exec [可选：计划文件路径]
```

示例：

```bash
/ps-exec docs/spec/20260311-1030-user-auth.md
/ps-exec
```

## 执行铁律

1. **优先续执**：先检查 `docs/spec/*.task.md`，有 `进行中` 或 `已暂停` 的任务时，优先继续最近更新的那个。
2. **主 Agent 只负责编排与收口**：主 Agent 负责选计划、建 worktree、维护 task.md、做全局验证、发起独立 review、处理 merge/PR/暂停。
3. **`project-spec:implement` 只做局部验证**：subAgent 只能验证与当前步骤改动直接相关的 lint、typecheck、测试，不做全量验证。
4. **`ps-exec` 必做全局验证**：所有步骤完成后，主 Agent 必须运行项目级完整验证链路。
5. **失败步骤阻断后续依赖**：任一步骤失败或局部验证失败时，**不得**解锁依赖它的后续步骤；只能重试该步骤或暂停。
6. **task.md 必须实时写回**：步骤状态、全局验证记录、独立 Review 记录都要立即写回；不要批量补写。
7. **`已完成` 只能最后写**：只有全局验证通过、独立 review 结束、并且收尾动作成功或用户明确选择“标记执行完成”后，才能把 task.md 写成 `已完成`。
8. **原地执行模式不做自动 Git 收尾**：没有 worktree / branch 信息时，可以执行实现、验证、review，但**不执行自动 merge 或自动创建 PR**。

---

## 标准执行主路径

### 1. 续执检查与计划定位

按以下顺序处理：

1. 搜索 `docs/spec/*.task.md`
2. 读取 frontmatter 中的 `status` 和 `updated`
3. 如果有 `进行中` 或 `已暂停` 的任务：
   - 选择最近更新的 task.md
   - 显示任务名称、来源计划、当前进度、最后更新时间
   - 直接进入“第 4 步：批次执行步骤”
4. 如果没有未完成 task.md：
   - 如果用户传入了计划路径，直接使用
   - 否则搜索 `docs/spec/*.md`，并排除 `*.task.md`
   - 如果找到多个计划文件，使用 `AskUserQuestion` 让用户选择
   - 如果一个也没有，提示用户先运行 `/ps-plan`

frontmatter 解析格式：

```yaml
---
source: docs/spec/xxx.md
status: 进行中 | 已完成 | 已暂停
created: 2025-01-03T10:00:00
updated: 2025-01-03T12:30:00
branch: feature/20260311-1030-user-auth
worktree: /absolute/path/to/project-20260311-1030-user-auth
base_branch: main
---
```

### 2. 确定执行目录

目标：优先在隔离 worktree 中执行；无法使用 Git 时，允许降级到原地执行模式。

#### 2.1 已有 worktree 的续执

- 如果续执的 task.md frontmatter 里已有 `worktree`，直接复用该 worktree
- 如果 `worktree` 为空，说明之前就是原地执行模式，本次继续在当前项目目录执行

#### 2.2 新任务的 worktree 判定

按以下顺序处理：

1. 运行：

```bash
git rev-parse --is-inside-work-tree
```

2. 如果 Git 可用：
   - 记录当前分支：

```bash
git branch --show-current
```

   - 用 `git rev-parse --show-toplevel` 获取项目根目录
   - 分支名使用：`feature/<计划文件名去掉 .md>`
   - worktree 路径使用：`<项目根目录同级>/<项目目录名>-<计划文件名去掉 .md>`
   - 创建 worktree：

```bash
git worktree add "<WORKTREE_PATH>" -b "<BRANCH_NAME>"
```

   - 如果分支已存在，重试：

```bash
git worktree add "<WORKTREE_PATH>" "<BRANCH_NAME>"
```

   - 创建后运行：

```bash
git worktree list
```

3. 如果 Git 不可用或 worktree 创建失败：
   - 使用 `AskUserQuestion` 询问：继续执行 / 中止执行
   - 用户选择继续时，进入**原地执行模式**
   - 原地执行模式下 `branch`、`worktree`、`base_branch` 留空

#### 2.3 worktree 初始化

仅在**首次创建 worktree**时执行：

1. 检查项目根目录是否存在 `worktree.yaml`
2. 如果存在：
   - 执行 `copy` 列表
   - 执行 `post_create` 列表
3. 如果不存在：
   - 由 AI 根据项目类型完成最小必要初始化
4. `post_create` 默认超时为 `600000ms`
5. 任一命令失败时，使用 `AskUserQuestion` 询问：继续执行 / 中止执行

### 3. 初始化或读取 task.md

如果是新任务，创建与计划文件同目录的 `.task.md` 文件。

来源计划需要读取：

- `## 5. 执行步骤`
- `### 步骤依赖`
- `## 8. 注意事项`

步骤依赖规则：

- 依赖为 `-`：可直接执行
- 依赖为某些步骤：必须等这些步骤全部完成
- 步骤内部任务始终顺序执行

task.md 至少包含以下结构：

```markdown
---
source: [计划文件路径]
status: 进行中
created: [当前时间]
updated: [当前时间]
branch: [分支名；原地执行模式留空]
worktree: [worktree 绝对路径；原地执行模式留空]
base_branch: [基础分支；原地执行模式留空]
---

# 任务执行：[任务名称]

## 📋 概览

| 项目 | 值 |
|------|-----|
| 来源计划 | [计划文件名] |
| 总任务数 | [N] |
| 已完成 | 0/[N] |

## 📝 TODO 列表

### 步骤 1：[步骤名称]

| 状态 | 编号 | 任务 | 文件 |
|------|------|------|------|
| ⏳ | 1.1 | [任务描述] | `path/to/file` |

## 📊 统计

| 指标 | 值 |
|------|-----|
| 开始时间 | [当前时间] |
| 当前耗时 | 0min |
| subAgent 次数 | 0 |

## ✅ 全局验证记录

- 状态：待执行
- 执行目录：-
- 执行命令：-
- 结果摘要：-

## 🧾 独立 Review 记录

- 状态：待执行
- Review 方式：-
- 结果摘要：-
- 后续动作：-
```

状态标记：

- `⏳` 待执行
- `🔄` 执行中
- `✅` 已完成
- `❌` 失败

### 4. 批次执行步骤

#### 4.1 启动当前批次

按步骤依赖图找出当前可执行批次：

- 前置依赖全部满足的步骤，视为当前批次
- 同一批次的所有步骤必须在**同一个响应**里同时启动 subAgent

使用 `project-spec:implement` subAgent，传入：

- 计划文件绝对路径
- task.md 绝对路径
- worktree 路径（如有）
- 当前分支（如有）
- 当前步骤内所有任务描述和文件路径
- 一条明确要求：**只做与本步骤改动直接相关的局部验证，并写清验证范围**

示例：

```text
Agent(
  subagent_type: "project-spec:implement",
  description: "执行步骤N：[步骤名称]",
  prompt: "
    计划文件：[plan.md 绝对路径]
    任务文件：[task.md 绝对路径]
    worktree 路径：[worktree 绝对路径，如有]
    当前分支：[分支名，如有]

    请执行以下步骤的任务：
    [步骤内所有任务的描述和文件路径]

    只运行与本步骤改动直接相关的局部验证，并在结果中写明验证范围。
  ",
  run_in_background: true
)
```

启动后：

- 将该步骤状态更新为 `🔄`
- 记录当前批次全部 `task_id`

#### 4.2 等待并汇总当前批次

对当前批次的每个 `task_id` 依次调用：

```text
TaskOutput(task_id: "<task_id>", block: true, timeout: 600000)
```

**必须等当前批次全部 `task_id` 返回结果后，才能做下一步判断。**

#### 4.3 批次门禁

读取每个 subAgent 的执行结果后：

1. 更新对应任务状态
2. 检查局部验证结果
3. 汇总失败原因并写回 task.md

**门禁清单：**

- 当前批次所有步骤都成功了吗？
- 局部验证都通过了吗？
- 失败原因都写回 task.md 了吗？

如果全部通过：

- 解锁下一批步骤
- 重复第 4 步直到所有步骤完成

如果任一步骤失败：

- **不得**解锁依赖它的后续步骤
- 使用 `AskUserQuestion` 询问：重试失败步骤 / 暂停执行
- 选择重试时，只重跑失败步骤
- 选择暂停时，把 task.md 状态写为 `已暂停`

### 5. 全局验证

**重复提醒：这里是项目级完整验证，不是 subAgent 的局部验证。**

#### 5.1 确定验证命令

优先级如下：

1. 如果 `worktree.yaml` 存在且包含 `verify`：
   - 直接执行 `verify` 列表中的所有命令
2. 否则，按项目入口推断全局验证命令，至少检查：
   - `package.json`
   - `pyproject.toml`
   - `Cargo.toml`
   - `go.mod`
   - `Makefile`
3. 如果仍无法推断出可靠命令：
   - 明确告知用户
   - 使用 `AskUserQuestion` 询问：提供验证命令 / 跳过全局验证

#### 5.2 运行全局验证

在 `<WORKTREE_PATH>` 或当前项目目录中，按顺序执行完整验证链路。

要求：

- 不能只跑单一步骤相关的子集
- 所有命令返回 0 才算通过
- 如果有人工验证项，也要给出待验证列表

#### 5.3 写回 `## ✅ 全局验证记录`

全局验证结束后，**必须立即**更新 task.md 中的 `## ✅ 全局验证记录`：

- 状态：通过 / 失败 / 已跳过
- 执行目录：`<WORKTREE_PATH>` 或当前项目目录
- 执行命令：按实际顺序逐条列出
- 结果摘要：记录各命令结果和关键错误
- 手动验证项：记录已完成项或待办项

如果全局验证失败：

- 先写回失败记录
- 再决定是否进入修复
- **此时不要写 `已完成`**

#### 5.4 全局验证门禁

**门禁清单：**

- 是否已经写入 `## ✅ 全局验证记录`？
- 是否已经确认这是全量验证而不是局部验证？
- 全局验证失败时，是否阻止了 `已完成` 状态？

### 6. 独立 Review

**重复提醒：Review 必须独立执行；主 Agent 不直接评判自己的实现质量。**

#### 6.1 启动独立 Review

优先级如下：

1. 如果安装了 `codex`：

```bash
codex --version
```

   - 优先使用 `codex exec`
   - 在**本次执行目录**下写入临时输出文件，例如 `tmp/codex-review.txt`
   - 读取 review 结果

2. 如果 `codex` 不可用：
   - 如果环境支持**不继承主 Agent 上下文**的独立 review subAgent，则使用该 subAgent
   - 如果环境不支持，则使用 `AskUserQuestion` 询问：暂停等待人工 review / 跳过独立 review

独立 subAgent 示例：

```text
Agent(
  subagent_type: "[环境支持的独立 review Agent 类型]",
  description: "独立Review：计划与实现对比",
  prompt: "[PROMPT]"
)
```

Review 提示词至少要求它检查：

- 计划是否完成
- 代码是否有明显问题
- 全局验证是否通过
- 文档是否同步
- 是否存在冗余代码

并要求它在以下目录查看变更：

- 有 worktree 时：worktree 目录
- 原地执行模式时：当前项目目录

#### 6.2 写回 `## 🧾 独立 Review 记录`

拿到 review 结果后，**必须立即**更新 task.md 中的 `## 🧾 独立 Review 记录`：

- 状态：通过 / 有问题需修复 / 已跳过 / 无法执行
- Review 方式：`codex` / 独立 review subAgent / 人工 review
- 结果摘要：核心结论和主要问题
- 后续动作：自动修复 / 人工确认 / 无需处理

#### 6.3 Review 后的分流

如果 review 通过：

- 直接进入“第 7 步：收尾”

如果 review 发现问题：

- 提取问题列表
- 必要时启动 `project-spec:implement` subAgent 修复
- 修复后必须重新执行：
  - 第 5 步全局验证
  - 第 6 步独立 Review
- 并刷新 `## ✅ 全局验证记录` 与 `## 🧾 独立 Review 记录`

如果主 Agent 判断 review 意见不正确：

- 必须有明确代码或验证证据
- 必须把跳过理由写入 `## 🧾 独立 Review 记录`
- 如果无法证明，则暂停并询问用户

#### 6.4 Review 门禁

**门禁清单：**

- 是否已经写入 `## 🧾 独立 Review 记录`？
- review 有问题时，是否重新跑了全局验证？
- 没有独立 review 结果时，是否阻止了 `已完成` 状态？

### 7. 收尾与状态写回

#### 7.1 询问下一步

有 worktree / 分支信息时，使用 `AskUserQuestion` 提供：

- 合并到基础分支
- 创建 Pull Request
- 暂不处理

原地执行模式时，使用 `AskUserQuestion` 提供：

- 标记本次执行完成，保留当前目录改动
- 暂停处理

#### 7.2 执行收尾动作

有 worktree / 分支信息时：

- 合并到基础分支：
  - 在原项目根目录切换到 `<BASE_BRANCH>`
  - 执行 `git merge --no-ff "<BRANCH_NAME>" -m "feat: merge <BRANCH_NAME>"`
  - 成功后把 task.md 写为 `已完成`
- 创建 Pull Request：
  - 在 `<WORKTREE_PATH>` 下执行 `git push -u origin "<BRANCH_NAME>"`
  - 执行 `gh pr create ...`
  - 成功后把 task.md 写为 `已完成`
- 暂不处理：
  - task.md 写为 `已暂停`

原地执行模式时：

- 标记执行完成：
  - 不执行 merge / push / PR
  - task.md 写为 `已完成`
  - 明确告知用户当前目录仍保留本地改动
- 暂停处理：
  - task.md 写为 `已暂停`

#### 7.3 最终门禁

**写 `已完成` 前必须再次确认：**

- 全局验证已经通过或被用户明确允许跳过
- 独立 review 已完成或被用户明确允许跳过
- `## ✅ 全局验证记录` 已更新
- `## 🧾 独立 Review 记录` 已更新
- 当前收尾动作已经成功，或用户明确选择“标记执行完成”

---

## 附录：异常与降级处理

### A. 计划文件不存在

输出：

```text
❌ 找不到计划文件：[路径]

请先运行 /ps-plan 创建计划，或指定正确的计划文件路径。
```

### B. Git 不可用

处理规则：

- 可询问用户是否继续
- 用户继续时进入原地执行模式
- 原地执行模式下**不执行自动 merge / PR**

### C. worktree 创建失败

处理顺序：

1. 如果是分支已存在，先重试不带 `-b`
2. 仍失败时，询问：继续原地执行 / 中止执行

### D. 全局验证失败

处理规则：

- 先写 `## ✅ 全局验证记录`
- 再决定是否修复
- 没修复前**不得**写 `已完成`

### E. 独立 Review 无法执行

处理规则：

- 询问：暂停等待人工 review / 跳过独立 review
- 如果跳过，必须把原因写入 `## 🧾 独立 Review 记录`
- 没有记录就**不得**收尾

### F. PR 或 merge 失败

处理规则：

- 保留当前 worktree / 分支
- 把 task.md 写为 `已暂停`
- 输出失败原因和建议的人工处理方式

---

## 注意事项

1. 本命令的第一优先级是让执行过程**可续执、可审计、可收口**，不是缩短单次响应。
2. 主路径优先，附录兜底；不要在正常流程中反复展开边缘分支。
3. 对必须执行的内容，优先使用：
   - 顶部铁律
   - 关键节点重复提醒
   - 少量 **加粗**
   - 门禁清单
4. 不要在 task.md 中只写结论；要写清验证命令、review 方式、失败原因和后续动作。
