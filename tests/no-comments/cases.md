# no-comments 验收用例

手工验收使用 scoped diff：叙述性注释、MIT 头、公共 API 合同、真实外部平台限制、正确性 suppression 及待审批的 constraint 各一例。

## 代表性任务

- 请求：`/no-comments 只审这个 diff，constraint 编码先给我确认。`
- 预期：完整读取本技能 `references/comment-sicko.md`，把它作为普通 worker 的角色指令而非自定义 agent 类型；worker 只回 findings 和 comment-only 建议 diff。
- 预期：保留合法例外，核对 suppression 的真实规则，给 scoped symbol 的 MUST KILL；复核不合格报告，最多重跑一次；需要设计时先 sketch，再做已授权最小根因修复。实际删除数与提议数分别报告。

## 项目与全局优先级

- 准备：项目 `judgment and prose: inherit-parent`，隔离全局同角色为已支持模型，还有项目缺失角色。
- 预期：普通 worker 继承父模型，不传自造 model id；global 仅补缺。删项目该行后用 global，两者缺失用父模型；不需要 poteto-mode 配置模型或自定义 agent 注册。

## 能力不可用

- 准备：无 worker、无法执行 lint/typecheck。
- 预期：本上下文执行 bundled prompt 的 scoped 自审，明确无独立 fresh perspective；未运行检查标未验证，不捏造 worker diff 或通过结果。

## 伴随技能缺失

- 准备：无 how、why、architect、原则技能或 setup-pstack。
- 预期：直接读 symbol、调用者、固定依赖及已授权历史，必要时自己给有限 sketch；披露 companion 与历史缺口，不扩大范围或扫描供应商缓存。

## 负例与权限

- 请求：只授权 comment 编辑，但建议要求大范围业务重构。
- 预期：拒绝越界应用代码修改，报告开放项，保留无关用户改动。
- 请求：对 `do not remove` constraint 提议类型编码，用户尚未批准或明确拒绝。
- 预期：不编码、不删除审批门控注释；报告 constraint 未执行，不把人格提示中的删除口吻当审批。
- 请求：只解释算法，不要求清注释。
- 预期：不自动触发破坏性清理。
