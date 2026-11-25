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
- 地区组保留手选节点；进入对应“自动测速”子组后才启用同地区自动选择。没有对应地区节点时保持 REJECT，不跨地区兜底。欧洲及其他地区节点不单独分组，需在 `🚀 节点选择` 中手动指定。
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
docs/                               地区组与 Telegram 分区说明
```

主配置引用本仓库的 Emby、私享空间和四份 Telegram 列表，其余远程规则由 ACL4SSR 提供。新增 Emby 服务器只需修改 `rules/Emby.list`，无需改 INI。

## 私享空间

`🌙 私享空间` 默认选择 `🇯🇵 日本节点`，其余出口可手动切换。规则集中维护于 `rules/Japan_Custom.list`，当前包含 `pornhub.com`、`chaturbate.com`，均使用 `DOMAIN-SUFFIX` 匹配域名及其子域名。

修改后需重新生成转换结果并更新客户端订阅；客户端保存的分组选择可能覆盖初始默认。

## Telegram 分区

Telegram 根据目标 IP 分为亚太、北美和兜底组，规则集中在 `rules/Telegram_APAC.list`、`rules/Telegram_US.list`、`rules/Telegram_Other.list`。

- 分区规则按目标 IP 判断，保留 `no-resolve`。
- 地区清单必须先于兜底清单和 ACL4SSR 通用列表。
- 兜底清单同时包含 Telegram 官方 CIDR、少量欧洲专属地址和无法按域名区分数据中心地区的域名。

分区依据、判断边界与维护方式见 [Telegram 分区路由](docs/Telegram-routing.md)。

## 相关文档

INI 使用重复的 `ruleset=` 和 `custom_proxy_group=` 行，编辑时须保留顺序，不能用会合并同名键的普通 INI 读写器。此外，同一列表内不要保留被前面更宽网段覆盖的 CIDR，那类规则永远不会生效。

- [地区节点与自动测速](docs/Region-node-groups.md)
- [Telegram 分区路由](docs/Telegram-routing.md)

## 许可

配置模板、规则列表与文档采用 [CC BY-SA 4.0](LICENSE)（署名-相同方式共享 4.0 国际）授权，Copyright (C) 2026 imauzzc。

共享或修改时请保留署名与协议链接，并以相同协议分发。配置模板改编自 [ACL4SSR](https://github.com/ACL4SSR/ACL4SSR)（同为 CC BY-SA 4.0）；远程引用的第三方规则与列表版权归各项目所有。
