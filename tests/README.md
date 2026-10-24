# 技能验收

每个实际技能对应 `<name>/cases.md`，名称与 `skills/<name>/` 一致。这里的材料只用于开发验证，不是技能运行依赖。

使用可重复执行的手工用例，不设置自动化行为评测平台。脚本测试与静态分发检查的命令见下文；这些检查不能替代真实 Agent 交互。

## 用例模板

```markdown
# <name> 验收用例

## 代表性任务

- 准备：所需的公开、合成或脱敏测试输入，以及必要工具。
- 请求：在 Pi 中发送的具体请求。
- 预期：可以观察和检查的结果。
- 边界：哪些行为需要确认，哪些文件允许修改。

## 不应使用的场景

- 请求：一个不属于本技能适用范围的任务。
- 预期：在未显式调用技能的干净会话中，不自动套用该流程。

## 输入或环境不完整

- 准备：缺少输入、权限或必要工具。
- 请求：具体任务。
- 预期：指出缺失项并请求补充，不编造结果或静默扩大执行范围。
```

## 执行方式

1. 从真实测试项目启动 Pi，使用 `--skill` 指向当前检出的技能源目录。
2. 按用例准备输入、发送请求，逐条对照预期。
3. 修改技能源文件后运行 `/reload` 再试；最终验证使用干净会话，避免旧指令影响结果。
4. 在会话中记录实际结果和未验证项。只有新的可复用回归场景才写回用例，不提交含业务数据的执行记录。

`--no-skills --skill <path>` 适合聚焦显式调用测试。测试自动选择或与其他技能的组合时，保留相应候选技能，并单独确认发现结果；手工阅读 `SKILL.md` 不等于验证了自动调用。

## 自动化检查

从仓库根目录执行。临时产物放在被忽略的 `.scratch/`，不要把测试配置写到真实用户 home。以下测试只验证注明的代码或结构，不证明全部技能行为。

### 分发结构与模型解析（Python 3.9+）

```bash
mkdir -p .scratch
python3 -B -m unittest discover -s tests -p test_distribution.py -v
python3 -B -m unittest discover -s tests/setup-pstack -v
python3 -B -m unittest discover -s tests/show-me-your-work -v
mkdir -p .scratch/tmp .scratch/poteto-mode-tools
cp -R skills/poteto-mode/scripts/. .scratch/poteto-mode-tools/
TMPDIR="$PWD/.scratch/tmp" python3 -B .scratch/poteto-mode-tools/test_portability.py
```

分发测试检查 58 个入口全部位于唯一的 `pstack` 分组、技能登记唯一性、许可、验收用例、资源指针以及项目优先的入口约定。模型解析测试用临时 home 验证逐角色继承、别名覆盖、面板整体替换、来源和格式错误；解析器本身只读，不确认任何供应商模型可用。

### poteto-mode 配套工具（Bun）

在临时脚本副本中安装锁定依赖，避免给技能源目录或全局技能留下 `node_modules`。这不是技能安装或发布副本。依赖安装需要网络及相应授权。

```bash
mkdir -p .scratch/poteto-mode-tools
cp -R skills/poteto-mode/scripts/. .scratch/poteto-mode-tools/
(cd .scratch/poteto-mode-tools && bun install --frozen-lockfile && PSTACK_INSTALL_DEPENDENCIES=1 bun orch/orch.ts --help && bun run test && bun run typecheck)
```

保留上游的 orchestrator、PR watcher、计划检查单元测试和类型检查。测试使用假 PR 数据，不等于真实 GitHub/Origin 集成、持续运行或合并已验收。

### statechart（Node.js）

```bash
mkdir -p .scratch/tmp .scratch/cache .scratch/npm-cache
TMPDIR="$PWD/.scratch/tmp" XDG_CACHE_HOME="$PWD/.scratch/cache" npm_config_cache="$PWD/.scratch/npm-cache" \
  node --test skills/statechart/scripts/test/statechart.test.mjs
```

渲染测试首次运行会下载锁定版本的 `pele` 与 `@resvg/resvg-js`，先确认网络和安装权限。TLC/Java/mise 相关用例在缺依赖时会跳过，必须报告跳过数；通过的解析/渲染测试不证明实际 TLC 模型检查已执行。若要补全这些集成用例，先按技能说明准备依赖，不为凑通过率自动安装约 305 MB 的工具链。

### CLI 发现与补丁

```bash
npx skills@latest add . --list
git diff --check
```

CLI 应仅展示 `pstack` 分组，发现全部 58 个技能并与清单一致，不出现旧的 Engineering 或 Productivity 分类。`--list` 只检查发现，不应安装技能。

## pstack 交互验收重点

除各技能自己的代表性任务外，至少覆盖：

1. 未选作用域或取消时无写入。
2. 项目级只写项目文件；全局级只写全局文件，明确项目遮蔽。
3. 项目只覆盖部分角色时，其余继承全局；面板不拼接，别名不被当作缺失。
4. 从项目子目录及跨临时工作树委派时沿用原项目根和有效偏好。
5. 模型、子代理、历史或同伴技能缺失时诚实降级，不编造多模型或独立验证。
6. 单独安装的技能在没有 setup-pstack 和其他同伴时，仍执行其内联最小配置发现；缺失能力对应的门禁保持未验证。

在隔离 home 中做交互测试时，显式向测试会话说明 `~` 对应的沙箱目录，并核对工具调用的实际路径。只改进程 `HOME` 不保证宿主提示词中的用户 home 也变化。配置读写之后比较两个作用域的文件内容，不能只信模型的完成回复。
