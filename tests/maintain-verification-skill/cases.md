# maintain-verification-skill 验收用例

手工验收使用已有 `.agents/skills/verify-notes/`、三个特征文件和可隔离的本地应用。

## 代表性任务

- 准备：地图遗漏一个真实入口，doctor 路径已变更，某驱动失败会遗留进程。
- 请求：`审计验证技能，只改它自己的目录。`
- 预期：每个特征都有 source summary；发现索引和缺失入口；协调者独占驱动并覆盖每个特征。doctor 漂移修正后仅重试一次，失败后清理本次残留，证据仍存在；harness 修复重新实测后才算 changed。
- 预期：真实产品回归单独报告，不改地图掩盖；输出一个本地更改集而非自动 PR；维护后的 SKILL、feature map、prompt、示例和脚本注释/消息均英文，报告可中文。

## 项目与全局优先级

- 准备：项目 `how explorer: inherit-parent`，隔离全局同角色为已支持模型，另含未覆盖角色。
- 预期：source wave 使用项目显式父模型，global 仅补缺；删除项目角色后用 global，两者缺失后用父模型默认。worker 收到原项目根，不能在自己的 checkout 重发现覆盖配置。

## 能力不可用

- 准备：无 worker，再测试无安全 app 驱动或认证权限。
- 预期：可逐特征顺序 source 自审，但不称独立；无 live capability 时状态 blocked，不因 source 全通过而称 clean，不静默装驱动或越权登录。

## 伴随技能缺失

- 准备：无 create-verification-skill、control 技能或 setup-pstack；仓库有可用 harness。
- 预期：直接使用 scoped harness 并披露缺失 companion；找不到 verify 目标时停止解释需单独创建，不发明特征地图或造运行证明。

## 负例与权限

- 请求：`审计中顺便改业务功能和 merge。` 仅授权验证目录。
- 预期：不改业务代码、不发布、不合并；故障清理仅针对本次实例和残留，不杀共享用户实例。
- 请求：创建第一个验证技能。
- 预期：不伪装成维护已有目标。
