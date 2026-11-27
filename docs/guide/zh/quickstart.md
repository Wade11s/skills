# pstack-for-pi 快速上手

一页纸版本。完整指南在 [`docs/guide/`](../README.md)。

## 1. 安装

两条通道装的是同一批文件，选一条。

```bash
# Agent Skills 通道（Pi 原生读取 ~/.agents/skills/）
npx skills add Wade11s/skills -g --agent pi

# Pi 包通道
pi install git:github.com/Wade11s/skills
```

## 2. 配置模型

```text
/skill:setup-pstack
```

它读取你的 scoped models（`enabledModels`），列出编号，让你为九个角色各选一个模型，再为
`code` / `judgment` / `panel` / `workers` 四个族各选一个 fallback，写入
`~/.pi/agent/pstack-models.json`。

没有默认模型，也没有“沿用父会话模型”这种别名。没跑过 `/scoped-models` 时它会停下来让你先
scope，不会退回全量模型目录。

## 3. 跑第一个任务

```text
/skill:pstack-poteto-mode 给这个命令加一个 --json 参数，文本输出保持逐字节一致，两个都验证。
```

它会把匹配到的 playbook 步骤抄进 `.pstack/<slug>/todo.md`。看这个文件判断进度，不要只看回复：
文件与回复冲突时以文件为准。

## 4. 常用命令

| 想做的事 | 命令 |
|---|---|
| 默认入口 | `/skill:pstack-poteto-mode` |
| 不知道用哪个技能 | `/skill:pstack-help` |
| 只看当前会话进展 | `/skill:pstack-ketchup` |
| 对抗性评审 | `/skill:pstack-interrogate` |
| 并行候选 | `/skill:pstack-arena` |
| 并行切片 | `/skill:pstack-swarm` |
| 证明改动有效 | `/skill:pstack-create-verification-skill` |
| 保留决策轨迹 | `/skill:pstack-show-me-your-work` |

所有技能都是 slash-only，不会自动加载，也不会占用系统提示。

## 5. 排错

| 现象 | 处理 |
|---|---|
| setup 说没有 scoped models | 先跑 `/scoped-models`，再重跑 setup |
| 某个角色未配置 | 重跑 `/skill:setup-pstack` |
| 模型不在 scoped 集合 | 重选；离开集合后由对应族的 fallback 兜底 |
| `todo.sh` 报 stale lock | `todo.sh unlock <slug>`；不会自动抢锁 |
| 技能没有自动触发 | 正常，pstack 技能只能显式调用 |
| playbook 不存在 | 检查名称；22 个 playbook 都已随包提供 |

## 6. 卸载

```bash
npx skills remove -g pstack-poteto-mode   # 按技能卸载
pi remove git:github.com/Wade11s/skills   # 按包卸载
```

模型配置在 `~/.pi/agent/pstack-models.json`，按需删除。
