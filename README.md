# Clash 订阅转换规则

## 当前已验证内置方案的备用模板

新增 [MiSub 稳定版备用配置](docs/MiSub_Stable_20261023.md)，以 2026-10-23 已确认可用的内置 Standard 为准：保留原 Google、DNS 和兜底逻辑，只含 Emby、统一 AI、Telegram 分区及三份广告清单。

备用 URL：

```text
https://raw.githubusercontent.com/imauzzc/clash/main/config/MiSub_Stable_20261023.ini
```

配套提供 [DNS 片段](config/MiSub_Stable_20261023.dns.yaml)、完整分流快照、独立本地生成工具和配置比较记录。切换后仍需实际测试，INI 的隐藏组和地区识别限制见说明。当前网站的内置方案没有自动切换。

下面保留的是早期 INI 的说明，不能把它的 Google/Play 等复杂规则当作稳定版配置。

---

维护供 MiSub / Subconverter 使用的自定义 INI，集中管理业务分流、地区节点和 Telegram 目标 IP 分区。

## 配置入口

在订阅转换工具的“外部配置 / 自定义配置”中填写：

```text
https://raw.githubusercontent.com/imauzzc/clash/main/config/ACL4SSR_Mini_AI_Custom.ini
```

INI 是转换模板，需要配合你自己的节点订阅生成 Clash / Mihomo 配置；不能直接当成节点订阅导入。转换时保持 `sort=false`。

更新本仓库后，先刷新转换结果，再在客户端更新订阅。若仍显示旧配置，清理转换缓存或给 INI 地址添加版本参数（例如 `?v=20261016-emby`）。

## 当前策略

- 共 27 个策略组，包含节点选择、自动选择、六个地区手选组及各自的自动测速组。
- AI、YouTube、谷歌、微软、苹果分别分流；微软和苹果默认直连。
- Play、Google CN 和 FCM 共用 `📢 谷歌`，不设置独立的 Play 或 Google CN 组；保留 Play 接口、下载域名和 GoogleCNProxyIP 覆盖。
- 更新后须重新生成 MiSub / Subconverter 结果，再更新 OpenClash 订阅；必要时为外部 INI URL 添加版本参数以避开缓存。该 INI 不控制 OpenClash 的 DNS、Fake-IP 或防火墙国内 IP 绕过，未进入内核的流量不会命中这些分流规则。
- `🎬 Emby` 引用本仓库 `rules/Emby.list`，覆盖收录的服务器域名及其子域名，默认选择 `🇯🇵 日本节点`。可选项与苹果服务一致：日本、直连、节点选择、自动选择、香港、台湾、新加坡、美国、欧洲。
- Emby 规则位于局域网规则之后、其他远程列表之前，避免被后续通用规则提前匹配。
- Telegram 根据目标 IP 分为亚太、北美、欧洲和兜底组；地区判断及实际效果存在边界，见审计说明。
- 地区组保留手选节点；进入对应“自动测速”子组后才启用同地区自动选择。Emby 默认选日本地区组，不自动切到日本自动测速；需要时在日本组内主动选择。没有日本节点时拒绝连接，不跨地区兜底。

客户端之前保存的策略组选择可能覆盖新的初始默认；更新后请确认 Emby 选择了日本节点。

## 文件结构

```text
config/ACL4SSR_Mini_AI_Custom.ini  主配置，维护 ruleset 和 custom_proxy_group
rules/Emby.list                   Emby 服务器域名精选列表
rules/Telegram_APAC.list          Telegram 亚太目标 IP
rules/Telegram_US.list            Telegram 北美目标 IP
rules/Telegram_EU.list            Telegram 欧洲目标 IP
rules/Telegram_Other.list         Telegram 广域网段及域名兜底
docs/                            使用说明、分区证据及验证记录
```

主配置引用本仓库的一份 Emby 列表和四份 Telegram 列表，其余远程规则由 ACL4SSR 提供。Emby 服务器地址统一在 `rules/Emby.list` 维护，新增服务器不需要修改 INI。

2026-10-16 清理了旧版 Full / LIAN / mini 模板、根目录四份旧列表、开发脚本和两份路由器设置示例；历史版本仍可从 Git 提交记录查看。使用过旧文件地址的客户端需要改用上述配置入口。

## Emby 收录与维护

当前共 8 条域名后缀规则：

| 来源 / 服务 | 域名 |
|---|---|
| 用户提供 | `liminalnet.us` |
| 用户提供 | `emby.edu.kg` |
| Nexitally | `emby.nexitally.com` |
| FlowerCloud | `emby.flowercloud.yt` |
| YToo | `emby.ytoo.li` |
| Nyancat | `emby.nyancat.net` |
| PrprCloud | `emby.prprcloud.com` |
| Emby 社区服务器域名 | `emby.wtf` |

公开域名选自 [blackmatrix7 Emby 规则](https://github.com/blackmatrix7/ios_rule_script/blob/master/rule/Clash/Emby/Emby.list)，核对日期为 2026-10-16；上游文件标注的更新时间是 2025-06-06。收录仅表示用于分流的地址参考，不代表确认服务仍在运营、可登录或开放注册。

列表只使用明确的服务器域名，不包含通用的 `DOMAIN-KEYWORD,emby`、整个客户端进程规则、服务商主站域名或共享 IP 段。后续优先补充实际使用且已核对的地址；播放跳转到其他域名时，需要根据客户端连接记录补充实际媒体地址，不能把整个 CDN 或网盘域名都归入 Emby。

本次将原 `🌐 LiminalNet` 组更名为 `🎬 Emby`，不额外增加策略组；组内选项与默认日本选择保持原样。更新后请在新组中确认出口选择；其他 Emby 服务的最佳出口需按实际播放情况手动选择。

## 维护与验证

INI 使用重复的 `ruleset=` 和 `custom_proxy_group=` 行，编辑时须保留顺序，不能用会合并同名键的普通 INI 读写器。

- [地区节点与自动测速](docs/Region-node-groups.md)
- [Telegram 分区审计与历史验证](docs/Telegram-routing-audit.md)
- [Telegram 验证快照](docs/Telegram-validation.json)
- [Telegram 分区证据](docs/Telegram-evidence-2026-10-16.json)

Telegram 验证 JSON 保留加入 LiminalNet 前的 26 组历史快照；LiminalNet 后续更名为 Emby，移除独立 Google Play 和 Google CN 组后当前为 27 组。此次修改的验证结果见审计说明末尾。
