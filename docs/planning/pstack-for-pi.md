# pstack-for-pi：迁移调研与实施规划

- 上游：`cursor/plugins` 的 `pstack`，版本 `0.15.48`，pin 到 commit `b7b93c3`（2026-11-26）
- 目标仓库：`Wade11s/skills`（当前为空仓库，遵循 [vercel-labs/skills](https://github.com/vercel-labs/skills) 的目录与发现规则）
- 目标 agent：Pi（本文基于本机 Pi `1.6.1` 的文档、源码与已装扩展实测）
- 结论：**可迁移，且 70% 以上是机械改写**。真正需要设计的只有 4 块：子代理协议、模型角色配置、跨技能调用方式、Cursor 专有能力的取舍。

---

## 0. 摘要

| 指标 | 数值 |
|---|---|
| 上游 skill 数 | 59（另有 `automations/benny` 3 个、2 个 agent persona） |
| 上游 SKILL.md 总量 | 1,989 行 |
| playbook | 22 个，共 320 行；其中 15 个零改动 |
| principles | 24 个，单个 9–21 行 |
| 需要实质适配的 SKILL.md | 17 个；其余 40 个只改名称/引用；2 个移除 |
| 跨技能引用待改写 | ≈267 处 `/name`、45 处 `**name** skill`、54 处 `../name/` |
| 建议 v1 交付 | 57 个 skill（59 − `make-bot-ui` − `ketchup-video`），2 个 agent 文件降为 references |
| 建议工作量 | 约 5 个专注工作日，可按 skill 组并行 |

推荐方案一句话：**`skills/pstack-pi/pstack-*/`（`setup-pstack` 例外）+ 双通道分发（`npx skills add` 与 `pi install`）+ 一份 `docs/harness/pi.md` 适配层 + 用户从 scoped models 指定的 `~/.pi/agent/pstack-models.json`（同 family 最近 → `fallback[角色族]` → 停止）+ `.pstack/<slug>/todo.md` 状态文件 + 子代理三级降级（rex → headless `pi --mode json` → 串行内联）**。

---

## 1. 上游调研

### 1.1 vercel-labs/skills 的"架构与规则"到底是什么

该仓库本身主要是一个 CLI（`npx skills`），"架构"指的是它约定并强制的 skill 仓库形态：

- **权威形态**：`skills/<name>/SKILL.md`，目录名 = `name`，YAML frontmatter 至少含 `name`、`description`。
- **必需字段**：`name`（小写、数字、连字符，≤64 字符）、`description`（≤1024 字符）。
- **可选字段**：`license`、`compatibility`、`metadata`（含 `metadata.internal: true` 隐藏技能）、`allowed-tools`、`disable-model-invocation`。
- **发现规则**：从仓库根的 `skills/` 往下最多 3 层；`skills/<category>/<name>/` 与 `skills/<category>/<category>/<name>/` 都合法；同名只保留第一个。
- **扩展点**：`skills.sh.json` 的 `paths` 可指向自定义容器目录；`.claude-plugin/marketplace.json` 或 `plugin.json` 声明的路径不受 3 层限制。
- **无构建**：skill 就是文件树，脚本随目录走（`scripts/`、`references/`、`assets/` 是惯例，不是规范）。
- **分发**：`npx skills add <owner>/<repo>`，本仓库场景对应 `npx skills add Wade11s/skills`。
- **`skills` CLI 原生支持 `pi`**：`pi` 的安装目标是 `.agents/skills/`（项目）与 `~/.agents/skills/`（`-g`），正好是 Pi 原生读取的位置。**这是两条分发通道能共存的前提。**

含义：仓库不需要 `package.json` 才能被 `skills add`；但只要加一个 `pi` 字段，同一个仓库同时成为 Pi 包。这是"一个仓库、两种安装方式"的最低成本做法。

### 1.2 pstack 的结构与运行机制

```
pstack/
├── skills/            59 个 skill，全部 disable-model-invocation: true（只有 setup-pstack 例外）
├── agents/            poteto-agent（= delegate 人格）, comment-sicko（= 评论警察人格）
├── docs/guide/        10 页使用指南（1,178 行 + 图片）
├── docs/harness/      claude-code.md：Cursor→Claude Code 适配层（现成的样板）
└── automations/benny/ 3 个 skill：云端自动化（triage / reproduce / setup）
```

运行模型（关键，决定了迁移方式）：

1. 用户 `/poteto-mode <task>`，`poteto-mode/SKILL.md` 是唯一的编排器；
2. 它把任务匹配到一个 `playbooks/<x>.md`，把步骤抄进 todo list；
3. 步骤触发时，它按名字调用其它 skill（如 **architect**、**arena**、**unslop**）；
4. 需要并行时用 `Task` 工具 spawn `poteto-agent` 子代理，模型由 `~/.cursor/rules/pstack-models.mdc` 的按角色行决定；
5. 需要"人格"时 spawn `comment-sicko` 这类 agent 定义。

因此**迁移的核心不是 59 个文件，而是这 5 条运行路径**。上游自己也为 Claude Code 写了同样的适配层（`docs/harness/claude-code.md`），其策略可以直接借用：不改上游语义，只换工具名、路径名、模型名，Cursor 专有能力一律"跳过并说明一行"。

### 1.3 Cursor 依赖面（实测计数）

在 `skills/**/*.md`（已排除 `test/`、`corpus/`）里统计：

| 依赖 | 命中文件 | 命中次数 | 说明 |
|---|---|---|---|
| 子代理概念（subagent / Task） | 28 | 46+ | 核心机制，必须适配 |
| `Task` 工具显式调用 | 6 | 10 | poteto-mode、arena、swarm、how、no-comments、setup-pstack |
| `**name** skill` 跨技能调用 | 26 | 45 | 需改成"读同目录 SKILL.md" |
| `/name` 命令引用 | 59 | 267 | 需改成 `/skill:pstack-<name>` |
| `../name/` 相对路径 | 37 | 54 | 改名后需批量改写 |
| 模型 slug（opus/fable/gemini/grok） | 10 | 55 | setup-pstack 独占 34 |
| `~/.cursor/...` 路径 | 14 | 26 | 规则/技能/transcripts 路径 |
| todolist / todo list | 7 | 9 | Pi 无 todo 工具 |
| `AskQuestion` | 3 | 5 | Pi 无结构化提问工具 |
| `environment: "cloud"` | 1 | 1 | 云执行，需本地化 |
| Bugbot | 3 | 15 | 云端评审机器人，移除 |
| cursor-team-kit（`/deslop`、`control-ui`、`control-cli`） | 5 | 19 | 外部插件，移除或替代 |
| Cursor Automations / webhook / SendToUser | 3 | 3 | 云端，移除 |
| MCP 引用 | 3 | 5 | Pi 有 MCP，保留 |

按"实质适配工作量"排序：`setup-pstack`(37) > `poteto-mode`(23) > `automate-me`(17) > `arena`(12) > `poteto-help`(11) > `swarm`(7) > `recall`(4) > 其余 ≤3。**42 个 SKILL.md 的 Cursor 专有 token 计数为 0**，其中 `ketchup-video` 因非文本原因移除，故实际保留 40 个 + 适配 17 个 + 移除 2 个 = 59。

---

## 2. Pi 侧能力盘点与差距

### 2.1 可用原语（实测）

| 能力 | Pi 现实 |
|---|---|
| 技能加载 | `~/.pi/agent/skills/`、`.pi/skills/`、`~/.agents/skills/`、`.agents/skills/`，递归发现，`SKILL.md` 为单元 |
| 显式调用 | `/skill:<name> [args]`，args 作为 user request 追加（等价 Cursor 的"技能挂到消息上"） |
| 隐藏技能 | `disable-model-invocation: true` 的技能**完全不进 system prompt**，只能用 `/skill:` 调（源码已确认） |
| 子代理 | 本机唯一合规机制是 `pi-rex-subagent` 扩展：`rex_spawn` / `rex_wait` / `rex_stop`，子进程是完整 Pi TUI |
| 子代理参数 | `prompt`、`name`、`group`、`cwd`、`provider`、`model`、`thinking`、`tools`、`excludeTools` |
| 模型枚举 | scoped models：`enabledModels` + `pi --list-models` 求交（技能无内置命令，需 `scripts/models.mjs`） |
| 会话内自省 | 环境变量 `PI_SESSION_FILE`、`PI_SESSION_ID`、`PI_PROVIDER`、`PI_MODEL`、`PI_REASONING_LEVEL` |
| 历史会话 | `~/.pi/agent/sessions/--<cwd 中 / \\ : 替换为 ->--/<ts>_<id>.jsonl` |
| 全局规则 | `~/.pi/agent/AGENTS.md`（每会话注入） |
| 长任务 | `pi-goal` 扩展：`/goal`、`create_goal`/`update_goal`（仅用户显式要求时可用） |
| 其它 | MCP、codemode、prompt templates、`/reload`；**无** Task、**无** TodoWrite、**无** AskQuestion、**无** `/loop` |

### 2.2 缺口与降级策略

| 缺口 | 降级策略 |
|---|---|
| 无 `Task` 工具 | 有 rex 则 `rex_spawn`；无 rex 则"串行内联执行 + 一句说明"。技能文本写成两分支，不假装有子代理 |
| 无 typed subagent（`poteto-agent`、`comment-sicko`） | prompt 首行 `Read <abs>/references/<persona>.md before anything else.`，人格文件随技能走 |
| 无 `readonly` | `tools: "read,grep,find"`（不给 bash），或给 bash 但 brief 明写"只读"并在事后 `git status` 核对 |
| 无 `environment: cloud` / `cloud_base_branch` | 一律本地；需要隔离就 `cwd` 指向 worktree（`git worktree add`），与上游 arena 的"各自输出目录"要求天然吻合 |
| 无 `AskQuestion` | 用正文里的编号选项提问；且遵循上游 **never-block-on-the-human**：可逆的事直接做并说明 |
| 无 todo 工具 | `.pstack/<slug>/todo.md` + `scripts/todo.sh`（init/add/done/open/check），阶段技能强制读写；长任务可叠加 `/goal` |
| 无 `/loop` | 删除；或由用户开 `/goal --budget N` 驱动 |
| 模型 | `provider` + `model` + `thinking`（`off|minimal|low|medium|high|xhigh|max`），只接受 scoped models 里的 id |
| rules 目录 | `~/.pi/agent/pstack-models.json`（技能按需读，不进全局 prompt），可选在 `AGENTS.md` 加一行指针 |
| Bugbot / Automations / webhook / Bot UI | 直接移除（见 §3.9） |
| `cursor-team-kit` 的 `/deslop`、`control-ui`、`control-cli` | `/deslop` 无对应物：删除该步骤；`control-*` 由 `create-verification-skill` 生成的"项目内验证技能"替代 |
| `create-skill`（Cursor 内置） | 由 `pstack-authoring-a-skill` playbook 承担（上游已有），删除 `create-skill` 引用 |

### 2.3 Cursor → Pi 核心映射表

这张表会成为 `docs/harness/pi.md` 的正文，也是每个 skill 改写时的判据。

| Cursor | Pi |
|---|---|
| `Task` + `subagent_type: generalPurpose` | 一级：`rex_spawn({prompt, name, group})`；二级：headless `pi --mode json -p --no-session` |
| `subagent_type: poteto-agent` | 同左，kickoff 首行读 `pstack-poteto-mode/references/poteto-agent.md` |
| `subagent_type: comment-sicko` | 同左，读 `pstack-no-comments/references/comment-sicko.md` |
| `model: "claude-opus-5-5-xhigh-fast"` | `{provider, model, thinking}` 三段，查角色行 |
| `readonly: true` | rex：`tools: "read,grep,find"`；headless：`--tools read,grep,find` |
| `run_in_background: true` | rex 默认后台，删掉该字段 |
| `resume` | `rex-subagent send <handle> ...` |
| `environment: "cloud"` / `cloud_base_branch` | 删除；用 `cwd` 指向 worktree |
| 读另一个 pstack skill | `read <abs>/skills/pstack-pi/pstack-<name>/SKILL.md`，然后照做 |
| 让用户去调 | 写成 `/skill:pstack-<name>` |
| `~/.cursor/rules/pstack-models.mdc` | `~/.pi/agent/pstack-models.json` |
| `~/.cursor/skills/`、`.cursor/skills/` | `~/.agents/skills/`、`.agents/skills/`（或 `~/.pi/agent/skills/`） |
| `agent-transcripts/<uuid>/<uuid>.jsonl` | `$PI_SESSION_FILE`；历史用 `~/.pi/agent/sessions/--<slug>--/` |
| 父模型（vendor 判断） | `$PI_PROVIDER` / `$PI_MODEL` |
| 当前思考等级 | `$PI_REASONING_LEVEL` |
| `AskQuestion` | 正文编号选项 |
| todolist | `.pstack/<slug>/todo.md` + `scripts/todo.sh`；长任务可叠加 `/goal` |

### 2.4 Pi 的子代理路径（实测）

“Pi 有没有子代理插件”这个问题有三个确定答案，迁移方案按优先级串起来：

1. **rex-subagent（本机已装）**：`rex_spawn` / `rex_wait` / `rex_stop`，子进程是完整 Pi TUI，可 `send --steer` 中途干预，参数含 `provider`、`model`、`thinking`、`tools`、`cwd`、`group`。可见、可审计、有 usage 记账。
2. **Pi 官方示例 `examples/extensions/subagent/`**：不是内置工具，而是一个可复制的扩展示例。它的实现正好是你说的那条路：`pi --mode json -p --no-session [--model <provider/id>] [--thinking <level>] [--tools read,grep,find] [--append-system-prompt <tmpfile>] "Task: ..."`，解析 JSON 事件、只把最终 assistant 文本和 usage 还给父上下文；支持单发 / 并行（最多 8 个任务、4 并发）/ 链式；带 `~/.pi/agent/agents/*.md` 的 typed agent（frontmatter 里写 `tools`、`model`）。输出上限 50KB/任务。
3. **串行内联**：不需要任何扩展，父会话自己按顺序做。

结论：P1 走 rex；P2 是 headless 兜底，P3 是内联兜底。三者共用同一份角色模型配置，所以 schema 现在就能定稿。

---

## 3. 迁移设计

### 3.1 仓库最终形态

```
.
├── README.md                  # 双语：这是什么、怎么装、skill 索引
├── AGENTS.md                  # 本仓库维护规则（新增 skill 的 checklist、禁用 token 清单）
├── LICENSE                    # MIT（本仓库）
├── NOTICE.md                  # 上游归属：pstack © 2026 Lauren Tan, MIT, 派生说明 + pin 的 commit
├── package.json               # Pi 包：keywords: ["pi-package"], pi.skills: ["./skills"]
├── plugin.json                # 可选：agent-plugins.org schema，跨 agent 生态复用同一份 skills
├── docs/
│   ├── guide/                 # 从上游 10 页精简（去掉云端/团队协作章节）
│   ├── harness/pi.md          # 适配层：§2.3 + rex 协议 + 模型解析算法
│   └── planning/pstack-for-pi.md
├── skills/
│   └── pstack-pi/
│       ├── pstack-poteto-mode/{SKILL.md, worker.md, playbooks/*.md, references/*.md}
│       ├── pstack-principle-*/    # 24 个，保持独立 leaf
│       ├── setup-pstack/          # 例外：保留原名
│       ├── ...
│       └── pstack-statechart/{SKILL.md, scripts/, references/}
└── scripts/
    ├── validate-skills.mjs    # 见 §4 Phase 0
    └── upstream-diff.mjs      # 上游同步辅助
```

要点：

- **分类目录 `skills/pstack-pi/`**：`skills` CLI 对 `skills/` 容器走 3 层（`skills/<category>/<name>/SKILL.md` 是第 2 层），Pi 包则递归发现，两者都认。硬约束：**分类目录里绝不能有 `SKILL.md`**（会 shadow 掉下面全部），也不能再嵌第 4 层。
- **一个仓库、两种装法**：`npx skills add Wade11s/skills -g --agent pi`（装到 `~/.agents/skills/`，**分平后分类目录消失**）或 `pi install git:github.com/Wade11s/skills`（保留树）。文档明确“二选一”，避免同名重复。
- **`docs/` 不参与 skill 发现**，可以放任意多文档。

### 3.2 命名方案（已定：B + `setup-pstack` 例外）

`skills/pstack-pi/pstack-<upstream>/`，frontmatter `name: pstack-<upstream>`；唯一例外是 `setup-pstack`，目录和 name 都保留原名。

不变式（写进 validator）：`name === "pstack-" + basename(dir)`，白名单只放 `setup-pstack`。

选 B 的理由：目录名与命令名一致，不会出现“路径与 `/skill:` 对不上”；Pi、`skills` CLI、`pi install` 三处的安装目录都以 frontmatter `name` 为准，一致即无歧义。代价是路径变长（`skills/pstack-pi/pstack-poteto-mode/playbooks/...`），以及上游映射需要一条“去 `pstack-` 前缀”的确定性规则 + `setup-pstack` 一个例外。

备选 A（目录保留上游名、只给 name 加前缀）依然能被两个工具链正确安装，但目录≠名字会让维护者反复对照，故不采用。

### 3.3 分发与安装

```bash
# 生态侧（推荐，Pi 原生读 ~/.agents/skills/）
npx skills add Wade11s/skills -g --agent pi

# Pi 包侧（可选，整仓安装，便于 /reload 与版本锁定）
pi install git:github.com/Wade11s/skills@v0.1.0
```

`npx skills add` 会写 `skills-lock.json`（本地）并支持 `check`/`update`，对上游追踪友好；`pi install` 走 git 包，适合"我要整包 + 固定版本"。两者互斥使用。

### 3.4 适配层：9 条硬规则

写进 `docs/harness/pi.md`，并在需要的地方以一句话回指（不要每处重复整段）：

1. **技能互调**：不要依赖技能目录；`read <pstack 根绝对路径>/pstack-<name>/SKILL.md` 然后执行。给用户的说法一律 `/skill:pstack-<name>`（`setup-pstack` 例外）。
2. **子代理三级**：会话里有 `rex_*` 工具就用 rex；没有则 headless `pi --mode json -p --no-session`（见 §3.5）；两者都没有就串行内联并说明。
3. **每个 kickoff 的第一行**：`Read <abs>/pstack-poteto-mode/worker.md before anything else.`（保留上游设计：operator 规则只从文件到达子代理）。
4. **模型角色**：读 `~/.pi/agent/pstack-models.json`；缺省则跑 `setup-pstack` 的角色选择；解析链是同 family 最近 → `fallback[角色族]` → 停下报错。
5. **只读**：用工具白名单表达，不靠嘱咐。
6. **清理**：拿到结果并核对后 `rex_stop {handle, remove: true}`。这是 Pi 侧新增的硬要求（上游无此概念），要写进 swarm/arena/autopilot 的收尾步骤。
7. **并发上限**：默认同时 ≤4 个子代理，超出排队。上游的 "N 路并行" 保留语义，但给出这个上限。
8. **Cursor 专有**：删，不写“跳过”——因为本仓库只服务 Pi，不需要保留运行期降级路径（与上游 claude-code 适配层不同）。
9. **分类目录洁净**：`skills/pstack-pi/` 下不得出现 `SKILL.md`，也不得再用第 4 层目录。validator 强制。

### 3.5 子代理协议（已定：rex → headless → 内联 三级）

三个适配器共享同一份 brief 与同一份角色模型配置，技能正文只写“按 `docs/harness/pi.md` 委托”，不写具体工具。

**P1 rex**

- `group`：一次 objective 一个 Session（如 `pstack-<task-slug>`）；`name` 用角色名（`arena-runner-1`、`judge`、`verifier-a`）。
- 结构化的 brief 模板放进 `pstack-poteto-mode/references/brief.md`（由现有 Subagents 段落 + worker.md 提炼），所有 spawn 都引用它，避免 6 个文件各写一版。
- `swarm` / `arena` / `interrogate` 的“一次消息里 spawn N 个” → 一轮内连续多次 `rex_spawn`，然后 `rex_wait {handles, any: true}` 收结果，逐批处理。
- 竞速/评审需要“不同厂商”：用 `$PI_PROVIDER` 判断父模型厂商，从 `arena cross-judge pool` 里取第一个不同 provider 的 entry。
- `autopilot-full` 的“owner 云 agent” → 本机长期存活的 rex Tab（同一 handle 多轮 `send`），并保留“假设 VM 会死”的 push-first 纪律。

**P2 headless（无 rex 时的零依赖党底）**

```sh
pi --mode json -p --no-session \
   [--model <provider/id>] [--thinking <level>] [--tools read,grep,find] \
   [--append-system-prompt <persona-file>] \
   "Read <abs>/worker.md first. Task: <task>"
```

- 只把最终 assistant 文本和 usage 还给父会话；输出上限 50KB/任务，超长结果让子进程先写文件再回指针。
- 并发 ≤4；每个子进程独立 `--no-session`，所以“恢复/steer”不成立，需要改写 brief 重发。
- `--mode json` 的事件流需要提取末条 assistant 消息；多条并行时用后台进程 + `wait`，输出分别落临时文件。

**P3 内联**

顺序执行，回复里明写“未使用子代理”，其余步骤不变。arena 的三个候选用三个独立目录依次做，judge 由父会话自己当。

### 3.6 模型角色配置（已定：用户从 scoped models 里指定，无默认模型）

配置文件 `~/.pi/agent/pstack-models.json`，项目级 `.pi/pstack-models.json` 覆盖。角色值是 `{ provider, model, thinking }`；列表角色（`arena runners`、`arena cross-judge pool`、`interrogate reviewers`）用数组，`swarm workers` 可单值可数组。

```json
{
  "version": 1,
  "roles": {
    "feature, refactoring": { "provider": "magpie", "model": "zhipu/glm-5.4", "thinking": "xhigh" },
    "arena runners": [
      { "provider": "magpie", "model": "devin/gemini-4-neon", "thinking": "xhigh" },
      { "provider": "antigravity", "model": "claude-opus-4-6", "thinking": "xhigh" }
    ]
  },
  "fallback": {
    "code": { "provider": "magpie", "model": "zhipu/glm-5.4", "thinking": "high" },
    "judgment": { "provider": "magpie", "model": "zhipu/glm-5.4", "thinking": "high" },
    "panel": [ { "provider": "magpie", "model": "devin/gemini-4-neon", "thinking": "high" } ],
    "workers": { "provider": "magpie", "model": "zhipu/glm-5.3-flash", "thinking": "medium" }
  },
  "on_unassigned": "ask"
}
```

角色族到 `fallback` 的映射：`feature, refactoring` / `bug-fix` / `perf-issue` / `hillclimb` → `code`；`judgment and prose` → `judgment`；`arena runners` / `arena cross-judge pool` / `interrogate reviewers` → `panel`；`swarm workers` → `workers`。`panel` 是数组，按顺序补充缺座；补不满就减座并说明。

**没有默认模型，也不存在 `inherit-parent` 或 `auto` 别名。** 所有角色由用户在 `setup-pstack` 里从 scoped models 中逐项挑选；`roles` 为空时，任何要委派的步骤先跑 setup 的角色选择。

枚举来源是 **scoped models**，不是全量目录：`enabledModels`（用户 settings，项目 `.pi/settings.json` 覆盖），格式同 `--models`（精确 id / 模糊 / 大小写不敏感 glob / `:thinking` 后缀），解析后与 `pi --list-models` 的目录求交。用户级与项目级同时存在时的合并语义以实测为准，结论写进 harness。因为 `--models` 是运行期参数、技能看不到，setup 只能在设置层校验，这一点要写进文档。

解析链（保守、可测，写进 `docs/harness/pi.md`，所有委派者共用）：

1. 角色 entry 命中 scoped 集 → 用它；
2. entry 的模型不在 scoped 集 → **沿用上游的"同 family 最近"**：provider 相同、model basename 的首个字母 token 相同（`claude` / `glm` / `deepseek` / `gemini` …），在 family 内取与目标 id 最长公共前缀者，同分取短 id；thinking 原样传入，由 Pi clamp；
3. family 内无可用 → 用 `fallback[角色族]`（列表角色按 `panel` 顺序补座，补不满就减座并说明）；
4. 该族的 `fallback` 也缺 → **停下报错**，给出修复命令（`/skill:setup-pstack`）。不再有静默回退。

thinking 超出模型能力时由 Pi 自己 clamp（`--thinking` 的语义），所以不必预校验每个模型的档位；必须校验的是 id 在 scoped 集里。

`setup-pstack` 的新流程（替换上游 80 行的 slug 算术）：

1. 用 `scripts/models.mjs` 解析 scoped 集（读 settings 的 `enabledModels`，与 `pi --list-models` 求交）；
2. 逐角色展示 scoped 集，用户选；列表角色逐个选，顺序即优先级；
3. 逐角色族选 `fallback`（`code` / `judgment` / `panel` / `workers`）；
4. 校验写回：每个 id 必须在 scoped 集里，`thinking` 在七档之内；
5. 幂等覆写，并提示 `--models` 运行期作用域的局限。

### 3.7 进度：本地 todo 文件（已定：文件 + 脚本，不是 prompt 约定）

Pi 没有 todo 工具，所以用**状态文件 + 强制脚本**保证进度可信：

- 状态根：`${PSTACK_STATE_DIR:-.pstack}/<task-slug>/`，内含 `todo.md`、`decisions.tsv`（show-me-your-work）、可选 `notes.md`。
- 脚本：`pstack-poteto-mode/scripts/todo.sh`，用兄弟相对路径引用（`../pstack-poteto-mode/scripts/todo.sh`），三种安装形态都成立。
  - `todo.sh init <slug> "<title>"`
  - `todo.sh add <slug> "<text>"` → 打印编号
  - `todo.sh done <slug> <id> [--note "<note>"]`
  - `todo.sh open <slug>` → `id<TAB>text`
  - `todo.sh check <slug>` → 校验格式，非零退出即中止
- 文件格式：`<!-- pstack:todo v1 -->` 头 + 每行 `- [ ] NN text` / `- [x] NN text`，编号单调递增；脚本原子写入、幂等、拒绝重复项。
- 提交策略：默认 `.pstack/` 进 `.gitignore`；需要审计或跨机恢复的长任务（autopilot）用 `PSTACK_STATE_DIR=docs/pstack` 落到 `docs/pstack/<slug>/` 并随提交推送。
- 执行约束：每个阶段式技能第一步是 `init` 或 `open`（续跑），每个阶段结束必须 `done`；回复里的进度与文件冲突时**以文件为准**。`session-pickup` 用 `todo.sh open` 重建状态。
- v0.1 **只做文件 + 脚本**。turn 结束时校验 todo 与回复一致性的 Pi 扩展不上，等出现实际漂移再加。
- 长任务仍可叠加 `/goal`（用户自己开），但 todo 文件是步骤级的事实来源，两者不重叠。

`/loop` 不存在，且不映射：`autonomous-run` 的唤醒机制和 `autopilot` 的周期审计删除，改为"每次 owner 回报后重审，或用户检查时重审"。

### 3.8 跨技能引用改写（codemod 规格）

一次性脚本（不复用、不入库）做三件事，然后人工过 17 个高改动文件：

1. `skills/<name>/` → `skills/pstack-pi/pstack-<name>/`（git mv；`setup-pstack` 保持原名）；
2. 正文替换，按优先级：
   - `` `../<name>/` `` → `` `../pstack-<name>/` ``（54 处）
   - `**<name>** skill` → `**pstack-<name>**`（45 处）
   - `/<name>`（且 `<name>` ∈ 59 名单）→ `/skill:pstack-<name>`（≈267 处中的绝大多数，另含 `/docs`、`/tmp` 等误伤需白名单排除）
   - 排除误伤：`/tmp`、`/docs`、`/loop`、`/deslop`、`/model`、`/thinking` 用白名单过滤
3. 输出 diff 供人工审阅；`scripts/validate-skills.mjs` 兜底（§4 Phase 0）。

### 3.9 保留 / 适配 / 移除清单

**保留（只改名 + 引用改写，40 个）**：`architect`、`benchmark-checklist`、`blast-radius`、`bro`、`correct`、`in-your-own-words`、`ketchup`、`reframe`、`sharpen`、`teach`、`technical-writing`、`unslop`、`typescript-best-practices`（删 `paths` 字段，glob 并入 description）、`create-formal-verification-skill`、`maintain-formal-verification-skill`、`statechart`、24 个 `principle-*`。

**适配（17 个）**：

| skill | 主要改动 |
|---|---|
| `setup-pstack`（原名保留） | 模型段几乎重写（§3.6）；其余保留 |
| `poteto-mode` | Subagents 段、模型段、todolist、`/deslop`、`control-*`、`/loop` 全部按 §2.3 重写；principles 引用保持 |
| `poteto-help` | 267 处引用的入口，全量命令名替换；删 cursor-team-kit 相关问答 |
| `arena` / `swarm` / `interrogate` | rex spawn/wait/stop、worktree `cwd`、vendor 判断、清理步骤、并发上限 |
| `figure-it-out` | todolist → `todo.sh`；goal 语义 |
| `show-me-your-work` | transcript 路径、跨模型 review 的 provider 选择 |
| `how` / `why` / `recall` / `reflect` | 只读工具白名单、`$PI_SESSION_FILE`、历史目录、`gh` 保留 |
| `automate-me` | `.cursor/skills` → `.agents/skills`；`AskQuestion` → 正文选项；`create-skill` → 本仓 `authoring-a-skill` playbook |
| `no-comments` | comment-sicko 人格转 `references/comment-sicko.md`；`/why` 引用改写 |
| `create-verification-skill` / `maintain-verification-skill` | `.cursor` 路径、`control-ui`/`control-cli` 改为"本项目自建驱动脚本" |
| `tdd` | 少量 Cursor 措辞 |
| playbooks（7 个） | `shipping`/`autopilot-full`（cloud agent、control-*、`/loop`）、`babysit`（Bugbot）、`opening-a-pr`（`/deslop`）、`eval`、`session-pickup`、`worktree-cleanup` |

**移除（3 + 1）**：

| 上游 | 理由 |
|---|---|
| `make-bot-ui` | 绑定 Grok Bot webhook、`update_state` routine、`SendToUser`、`api2.cursor.sh`，无本地等价物 |
| `ketchup-video` | 依赖上游视频渲染链；v1 只保留 `ketchup` 的图文版（若你坚持要，Phase 5 用 ffmpeg 重建） |
| `automations/benny/*`（3 个 skill） | 云端 triage/repro 自动化，本质是 Cursor Automations 的配置说明 |
| `poteto-mode/references/bugbot-triage.md` | Bugbot 专有；`babysit` 里改成"把 bot 评论当普通 review thread 逐条判断" |
| `agents/poteto-agent.md`、`agents/comment-sicko.md` | 不是删除，转为对应技能的 `references/` 人格文件 |

### 3.10 文档、许可证、上游同步

- **文档**：`docs/guide/` 10 页 → 保留 01 setup、02 poteto-mode、03/04/05/06 主体、08 principles、09 make-it-yours、10 recipes；删 07 overnight 的 Automations/Projects 部分与团队协作段。图片 6 张可保留（2.3M，可选压缩）。
- **许可证**：本仓库根 `LICENSE` 放 MIT（自有部分）；`NOTICE.md` 明确 `skills/pstack-*` 与 `docs/guide/*` 派生自 `cursor/plugins/pstack`（MIT, © 2026 Lauren Tan），附上游 LICENSE 全文与 pin 的 commit。每个派生 SKILL.md 不重复版权头（保持上游清爽风格），归属集中在 NOTICE + README。
- **上游同步**：`UPSTREAM.md` 记录 `cursor/plugins@b7b93c3` / pstack `0.15.48`；`scripts/upstream-diff.mjs` 拉取上游 `pstack/` 并与本地按"去前缀 + 去适配差异"后的文本做对比，输出"上游有改、本地需跟"的文件清单。适配改动不做 patch 文件（文本已重写，patch 会持续冲突），只做**语义对照表**：`docs/planning/upstream-map.json` 记录 upstream 文件 → 本地文件，供人工对齐。

---

## 4. 实施计划

### Phase 0 — 骨架与护栏（0.5d）

- 建目录、`LICENSE`、`NOTICE.md`、`README` 骨架、`package.json`、`AGENTS.md`、`.gitignore`。
- `scripts/validate-skills.mjs`，检查项：
  1. 每个 `skills/*/SKILL.md` frontmatter 可解析；`name === 目录名`；`name` ≤64 且形状合法；`description` ≤1024 且非空；
  2. 禁用 token 清单为 0：`Task(`、`subagent_type`、`AskQuestion`、`Bugbot`、`api2.cursor.sh`、`.cursor/`、`cursor-team-kit`、`/deslop`、`control-ui`、`control-cli`、`environment: "cloud"`、`claude-opus-5-5`、`claude-fable-5-2`、`gemini-4-neon`、`/loop`；
  3. 所有被引用的 `.../SKILL.md` 路径存在；所有 `/skill:pstack-*` 指向已存在的 skill；
  4. 每个 `playbooks/*.md`、`references/*.md` 都被至少一个 SKILL.md 链接（防孤儿）。
- **spike**：确认 `pi -p '/skill:<x> ...'` 可无头调用（不可行则验收改为 TUI 手测 + `npx skills add ./ --list` 的本地发现校验）。

**验收**：`node scripts/validate-skills.mjs` 通过（空集合 0 error）；`scripts/models.mjs` 对 `enabledModels` 的 fixture 解析正确；`scripts/todo.sh` 的增/完/读/校验四路测试绿；`npx skills add ./ --list` 能列出 skill。

### Phase 1 — 适配层 + 核心（1.5d）

- `docs/harness/pi.md`（§2.3 + §3.4 + rex 协议 + 模型算法）。
- `pstack-poteto-mode`（含 `worker.md`、22 个 playbook、`references/brief.md`、`references/poteto-agent.md`、`references/decision-*`）。
- 24 个 `pstack-principle-*`（基本 1:1）。
- `setup-pstack`（模型段重写）、`pstack-help`（全量命令名替换）。

**验收**：用一个真实小任务跑通 `/skill:pstack-poteto-mode <task>` → 选 playbook → 读 principle → 至少一次 `rex_spawn` → `rex_stop remove:true`；setup 在三种预设下都能写出合法 JSON 且被后续技能正确读取。

### Phase 2 — 理解 / 设计类（1d）

`how`、`why`、`teach`、`recall`、`reflect`、`architect`、`arena`、`swarm`、`interrogate`、`figure-it-out`、`sharpen`、`reframe`、`bro`、`in-your-own-words`。

**验收**：`arena` 三候选 + judge（含不同 provider）+ graft 全流程跑通；`interrogate` 能给出"命令 + 输出 + 期望输出"格式的 finding；`recall` 能从 `$PI_SESSION_FILE` 与历史目录重建 brief。

### Phase 3 — 构建 / 验证类（1d）

`tdd`、`unslop`、`no-comments`（+ comment-sicko）、`technical-writing`、`typescript-best-practices`、`blast-radius`、`correct`、`benchmark-checklist`、`show-me-your-work`、`create-verification-skill`、`maintain-verification-skill`、`create-formal-verification-skill`、`maintain-formal-verification-skill`、`statechart`。

**验收**：`show-me-your-work/scripts/log.sh` 可执行并写出合法 TSV；`statechart` 脚本在无 Java/TLC 时给出清晰降级；`create-verification-skill` 能在临时 repo 生成一个可运行的 verify skill。

### Phase 4 — 文档与发布（1d）

- `README`（是什么 / 两条安装命令 / skill 索引表 / 与 pstack 的关系与差异）；
- `docs/guide/` 精简 10 页；
- `docs/harness/pi.md` 定稿；
- `NOTICE.md`、`UPSTREAM.md`、`scripts/upstream-diff.mjs`；
- 打 `v0.1.0` tag。

**验收**：全新机器路径走一遍 `npx skills add Wade11s/skills -g --agent pi` → `pi` 启动无 skill 警告 → `/skill:pstack-help` 有响应；`pi install git:...@v0.1.0` 同样可用；`npx skills check` 不报错。

### Phase 5 — 可选项（0.5d）

`ketchup-video`（ffmpeg 重建）、`statechart` test corpus 瘦身（3.9M → 可选）、把 `automate-me` 做成从 Pi 历史里挖偏好的完整流程。

**总计约 5 个专注日**；Phase 2/3 可以按 skill 组并行分给 rex 子代理（每个子代理一份 §3.4 + §2.3 作为 brief）。

---

## 5. 风险与对策

| 风险 | 影响 | 对策 |
|---|---|---|
| rex 不可用 / 用户未装 | 核心并行玩法降级 | 三级降级（rex → headless → 内联）；README 把 `pi-rex-subagent` 列为推荐依赖，`pstack-help` 首问检查 |
| 改名遗漏导致引用断链 | 用户点了不存在的命令 | codemod + validator 双重兜底；validator 进 CI（GitHub Actions） |
| Pi 的 `disable-model-invocation` 让技能不可被模型自动选中 | 与上游一致，但新用户困惑 | README 明确"pstack 是一套显式命令 + 一个编排器"，不是自动技能 |
| 子代理成本失控 | 意外花费 | 并发 ≤4、`swarm` 默认 N 上限、brief 里要求只读优先、README 给成本提示 |
| 上游持续演进 | 分叉漂移 | pin commit + `upstream-diff.mjs` + 语义对照表；不做 patch 强迫同步 |
| 许可证/归属 | 合规风险 | NOTICE 保留版权与 MIT 全文；派生说明清晰 |
| `statechart` 体积与依赖（Java/TLC） | 首次安装慢、跑不起来 | 保留但不进 v1 验收主路径；SKILL.md 增加"缺依赖时的降级"一节 |

---

## 6. 决策记录

| # | 议题 | 结论 | 备注 |
|---|---|---|---|
| 1 | 目录形态 | `skills/pstack-pi/` 分类目录 | 不得在该目录放 `SKILL.md`（会 shadow 全部） |
| 2 | 命名 | B：目录与 name 都带 `pstack-` 前缀 | `setup-pstack` 保留原名（目录与 name） |
| 3 | principles 粒度 | 与上游 1:1，24 个独立技能 | 均 `disable-model-invocation: true` |
| 4 | 子代理 | rex 优先 → headless `pi --mode json -p --no-session` → 串行内联 | 三个适配器共享 brief 与模型配置；rex 适配纳入 v0.1（issue #11） |
| 5 | 模型配置 | 用户从 scoped models 逐角色指定；schema `version: 1`；无默认、无 `inherit-parent` | 文件 `~/.pi/agent/pstack-models.json`；解析链同 family → `fallback[角色族]` → 停 |
| 6 | 进度 | `.pstack/<slug>/todo.md` + `todo.sh`；v0.1 不加硬强制扩展 | 默认 gitignore；审计跑用 `PSTACK_STATE_DIR=docs/pstack` |
| 7 | 引用 | 保留 `**x** skill` 短名，harness 一条解析规则 | validator 校验可解析 |
| 8 | 厂商专属规则 | 删除；面板由用户自选 | B1 |
| 9 | `/loop` | 不映射，删循环语义 | 代价：周期审计改为按回报/检查触发 |
| 10 | v1 范围 | 57 个 | 去掉 `make-bot-ui`、`ketchup-video` |
| 11 | 文档语言 | S1：README 双语，guide 英文，中文只做一页快速上手 | skill 正文永远英文 |
| 12 | 工单载体 | GitHub Issues（`Wade11s/skills`），英文正文，原生 `blocked-by` 边 | 标签 `ready-for-agent`；无 epic 父 issue，12 个平铺 |

以上规则落地到 `AGENTS.md`（仓库长期约束）与 `docs/harness/pi.md`（运行时约束）。

---

## 7. 工单（已发布）

| Issue | 标题 | Blocked by |
|---|---|---|
| [#1](https://github.com/Wade11s/skills/issues/1) | Scaffold the pack, the validator, and one skill end to end | None |
| [#2](https://github.com/Wade11s/skills/issues/2) | Write the Pi harness adapter spec and the repo rules | #1 |
| [#3](https://github.com/Wade11s/skills/issues/3) | Port the 24 principle skills 1:1 | #2 |
| [#4](https://github.com/Wade11s/skills/issues/4) | Port the poteto-mode orchestrator core | #2 |
| [#5](https://github.com/Wade11s/skills/issues/5) | Port the 22 playbooks | #4 |
| [#6](https://github.com/Wade11s/skills/issues/6) | Port setup-pstack and pstack-help | #2, #5 |
| [#7](https://github.com/Wade11s/skills/issues/7) | Port the understanding and recall skills | #2 |
| [#8](https://github.com/Wade11s/skills/issues/8) | Port the design skills | #2 |
| [#9](https://github.com/Wade11s/skills/issues/9) | Port the build and cleanup skills | #2 |
| [#10](https://github.com/Wade11s/skills/issues/10) | Port the verification and delivery skills | #2 |
| [#11](https://github.com/Wade11s/skills/issues/11) | Wire the rex delegation adapter across the delegating skills | #4, #5, #8, #10 |
| [#12](https://github.com/Wade11s/skills/issues/12) | Ship v0.1.0: docs, dual-channel install, release | #3, #6–#11 |

前沿（现在就能开工）：只有 **#1**。它完成后 #2 / #7 / #8 / #9 / #10 可并行（#7–#10 仍需先读 #2 的适配层）。
