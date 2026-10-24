# Personal skills

个人 Agent Skills 仓库。以 Pi 为主要开发、运行和验证工具。

技能采用标准 `SKILL.md` 格式，源码保持扁平，通过 `.claude-plugin/marketplace.json` 为 `skills` CLI 提供分组。Pi 开发时直接加载源目录，不依赖分组清单。

## 技能目录

已迁入 [pstack](https://github.com/cursor/plugins/tree/main/pstack) 的 **58 个技能**，统一登记在 `pstack` 分组，保持原名和扁平目录。通常从 `setup-pstack` 配置模型，再以 `poteto-mode` 开始任务。技能源目录内的文档、资源、模板与脚本提示均使用英文；交互遵循用户语言。

### pstack

| 技能 | 用途 |
| --- | --- |
| [`architect`](skills/architect/SKILL.md) | 先定类型、接口与模块形状，再实现。 |
| [`arena`](skills/arena/SKILL.md) | 并行比较候选方案，选择底稿并融合优点。 |
| [`automate-me`](skills/automate-me/SKILL.md) | 从已授权的工作记录提炼个人工作模式。 |
| [`benchmark-checklist`](skills/benchmark-checklist/SKILL.md) | 核验性能测量的瓶颈、误差与相关性。 |
| [`blast-radius`](skills/blast-radius/SKILL.md) | 检查变更的跨模块影响并运行验证。 |
| [`bro`](skills/bro/SKILL.md) | 把上一条消息改写成无术语的日常表达。 |
| [`correct`](skills/correct/SKILL.md) | 将反复出现的错误转成结构性约束。 |
| [`create-formal-verification-skill`](skills/create-formal-verification-skill/SKILL.md) | 为关键不变量生成项目级形式验证技能。 |
| [`create-verification-skill`](skills/create-verification-skill/SKILL.md) | 生成驱动真实应用的项目级验证技能。 |
| [`figure-it-out`](skills/figure-it-out/SKILL.md) | 为现有流程未覆盖的复杂任务设计可审计步骤。 |
| [`how`](skills/how/SKILL.md) | 解释实现结构、运行路径与职责归属。 |
| [`in-your-own-words`](skills/in-your-own-words/SKILL.md) | 执行前复述用户目标和问题。 |
| [`interrogate`](skills/interrogate/SKILL.md) | 让独立评审从不同角度挑战变更。 |
| [`ketchup`](skills/ketchup/SKILL.md) | 整理本次会话进展和待用户决策项。 |
| [`ketchup-video`](skills/ketchup-video/SKILL.md) | 用短视频和文字同步当前任务进展。 |
| [`maintain-formal-verification-skill`](skills/maintain-formal-verification-skill/SKILL.md) | 检查形式模型与代码是否漂移并修正。 |
| [`maintain-verification-skill`](skills/maintain-verification-skill/SKILL.md) | 核验应用验证技能及功能地图是否仍可信。 |
| [`make-bot-ui`](skills/make-bot-ui/SKILL.md) | 为 Grok Bot webhook 制作界面，需相应服务。 |
| [`no-comments`](skills/no-comments/SKILL.md) | 审查冗余注释及应由代码表达的约束。 |
| [`poteto-help`](skills/poteto-help/SKILL.md) | 查询技能、流程与使用方式。 |
| [`poteto-mode`](skills/poteto-mode/SKILL.md) | 严谨工程工作的入口与流程路由。 |
| [`principle-attack-the-premise`](skills/principle-attack-the-premise/SKILL.md) | 连续修复失败时直接检验共同前提。 |
| [`principle-boundary-discipline`](skills/principle-boundary-discipline/SKILL.md) | 在系统边界集中校验。 |
| [`principle-build-the-lever`](skills/principle-build-the-lever/SKILL.md) | 构建可复用、可重跑的执行或验证工具。 |
| [`principle-encode-lessons-in-structure`](skills/principle-encode-lessons-in-structure/SKILL.md) | 将教训转成可执行结构而非叠加文档。 |
| [`principle-exhaust-the-design-space`](skills/principle-exhaust-the-design-space/SKILL.md) | 比较少量竞争原型再做设计决策。 |
| [`principle-experience-first`](skills/principle-experience-first/SKILL.md) | 以用户体验而非实现便利决定取舍。 |
| [`principle-explain-the-number`](skills/principle-explain-the-number/SKILL.md) | 解释并证实每个测量数字。 |
| [`principle-fix-root-causes`](skills/principle-fix-root-causes/SKILL.md) | 修复最初失效的位置而非掩盖症状。 |
| [`principle-foundational-thinking`](skills/principle-foundational-thinking/SKILL.md) | 先选核心数据结构与共享方式。 |
| [`principle-guard-the-context-window`](skills/principle-guard-the-context-window/SKILL.md) | 控制上下文规模，保留高价值摘要。 |
| [`principle-laziness-protocol`](skills/principle-laziness-protocol/SKILL.md) | 偏向删除与能解决问题的最小变更。 |
| [`principle-make-operations-idempotent`](skills/principle-make-operations-idempotent/SKILL.md) | 让重试与中断后恢复收敛到同一结果。 |
| [`principle-migrate-callers-then-delete-legacy-apis`](skills/principle-migrate-callers-then-delete-legacy-apis/SKILL.md) | 迁移调用方并在同轮删除旧接口。 |
| [`principle-minimize-reader-load`](skills/principle-minimize-reader-load/SKILL.md) | 减少阅读跳转与需要记住的隐式状态。 |
| [`principle-model-the-domain`](skills/principle-model-the-domain/SKILL.md) | 用合适的数据结构表达领域。 |
| [`principle-never-block-on-the-human`](skills/principle-never-block-on-the-human/SKILL.md) | 在授权范围内推进可逆工作，保留确认边界。 |
| [`principle-outcome-oriented-execution`](skills/principle-outcome-oriented-execution/SKILL.md) | 直接收敛到目标架构而非维护临时兼容层。 |
| [`principle-prove-it-works`](skills/principle-prove-it-works/SKILL.md) | 用真实产物证明结果而非仅自述。 |
| [`principle-redesign-from-first-principles`](skills/principle-redesign-from-first-principles/SKILL.md) | 将新需求视作初始前提重新审视设计。 |
| [`principle-separate-before-serializing-shared-state`](skills/principle-separate-before-serializing-shared-state/SKILL.md) | 先消除共享，再为必要共享串行化。 |
| [`principle-sequence-verifiable-units`](skills/principle-sequence-verifiable-units/SKILL.md) | 将工作与交付切成逐步可验证的单元。 |
| [`principle-subtract-before-you-add`](skills/principle-subtract-before-you-add/SKILL.md) | 添加前先移除冗余与死代码。 |
| [`principle-test-behavior-not-implementation`](skills/principle-test-behavior-not-implementation/SKILL.md) | 断言可观察行为而非内部实现形状。 |
| [`principle-type-system-discipline`](skills/principle-type-system-discipline/SKILL.md) | 通过类型排除非法状态。 |
| [`recall`](skills/recall/SKILL.md) | 从授权历史与当前状态恢复工作上下文。 |
| [`reflect`](skills/reflect/SKILL.md) | 从任务经验提炼现有技能的具体修改。 |
| [`setup-pstack`](skills/setup-pstack/SKILL.md) | 选择项目级或全局级模型偏好并确认写入。 |
| [`sharpen`](skills/sharpen/SKILL.md) | 改写更深入但不扩大范围的任务提示词。 |
| [`show-me-your-work`](skills/show-me-your-work/SKILL.md) | 保存可复查的决策证据 TSV。 |
| [`statechart`](skills/statechart/SKILL.md) | 用 TLA+ 与 Mermaid 展示状态流转和反例。 |
| [`swarm`](skills/swarm/SKILL.md) | 按覆盖面或竞赛划分工作并汇总结果。 |
| [`tdd`](skills/tdd/SKILL.md) | 先证明测试失败，再修复并回归。 |
| [`teach`](skills/teach/SKILL.md) | 结合实现与动机解释一个系统或变更。 |
| [`technical-writing`](skills/technical-writing/SKILL.md) | 按读者与文档用途组织技术写作。 |
| [`typescript-best-practices`](skills/typescript-best-practices/SKILL.md) | 以 TypeScript 类型表达领域约束。 |
| [`unslop`](skills/unslop/SKILL.md) | 清除写作中的 AI 套话与含糊表达。 |
| [`why`](skills/why/SKILL.md) | 从源码与可用记录重建设计动机及决策依据。 |

## pstack 定制约定

- **去宿主绑定**：工具名表示能力，按当前 Agent 的工具、权限和技能目录映射。不要求 Cursor 插件、专用子代理类型、固定模型 ID 或固定历史路径。
- **模型配置**：setup 必须让用户选择 `project-level` 或 `global-level`。目标分别为 `<项目根>/.agents/pstack-models.md` 和 `~/.agents/pstack-models.md`，确认后只写选中的文件。
- **逐角色继承**：所有技能先读项目配置，再以全局配置补齐缺失角色，之后使用当前 Agent 支持的技能默认值或 `inherit-parent`。项目文件存在不代表屏蔽整个全局文件；列表整体替换，不合并。显式 `auto` / `inherit-parent` 也会覆盖全局值。
- **跨目录委派**：项目根与有效模型偏好由父代理传给子代理，不能因临时目录或工作树变化而读到另一份配置。预算是独立的推理偏好，不通过猜测模型 ID 后缀实现。
- **独立安装**：每个入口自带最小发现和降级约定。完整合集包含相互调用的工作流和原则；单独安装时，按活动技能目录解析可选同伴。缺少时执行等价的范围内检查并说明限制，不能把自审称为独立验证。详细通用契约位于 [setup-pstack 的运行参考](skills/setup-pstack/references/agent-runtime.md)。
- **可选能力**：并行、多模型、历史、UI 控制和评审集成均需先确认可用。缺失时明确降级；不会自动安装其他插件。`make-bot-ui` 仍是 Grok Bot 的专门集成，不假装其 webhook API 通用于其他机器人。
- **修改权限**：保持宿主和用户的审批边界。依赖下载、公开发布、合并和清理等动作遵循明确授权；“自主执行”不等于无限权限。

配置是技能主动读取的普通 Markdown，不会自动注入其他 Agent 会话。格式、角色表及可选只读解析器见 [setup-pstack](skills/setup-pstack/SKILL.md)。未选择作用域时不会创建配置。本次迁移也不创建你个人或项目的实际模型配置。

不迁移上游 Cursor 专用的 Benny automations、插件安装器、品牌资源或生成式 harness 发布树；技能使用的脚本、模板、参考资料随各自目录保留。上游的 poteto-agent 与 Comment Sicko 作为对应技能内的提示词参考分发，不要求注册宿主专有 agent 类型。

### 来源与许可

基于 [cursor/plugins 的 pstack](https://github.com/cursor/plugins/tree/9580c23696ac8d7abed0c166f2f9918800afb819/pstack)，固定上游提交 `9580c23696ac8d7abed0c166f2f9918800afb819`。原作者 Lauren Tan，MIT；每个迁入技能都保留自己的 `LICENSE`，单独安装也保留署名。仓库自身修改同样采用 MIT。

名称沿用上游。例如已有全局 `tdd` 时，先用项目级安装或显式加载确认选择了哪一份，避免无意覆盖现有技能。

## 仓库结构

```text
.
├── .claude-plugin/
│   └── marketplace.json       # skills CLI 的分组索引
├── skills/
│   ├── <name>/                # SKILL.md 及该技能的运行资源、许可
│   └── README.md              # 扁平技能源目录的说明
├── tests/
│   ├── <name>/                # 手工用例；有脚本时包含自动化测试
│   └── README.md              # 验收用例、自动化命令与验证边界
├── AGENTS.md                  # Agent 维护本仓库的规则
├── README.md
├── LICENSE
└── .gitignore
```

每个实际技能放在 `skills/<name>/`：

```text
skills/<name>/
├── SKILL.md                   # 必需：元数据、执行流程和完成标准
├── references/                # 按需：详细规则、领域资料
├── scripts/                   # 按需：技能运行需要的代码
└── assets/                    # 按需：模板和静态资源
```

只创建有内容的可选目录。技能运行需要的资源全部放在自己的目录内，使用相对路径引用；仓库根目录和 `tests/` 是维护材料，不随单个技能安装提供。

## 新增技能

1. 创建 `skills/<name>/SKILL.md`。目录名与 `name` 一致，在全仓库内唯一。
2. 用 `description` 说明做什么、什么时候使用；正文说明输入、执行步骤、边界和完成标准。
3. 将详细参考资料、脚本和模板按需放在技能目录内，并在正文说明何时读取或运行。
4. 在 `tests/<name>/cases.md` 记录代表性任务、边界情况和预期行为。模板见 [验收约定](tests/README.md)。
5. 用 Pi 在真实项目中验证，再将技能加入分组清单和本 README 的技能目录。

最小格式如下，这只是编写示例，不是仓库中已经存在的技能：

```markdown
---
name: my-skill
description: 说明能力及适用场景，让 Agent 能判断什么时候使用。
---

# 技能名称

## 工作流程

1. 确认输入和执行范围。
2. 执行任务，说明需要用户确认的分支。

## 完成标准

- 列出用户或 Agent 能检查的完成条件。
```

名称使用小写 ASCII 字母、数字和连字符，最多 64 个字符，不以连字符开头或结尾，不包含连续连字符。`description` 非空，最多 1024 个字符。

第一版优先保持技能独立；有跨技能依赖时，明确列出并验证单独安装的行为，不默认其他技能已存在。

## 用 Pi 开发与验证

以下命令中的绝对路径和 `<name>` 需要替换。业务目录无需 Git remote，也不必是 Git 仓库。

```bash
cd /path/to/business-project
pi --skill /path/to/skills-repo/skills/<name>
```

`--skill` 直接加载源文件，不复制内容、不创建软链接。同一个会话可以阅读业务项目并修改技能源文件；明确告诉 Agent 哪个目录是技能源码，以及业务代码是否允许修改。

聚焦验证时，关闭自动发现的其他技能，只加载显式指定的技能：

```bash
pi --no-skills --skill /path/to/skills-repo/skills/<name>
```

同时加载多个技能时重复指定 `--skill`。在会话中用 `/skill:<name>` 显式调用；源文件修改后执行 `/reload`，再调用验证。重新加载不会移除对话中已有的旧指令，最终验收使用干净会话。

本地 Pi 的默认文件工具权限并不局限于业务目录。使用容器、沙箱或路径保护扩展时，确认业务目录和技能源目录都在允许范围内。

不在共享配置中保存个人绝对路径。第一版不需要 `.pi/settings.json`、开发链接脚本或全局安装工具。

## 分组与安装

分组清单的每个插件条目使用 `name` 定义组名，`source: "./"` 表示仓库根目录，`skills` 数组显式列出组内技能目录：

```json
{
  "name": "pstack",
  "source": "./",
  "skills": [
    "./skills/my-skill"
  ]
}
```

上面仅展示清单格式；目前只有 `pstack` 一个分组，包含本页列出的全部 58 个技能。技能目录不随分组调整而移动，同一技能只登记到一个组。

可用以下命令查看和安装：

```bash
# 从仓库根目录检查本地发现结果
npx skills@latest add . --list

# 从 GitHub 查看技能和分组
npx skills@latest add Wade11s/skills --list

# 安装指定技能
npx skills@latest add Wade11s/skills --skill <name>
```

本地发现应列出 58 个技能。清单控制分组，不是访问控制或所有安装渠道的发布过滤器。技能 CLI 的安装不会替你选择模型配置作用域；安装后运行 setup-pstack。

## 验证与维护

- 修改技能行为后，执行对应的手工验收用例；有脚本时再补对应语言的自动化测试。
- 新增、删除或重命名技能时，同步分组清单、技能目录和验收用例。
- 执行 `git diff --check` 检查补丁空白问题；新增技能后用上述本地发现命令检查 CLI 是否识别。
- 说明实际执行的检查和未验证的部分，不能把 Markdown 用例写成自动化测试通过。
- 不提交凭据、业务项目私有数据或本机路径。临时验证产物放在被忽略的 `.scratch/`。

自动化检查及脚本依赖见 [验收说明](tests/README.md)。自动化通过不代表 58 个技能都完成了真实交互验收；每个 tests/<name>/cases.md 记录仍需逐项执行的场景。仓库不包含安装副本同步框架、npm 发布、行为评测平台或文档站。

## 参考

- [Agent Skills 规范](https://agentskills.io/specification)
- [Vercel skills：发现规则与插件清单](https://github.com/vercel-labs/skills/blob/main/docs/creating-skills.md)
- [Pi 技能](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/docs/skills.md)
- [Pi CLI 资源参数](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/docs/cli.md#resources)

## License

[MIT](LICENSE)
