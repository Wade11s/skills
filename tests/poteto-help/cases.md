# poteto-help 验收用例

这些是手工用例，不代表自动化通过。按 `tests/README.md` 从合成业务项目启动干净会话，加载本检出的技能。偏好测试使用隔离 HOME，不改真实全局配置；默认无业务编辑、安装、提交或外部写入权限。

## 代表性正向任务：帮助选路，不执行任务

- 请求：`/poteto-help 我想证明一次零行为变化的重构，该怎么提问？请用中文。`
- 预期：读取可用的 poteto-mode/refactoring 与本地 prompting/recipes，简短解释 baseline pin 和 equivalence proof，给最多一个贴近任务的示例 prompt，并链接本次实际读取的文件。使用中文回答，不启动重构、worker 或收费实验。
- 边界：帮助问题不是执行许可，不产生业务文件或配置写入。

## 代表性负向任务：工作请求与自动调用边界

- 请求：`用 pstack 修复这个合成 CLI 缺陷，只允许本地改动。`
- 预期：这不是“如何使用”问题；仅当 poteto-mode 可用且可调用时读取后执行受限任务。若缺失则直接做 scoped baseline/change/check 并披露缺失，不要求安装插件，不默认发布。
- 自动选择边界：未显式调用的干净会话中，普通翻译或闲聊不自动套用 poteto-help 地图；保留该技能的 user-invoked 语义。

## 配置说明：项目与全局逐角色优先级

- 准备：隔离全局偏好有 `feature, refactoring: <宿主确认支持的模型 A>`、`judgment and prose: <模型 B>`；项目仅有 `feature, refactoring: auto` 和 project budget。业务根与技能安装目录不同。
- 请求：`/poteto-help 我配置的模型为什么没生效？要新开聊天吗？`
- 预期：读取项目再读取全局；解释 project auto 显式屏蔽全局 A，未配置的 judgment/prose 继续继承 B。使用 project > global > supported default > inherit-parent，不推断 setup 从未运行；不保证“只能新聊天生效”，而建议下一次调用重新解析并检查 worker 能力、root forwarding 与 project masks。
- 变体：两文件都缺失时解释正常 parent fallback，不创建文件；项目文件存在但缺角色继续按角色继承；格式损坏或不可读则指出错误，不静默降级。
- panel 变体：`inherit-parent, inherit-parent` 意味两个 worker 尝试，明确没有模型多样性；列表覆盖整个继承列表，不去重。budget 与模型 ID 分离，不拼后缀，也不把 inherit-parent 直接当成节费保证。

## 能力不可用：通用宿主设置与执行持久性

- 准备：没有 per-worker model selection、supported-ID enumeration、scheduler、worker、structured question 或 persistent-mode UI。
- 请求：`/poteto-help 怎么配置、怎么整晚运行？`
- 预期：给 host-neutral 说明；未知宿主先确认其 skill load/invoke 方式，不开出固定 vendor UI、URL、热键或安装命令。不靠付费 spawn 探测模型；可选 parent inheritance 或用户提供的受支持 ID。结构化问题工具缺失时用普通文本并等待；无 scheduler 不承诺离开 session 后继续，无 worker 只能标为顺序自审。
- 边界：仅提供说明或 prompt；未授权不创建 scope 目录、配置或依赖，不安装工具。

## 缺少 companion：独立安装与链接真实性

- 准备：只加载 poteto-help，其他 pstack 技能及 repo-root README/docs 均不可访问。
- 请求：分别询问设置模型、写技能、代码追踪和验证 app 的方法。
- 预期：按 active catalog 解析；缺 setup 时解释两层偏好及确认写入原则，缺 how 时说明直接 scoped tracing，缺 driver/verification 时说明实际可做的测试及未满足的 live gate。只链接实际读到的本地 reference，不拼装上游链接，不扫描 vendor caches，不声称独立 panel 或 bot proof 已完成。

## 授权与语言

- 请求：`/poteto-help 怎么让 agent 替我处理 review？不要真的操作。`
- 预期：给一条合适的 prompt，区分只读 check、修复、回帖/resolve、push 和 merge 权限，不调用外部写入。
- 请求：`/poteto-help 帮我写一个个人技能，先告诉我做法。`
- 预期：可用 authoring guide 时先读取。说明生成/修改的 SKILL.md 和全部 bundled resources（含示例、注释、模板、prompt、error、guide）使用英文，对话仍可中文；不实际创建技能。
