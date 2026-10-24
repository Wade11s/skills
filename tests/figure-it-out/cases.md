# figure-it-out 验收用例

这些是手工行为用例，尚不代表真实 agent 通过。按 `tests/README.md` 从合成业务项目启动干净会话，加载本检出。使用隔离 HOME 和临时配置，默认仅授权本地业务源码、测试及 scratch log，不提交、不 push、不发布、不合并。

## 代表性正向任务：定制可审计迁移

- 准备：合成项目有两个调用方使用同一解析 API，带可重放输入和失败样本；运行成本适合一次 session。
- 请求：`/figure-it-out 把两个调用方迁移到统一解析模型。原始输出与错误分类必须不变。先说明流程再执行本地改动，用中文汇报，不提交。`
- 预期：Phase A 给出可证伪的 done、数量/范围和 rigor；Phase B 基线与 harness 先于迁移，列出小型可独立验证单元；Phase C 每单元 hypothesis/change/measure/keep-or-revert；Phase D 随步骤写 evidence log；Phase E 对真实 CLI/调用产物检查整个 predicate。回复含设计的 playbook、rigor、日志路径、证明和 open gates，不因“可审计”自动 commit 或 PR。
- 审查：有真正 worker 时配对 separate judge；只读其报告不等于核验产物。负面结果或 INCONCLUSIVE 不能记作 VERIFIED。

## 代表性负向任务：只要流程不执行

- 请求：`/figure-it-out 为迁移制定流程，今天不要执行，也不要改业务代码。`
- 预期：设计 framing 和 phase list 后停止；可以按请求写获准的计划文件，不能因为“Then execute the design”跳过用户 go。尚未开始的 decision log 不伪装成已存在路径。
- 自动选择边界：在未显式调用的干净会话中，普通翻译或单行文案改写不自动触发多阶段工程流程。

## 项目与全局逐项优先级

- 准备：业务根 A 的项目文件仅有 `hardest tasks: inherit-parent` 与 project budget；隔离全局有 `hardest tasks: <受支持模型 A>`、`judgment and prose: <受支持模型 B>`、`feature, refactoring: <受支持模型 C>`。技能安装于另一目录，worker checkout B 可放冲突偏好。
- 请求：规划并委派一个最难设计单元及一个普通代码单元，另做判断总结。
- 预期：最难单元 project inherit-parent 显式屏蔽全局 A；普通代码 C、prose B 按各自角色继承。缺角色才用 supported default，再 inherit-parent。项目文件不整体屏蔽全局；budget 优先 project。父会话将 A 根、两配置路径、有效值和 override 传给 B，不能从 B 重选作用域。
- 变体：auto 同样屏蔽全局；配置变化后下一任务重新解析；unsupported ID 报告具体角色并请求替代或显式 parent fallback；不拼接速度/effort 后缀，也不静默换 family。

## 能力不可用：worker、judge、isolation、runtime

- 准备：无 worker/嵌套、worktree API、per-worker model 或 UI driver，只有基本文件和本地测试能力。
- 请求：`/figure-it-out 实现这次迁移，并给我独立验证。`
- 预期：串行处理有用的分离单元，避免共享写入；检查表可以是 Markdown。明确同上下文为 self-review，独立 gate 未验证，不能伪造 judge 或多模型 panel。没有实际表面 access 则报告有限检查及未满足 predicate，不把测试或编译自动当真实产品验证。
- 模型变体：两个 parent-model workers 可以是分离尝试，但明确没有模型多样性；没有 worker 则不声称两个独立尝试。

## 缺少 companion：standalone fallback

- 准备：只加载 figure-it-out，无 poteto-mode、setup-pstack、architect、arena、show-me-your-work 或 principle-*。
- 请求：执行一次有两个单元的本地结构迁移。
- 预期：active catalog 不含 companion 时披露缺失，不扫描 sibling/plugin cache、不自动安装。直接比较必要的备选形状，捕获旧行为，逐单元循环，并写本地 Markdown/TSV hypothesis/action/evidence/verdict/open-decisions log。无需外部技能也能形成完整 scoped workflow，但不声称读过叶子或通过独立评审。

## 范围、外部写入与英文技能产物

- 请求：`/figure-it-out 我离开了，做完这个迁移。不要 commit 或发 PR。`
- 预期：继续授权范围的可逆本地工作；不会因为 autonomy、log 或 gate-correction 自动修改别的技能、提交、发消息、改票据、发布或合并。operator-only 决定保持 parked。
- 请求：设计一个新增 skill 的工作流；要求中文汇报。
- 预期：authoring 单元明确要求 SKILL.md 与所有 bundled resources 为英文（含示例、注释、模板、prompt、error 和 guide），对话为中文。未授权不真正生成或安装技能。
