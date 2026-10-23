# Personal skills

个人 Agent Skills 仓库。以 Pi 为主要运行和验证工具，也可以用 Delta 编辑、审查和维护源文件。

技能采用标准 `SKILL.md` 格式，源码保持扁平，通过 `.claude-plugin/marketplace.json` 为 `skills` CLI 提供分组。Pi 开发时直接加载源目录，不依赖分组清单。

## 技能目录

当前仅包含仓库骨架，尚无可安装技能。Engineering 和 Productivity 两个分组暂未添加成员；新增技能时同步更新本节和分组清单。

## 仓库结构

```text
.
├── .claude-plugin/
│   └── marketplace.json       # skills CLI 的分组索引
├── skills/
│   └── README.md              # 扁平技能源目录的说明
├── tests/
│   └── README.md              # 验收用例约定与模板
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

## 配合 Delta 维护

Delta 可以直接编辑本仓库中的技能、资源、清单和验收用例，不必先把技能安装进 Delta。

Delta 和 Pi 必须使用同一份检出，否则可能编辑了一个版本却测试了另一个版本：

- **共享现有检出**：在新 Delta 线程首次发送消息前，选择 `Project Settings → Existing Local Checkout`；Pi 从同一目录加载源文件。避免两边同时编辑同一文件。
- **保留隔离检出**：让 Pi 的 `--skill` 指向该 Delta 线程实际工作树中的技能源目录，不指向原始仓库的另一份副本。

这里不要求把业务项目也附加到 Delta。业务场景由 Pi 验证，Delta 维护 skills 仓库即可。

根目录的 `skills/` 不是 Delta 的默认项目技能入口。若要在 Delta 中原生调用技能，再单独安装到 `.agents/skills/<name>/`；不要把“能编辑源文件”当成“已经加载技能”。从业务目录启动 Pi 时，也不要假定本仓库的 `AGENTS.md` 已自动加载。

## 分组与安装

分组清单的每个插件条目使用 `name` 定义组名，`source: "./"` 表示仓库根目录，`skills` 数组显式列出组内技能目录：

```json
{
  "name": "engineering",
  "source": "./",
  "skills": [
    "./skills/my-skill"
  ]
}
```

上面是添加成员后的示例；目前清单中的数组为空，没有占位技能。技能目录不随分组调整而移动，同一技能只登记到一个组。

有实际技能后，可用以下命令查看和安装：

```bash
# 从仓库根目录检查本地发现结果
npx skills@latest add . --list

# 从 GitHub 查看技能和分组
npx skills@latest add Wade11s/skills --list

# 安装指定技能
npx skills@latest add Wade11s/skills --skill <name>
```

空仓库阶段 CLI 报告未发现技能是预期结果，不代表分组清单损坏。清单控制分组，不是访问控制或所有安装渠道的发布过滤器。

## 验证与维护

- 修改技能行为后，执行对应的手工验收用例；有脚本时再补对应语言的自动化测试。
- 新增、删除或重命名技能时，同步分组清单、技能目录和验收用例。
- 执行 `git diff --check` 检查补丁空白问题；新增技能后用上述本地发现命令检查 CLI 是否识别。
- 说明实际执行的检查和未验证的部分，不能把 Markdown 用例写成自动化测试通过。
- 不提交凭据、业务项目私有数据或本机路径。临时验证产物放在被忽略的 `.scratch/`。

第一版不包含示例技能、同步脚本、npm 发布、行为评测平台或文档站；按真实使用需求扩展。

## 参考

- [Agent Skills 规范](https://agentskills.io/specification)
- [Vercel skills：发现规则与插件清单](https://github.com/vercel-labs/skills/blob/main/docs/creating-skills.md)
- [Pi 技能](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/docs/skills.md)
- [Pi CLI 资源参数](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/docs/cli.md#resources)
- [Delta 项目与检出](https://delta.dev/docs/delta-101.md#projects-worktrees-and-checkouts)

## License

[MIT](LICENSE)
