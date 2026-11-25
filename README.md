# Clash 订阅转换规则

维护供 MiSub / Subconverter 使用的自定义 INI，集中管理业务分流、地区节点和 Telegram 目标 IP 分区。

仓库只保留一套配置，不再维护“精简版 / 稳定版”等派生模板；所有文件名不含日期。

## 配置入口

在订阅转换工具的“外部配置 / 自定义配置”中填写：

```text
https://raw.githubusercontent.com/imauzzc/clash/main/config/ACL4SSR_Mini_AI_Custom.ini
```

INI 是转换模板，需要配合你自己的节点订阅生成 Clash / Mihomo 配置，不能直接当成节点订阅导入。转换时保持 `sort=false`。

更新本仓库后，先刷新转换结果，再在客户端更新订阅。若仍显示旧配置，清理转换缓存或给 INI 地址添加版本参数（例如 `?v=20261125`）。

## 当前策略

- 共 26 个策略组：节点选择、自动选择、DNS 出口、五个地区手选组及各自的自动测速组，外加 AI、YouTube、谷歌、微软、苹果、私享空间、Emby、全球直连、全球拦截、漏网之鱼和三个 Telegram 分区组。
- AI、YouTube、谷歌、微软、苹果分别分流；微软和苹果默认直连。
- Play、Google CN 和 FCM 共用 `📢 谷歌`，不设置独立的 Play 或 Google CN 组；保留 Play 接口、下载域名和 GoogleCNProxyIP 覆盖。
- `🎬 Emby` 默认选择 `🇺🇲 美国节点`，其余出口可手动切换。
- `🌙 私享空间` 默认选择 `🇯🇵 日本节点`，其余出口可手动切换。
- Telegram 根据目标 IP 分为亚太、北美和兜底组。
- 地区组保留手选节点；进入对应“自动测速”子组后才启用同地区自动选择。没有对应地区节点时保持 REJECT，不跨地区兜底。
- `🌐 DNS 出口` 组专供 `config/dns.yaml` 的 `#🌐 DNS 出口` 引用，不参与普通分流；切换配置时请保留该组，否则 DNS 覆写会因找不到出口组而失效。
- 该 INI 不控制 OpenClash 的 DNS、Fake-IP 或防火墙国内 IP 绕过，DNS 片段见 `config/dns.yaml`。未进入内核的流量不会命中这些分流规则。

## 文件结构

```text
config/ACL4SSR_Mini_AI_Custom.ini   唯一配置，维护 ruleset 和 custom_proxy_group
config/dns.yaml                     DNS 片段（OpenClash / MiSub DNS 覆写）
rules/Emby.list                     Emby 服务器域名列表
rules/Japan_Custom.list             私享空间域名列表
rules/Telegram_APAC.list            Telegram 亚太目标 IP
rules/Telegram_US.list              Telegram 北美目标 IP
rules/Telegram_Other.list           Telegram 兜底 IP 与域名
docs/                               使用说明、分区证据及验证记录
```

主配置引用本仓库的 Emby、私享空间和四份 Telegram 列表，其余远程规则由 ACL4SSR 提供。新增 Emby 服务器只需修改 `rules/Emby.list`，无需改 INI。

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

## 私享空间

`🌙 私享空间` 默认选择 `🇯🇵 日本节点`，其余出口可手动切换。规则集中维护于 `rules/Japan_Custom.list`，当前包含 `pornhub.com`、`chaturbate.com`，均使用 `DOMAIN-SUFFIX` 匹配域名及其子域名。

修改后需重新生成转换结果并更新客户端订阅；客户端保存的分组选择可能覆盖初始默认。

## Telegram 分区

Telegram 根据目标 IP 分为亚太、北美和兜底组，地区判断及实际效果存在边界，详见审计说明。规则集中在 `rules/Telegram_APAC.list`、`rules/Telegram_US.list`、`rules/Telegram_Other.list`。

- 分区规则按目标 IP 判断，保留 `no-resolve`。
- 地区清单必须先于兜底清单和 ACL4SSR 通用列表。
- 兜底清单同时包含 Telegram 官方 CIDR、少量欧洲专属地址和无法按域名区分数据中心地区的域名。

## 维护与验证

INI 使用重复的 `ruleset=` 和 `custom_proxy_group=` 行，编辑时须保留顺序，不能用会合并同名键的普通 INI 读写器。

- [地区节点与自动测速](docs/Region-node-groups.md)
- [Telegram 分区审计与历史验证](docs/Telegram-routing-audit.md)
- [Telegram 验证快照](docs/Telegram-validation.json)
- [Telegram 分区证据](docs/Telegram-evidence-2026-10-16.json)
