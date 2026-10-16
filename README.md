# Clash 订阅转换规则

维护供 MiSub / Subconverter 使用的自定义 INI，集中管理业务分流、地区节点和 Telegram 目标 IP 分区。

## 配置入口

在订阅转换工具的“外部配置 / 自定义配置”中填写：

```text
https://raw.githubusercontent.com/imauzzc/clash/main/config/ACL4SSR_Mini_AI_Custom.ini
```

INI 是转换模板，需要配合你自己的节点订阅生成 Clash / Mihomo 配置；不能直接当成节点订阅导入。转换时保持 `sort=false`。

更新本仓库后，先刷新转换结果，再在客户端更新订阅。若仍显示旧配置，清理转换缓存或给 INI 地址添加版本参数（例如 `?v=20261016-liminalnet`）。

## 当前策略

- 共 27 个策略组，包含节点选择、自动选择、六个地区手选组及各自的自动测速组。
- AI、YouTube、谷歌、微软、苹果分别分流；微软和苹果默认直连。
- `🌐 LiminalNet` 匹配 `liminalnet.us` 及其所有子域名，默认选择 `🇯🇵 日本节点`。可选项与苹果服务一致：日本、直连、节点选择、自动选择、香港、台湾、新加坡、美国、欧洲。
- LiminalNet 规则位于局域网规则之后、其他远程列表之前，避免被后续通用规则提前匹配。
- Telegram 根据目标 IP 分为亚太、北美、欧洲和兜底组；地区判断及实际效果存在边界，见审计说明。
- 地区组保留手选节点；进入对应“自动测速”子组后才启用同地区自动选择。LiminalNet 默认选日本地区组，不自动切到日本自动测速；需要时在日本组内主动选择。没有日本节点时拒绝连接，不跨地区兜底。

客户端之前保存的策略组选择可能覆盖新的初始默认；更新后请确认 LiminalNet 选择了日本节点。

## 文件结构

```text
config/ACL4SSR_Mini_AI_Custom.ini  主配置，维护 ruleset 和 custom_proxy_group
rules/Telegram_APAC.list          Telegram 亚太目标 IP
rules/Telegram_US.list            Telegram 北美目标 IP
rules/Telegram_EU.list            Telegram 欧洲目标 IP
rules/Telegram_Other.list         Telegram 广域网段及域名兜底
docs/                            使用说明、分区证据及验证记录
```

主配置引用本仓库的四份 Telegram 列表，其余远程规则由 ACL4SSR 提供。少量个人域名规则直接写在 INI 中，避免增加不必要的列表文件。

2026-10-16 清理了旧版 Full / LIAN / mini 模板、根目录四份旧列表、开发脚本和两份路由器设置示例；历史版本仍可从 Git 提交记录查看。使用过旧文件地址的客户端需要改用上述配置入口。

## 维护与验证

INI 使用重复的 `ruleset=` 和 `custom_proxy_group=` 行，编辑时须保留顺序，不能用会合并同名键的普通 INI 读写器。

- [地区节点与自动测速](docs/Region-node-groups.md)
- [Telegram 分区审计与历史验证](docs/Telegram-routing-audit.md)
- [Telegram 验证快照](docs/Telegram-validation.json)
- [Telegram 分区证据](docs/Telegram-evidence-2026-10-16.json)

Telegram 验证 JSON 保留加入 LiminalNet 前的 26 组历史快照；此次修改的验证结果见审计说明末尾。
