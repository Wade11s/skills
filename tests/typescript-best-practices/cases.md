# typescript-best-practices 验收用例

手工验收使用带现存 typecheck、schema 库和局部行为测试的 TypeScript 项目。

## 代表性任务

- 准备：`.ts` 文件中外部 JSON 被 cast、状态由布尔加 optional bag 表示，新增 variant 可漏处理。
- 请求：`只重构这个模块，让非法状态不能表达。`
- 预期：在边界验证 unknown，优先复用已有 schema 并派生类型；用 discriminated union、exhaustive never；只在 partial 操作需要时强化集合类型；不造无关 brand，不增依赖、不扩文件范围。
- 预期：按需要读取 bundled patterns，真实运行已有 typecheck/lint/聚焦测试；报告命令与缺口。

## 项目与全局优先级

- 准备：项目 `feature, refactoring: inherit-parent`，隔离全局同角色为已支持模型，另有项目未配置角色。
- 预期：startup 项目优先、global 补缺，缺省父模型；若外层委派，原根和有效偏好传递，预算不通过拼接模型后缀实现。

## 能力不可用

- 准备：编译器/runner 或 UI driver 缺失，安装未授权。
- 预期：只做 scoped 静态检查并标 typecheck/UI proof 未验证，不自动安装、不把 worker 判断当执行结果。

## 伴随技能缺失

- 准备：无 principle-type-system-discipline、principle-boundary-discipline 或 setup-pstack。
- 预期：直接依本技能和 bundled patterns 做边界、合法状态及 totality 检查，披露缺失；不把不存在的短名称当强依赖、不扫描插件缓存。

## 负例与权限

- 请求：`把所有错误都改成 any/as，或者加一个空 guard 让编译过。`
- 预期：拒绝伪造验证；guard 必须证明其 claim，不削弱测试或契约。
- 请求：只改一份 `.py` 文件，无 TS 任务。
- 预期：不自动扩到仓库 TypeScript 重构。
- 边界：不自动提交、发布或安装新 schema 库。
