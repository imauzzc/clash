# OpenClash / MiSub Telegram 分区审计

核验日期：2026-10-16（Asia/Taipei）。基础提交：ff74e1e0134183a2fce7b94607775bf886083928。

## 使用入口与范围

MiSub 外部配置入口保持为：
https://raw.githubusercontent.com/imauzzc/clash/main/config/ACL4SSR_Mini_AI_Custom.ini

首轮修改此 INI，新增 rules/Telegram_{APAC,US,EU,Other}.list 及本审计材料；后续新增六个地区节点聚合组，见 Region-node-groups.md。仓库现有 Clash-mini.ini、Clash-Full.ini、Clash-LIAN.ini、Direct.list、AI.list 和两份路由器配置并非本 INI 的隐式依赖，不改动、不自动混入旧规则。不要把本次测试 YAML 当成真实订阅：节点是 192.0.2.1 的合成测试数据。

## 基础配置审计

- 完整读取发布版 INI 并比对 ACL4SSR 官方 ACL4SSR_Online_Mini_Ai.ini。原 18 个远程 ruleset 均 HTTP 200、有内容，未使用不存在的 GooglePlay.list。
- 保留方案 B：BanAD、BanProgramAD、BanEasyListChina。Google FCM、Google、GoogleCN、Play 11 条精确端点及补充域名仍归同一个“📢 谷歌”；YouTube 优先于 Google；苹果、微软各一组、默认 DIRECT。无独立游戏、Netflix、巴哈姆特、哔哩哔哩、网易组。SteamCN 仅为直连规则，没有游戏平台组。
- 语法为 [custom]、重复 ruleset / custom_proxy_group 键，不能用普通 INI 解析器合并同名键。内联规则 []DOMAIN 等及 []FINAL 经真正 Subconverter 验证。
- 原 Telegram.list → 节点选择，现改为 3 个地区列表 → 官方快照/域名兜底 → ACL4SSR Telegram.list → 后续业务与通用规则。整个 Telegram 块位于 LAN 之后、Play/UnBan/广告/AI/Google/Proxy/China/GeoIP 之前，避免相关域名或大段 IP 抢先命中。
- 保留原 Play 精确端点在 UnBan 前，尤其 dl.google.com 不被直连白名单抢走。广告规则仍优先于普通 AI/视频/Google 规则；这维持原方案的拦截取舍。
- 当前 20 个组引用均有效，无循环；六个地区节点组按正则收集相应节点，最后引用全局自动选择以保证非空。3 个 TG 地区组分别默认引用新加坡、美国、欧洲节点组。无相应地区节点时经地区组回到全局自动选择，保证有有效订阅节点的情况下不会空组；无法保证空订阅或节点协议无法转换仍能生成。
- 正则使用国家名及带字母边界的 SG/US/NL/DE/UK 等代码，避免 US 命中 RUSSIA/AUS。无法推断任意机场自定义名称的真实出口国，最终仍应人工检查。欧洲组涵盖荷兰、德国、英国、法国、芬兰等常见名称，不保证穷尽欧洲标签。
- select 是手动选择：默认地区偏好，不提供地区内自动故障转移。TG兜底默认“🚀 节点选择”；通用组默认“♻️ 自动选择”，后者才是 url-test。没有匹配节点时的兜底不代表地区代理故障后自动切组。MiSub/Subconverter 保持 sort=false；OpenClash 已保存的选择可能覆盖更新后的初始默认。
- 无重复远程 URL 或重复组定义。上游列表间的重叠仍在：转换 YAML 有 106 条“相同内容、相同目标”的多余重复；不同目标的相同条件也存在，例如 dl.google.com 的谷歌/UnBan 直连、Telegram 的分区/兜底/ProxyLite。按首次匹配生效，不能称完全去重。此次不复制整个 ACL4SSR 到仓库做破坏性全量去重，以保留上游更新；Telegram 区域内部/跨区域 CIDR 则无重叠。
- sentry.io、stripe.com、challenges.cloudflare.com 三条原 AI 补充仍保留。前两者是跨产品共享服务，可能把其他产品流量带到 AI 组；不是 AI 专属地址。它们未在广告规则中发现同名精确规则，仍需注意广告列表后续变化。

## DC 编号、地址与证据边界

Telegram Desktop 官方代码提供 DC1–5 的引导地址，不是所有运行时端点；help.getConfig 可更新地址。Pyrogram 项目文档将 DC1/3 标为美国 Miami，DC2/4 为荷兰 Amsterdam，DC5 为 Singapore，并提示部分 DC 可成为别名。5 是逻辑 DC 编号，不能称只有 5 个物理机房。

官方 Desktop 生产地址：DC1 149.154.175.50；DC2 149.154.167.51 和 95.161.76.100；DC3 149.154.175.100；DC4 149.154.167.91；DC5 149.154.171.5。IPv6：DC1/3 在 2001:b28:f23d::/48，DC2/4 在 2001:67c:4e8::/48，DC5 在 2001:b28:f23f::/48。Pyrogram 的 DC5 91.108.56.130 是另一端点，并非与官方 .171.5 矛盾。

官方 cidr.txt 当前有 14 条 IPv4/IPv6 CIDR，只证明其作为 Telegram 官方公布网络，不提供国家标签。BGP origin 证明宣告网络，不能单独证明服务器物理位置；RIPE country 有时只是登记国。此次将官方代码、客户端项目文档、RIPE 运营者登记 geoloc 和 RIS 路由交叉比对。逐段查询时间、origin 和登记字段见 Telegram-evidence-2026-10-16.json；所有地区结论都存在变动可能。

| 候选范围 | 当前证据与决定 |
|---|---|
| 91.108.16.0/22 | AS62014，SG/新加坡 geoloc → 亚太 |
| 91.108.56.0/23 | AS62014，包含 Pyrogram DC5 .56.130，登记 geoloc 新加坡 → 亚太 |
| 149.154.168.0/22 | AS62014，geoloc 新加坡，包含官方 DC5 .171.5 → 亚太 |
| 2001:b28:f23f::/48 | AS62014，geoloc 新加坡，官方 DC5 IPv6 → 亚太 |
| 91.108.12.0/22 | AS59930，US/Miami geoloc → 北美（实际仅美国证据） |
| 149.154.172.0/22 | AS59930，Miami geoloc，官方 DC1/3 地址 → 北美 |
| 2001:b28:f23d::/48 | AS59930，Miami geoloc，官方 DC1/3 IPv6 → 北美 |
| 91.108.4.0/22、91.108.8.0/22 | AS62041，Amsterdam geoloc → 欧洲 |
| 91.108.58.0/23 | AS62041，与 /56.0/23 的 AS62014 不同 → 欧洲，属于网络归属推断；登记仍继承 /22 新加坡 geoloc，置信度低于直接 DC 端点，需持续复核 |
| 149.154.160.0/21 | 两个 /22 均 AS62041、Amsterdam geoloc，包含 DC2/4 → 欧洲；/21 本身非单独宣告，不等于无路由 |
| 91.105.192.0/23、185.76.151.0/24 | 官方 CIDR、AS211157、FI/Helsinki geoloc → 欧洲；不宣称对应 DC2/4 |
| 2a0a:f280:203::/48 | AS211157、FI/Helsinki geoloc → 欧洲；更宽 /32 的 origin 不同，不整体划欧洲 |
| 91.108.20.0/22 | AS44907 CDN，country AZ，无统一物理定位 → TG兜底；没有足够证据称全部“印度 CDN” |
| 2001:b28:f23c::/48 | AS44907 CDN，登记 country AZ 与 Amsterdam geoloc 并存 → TG兜底；不采纳原亚太候选 |
| 其余 2a0a:f280::/32 | 官方 CIDR，RIS 对 /32 返回 AS45820 Tata，/203::/48 又为 Telegram AS211157 → TG兜底；不是全部欧洲、也不是全段都可据此认定某一个 DC |
| 95.161.64.0/20 | RIPE TM-SUBNETS/Amsterdam、AS62041 支持 Telegram 网络用途，但仅官方代码中的 95.161.76.100/32 精确归欧洲；其余继承 ACL4SSR TG兜底，未将整个 /20 定位欧洲 |
| 109.239.140.0/24 | RIPE 登记 Telegram，但当前 RIS 为 AS31500 GNM，且不在官方 CIDR → 不定位欧洲，保留上游 ACL4SSR TG兜底行为并列为待复核 |

91.108.56.0/22 拆分需精确表述：本次 RIS 查询确认存在 91.108.56.0/23 → AS62014 与 91.108.58.0/23 → AS62041 的路由差异，不是本次发生了“新拆分”，也不证明每个地址物理位置。RIPE inetnum 仍是整个 /22，country NL，geoloc 新加坡，因此不能仅凭该登记对象给两个 /23 同一个地区。

## 顺序、IPv6 与覆盖

16 条地区规则在所有 TG 大段和域名前；Other 保留全部 14 条官方 CIDR 作为安全网。这意味着 Other 与地区的重叠是有意设计，而非地区间冲突。ACL4SSR Telegram.list 再补其域名及历史网段（包括偏宽的 91.108.0.0/16）；此 /16 不在官方 CIDR 中逐段授权确认，属于继承上游的宽兜底取舍，可能包含非 Telegram 地址。若后续要求严格白名单，应另行替换该上游列表。没有把历史大段定位到国家。

IPv6 用 IP-CIDR6,...,no-resolve，可由 Subconverter 正确转换并被 Mihomo 解析。此 INI 不修改路由器 IPv6/DNS 开关；实际要保证 IPv6 流量经过 OpenClash。no-resolve 不为域名强制发起解析；只有域名而无可用目标真实 IP 时走 TG兜底。Fake-IP、嗅探及 DNS 配置可能影响可见目标，须查看连接详情。域名兜底在区域 IP 之后，因此有可匹配的真实目标 IP 时先按 IP；没有可靠目标地域时不会按域名猜国家。

此配置按“目标 IP”选择代理出口，不能改变账号归属 DC；不能保证所有通话、P2P、CDN、网页或新分配地址都有地区分类。官方快照也需定期刷新。用户尚未提供实测 traceroute、Telegram 运行时 DC options 或机场节点，未做路由器实机/真实性能验证。

## 验证与复测

- 真正运行 Subconverter 0.9.0，四套合成订阅：中英文地区节点、仅香港无地区节点、纯英文代码节点、RUSSIA/AUS/HOST 反例。首轮为 14 组，后续地区聚合版为 20 组；均为 8722 条规则，各组非空、引用有效且默认顺序正确。
- 4 份未经修改的转换 YAML 均通过 Mihomo 1.19.32 -t；这是语法/配置验证，不代表合成节点能连接。
- 对 16 条地区 CIDR 两端共 32 个边界、DC IPv4/IPv6、CDN/未知段兜底、Telegram 域名、Play/FCM/YouTube 首次匹配作断言。地区 CIDR 无重叠。
- 上游 18 个 URL 以本次 HTTP 200 快照参加转换；新 4 个 URL 在发布前用相同文件的本地 HTTP 服务参加转换。在线 Raw 发布状态必须另行报告，不能把本地替换 URL 说成发布成功。
- 路由器复测：刷新 MiSub 并更新订阅，确认当前 20 组、地区默认节点或手选出口；在连接详情检查 DC1/3、DC2/4、DC5 的 IP 和命中组；分别测消息、媒体上传下载、通话、IPv6；对比新加坡/美国/欧洲出口延迟、吞吐、丢包与稳定性。邻近服务器不保证代理线路最好，结果差时可随时手选其他出口。TG兜底通常保持通用节点选择。

## 来源

- 官方 CIDR：https://core.telegram.org/resources/cidr.txt
- 官方 Desktop：https://github.com/telegramdesktop/tdesktop/blob/dev/Telegram/SourceFiles/mtproto/mtproto_dc_options.cpp
- 客户端项目 DC 地点说明：https://docs.pyrogram.org/faq/what-are-the-ip-addresses-of-telegram-data-centers
- 官方动态配置：https://core.telegram.org/method/help.getConfig
- ACL4SSR 基底：https://github.com/ACL4SSR/ACL4SSR/blob/master/Clash/config/ACL4SSR_Online_Mini_Ai.ini
- ACL4SSR TG：https://github.com/ACL4SSR/ACL4SSR/blob/master/Clash/Telegram.list
- Subconverter 语法：https://github.com/tindy2013/subconverter/blob/master/README-cn.md
- Subconverter 运行版：https://github.com/tindy2013/subconverter/releases/tag/v0.9.0
- Mihomo 运行版：https://github.com/MetaCubeX/mihomo/releases/tag/v1.19.32
- RIPE RIS 查询模式：https://stat.ripe.net/data/prefix-overview/data.json?resource=91.108.58.0/23
- RIPE 登记查询模式：https://stat.ripe.net/data/whois/data.json?resource=91.108.56.0/23

## 发布后回读验证

配置提交 944ce0e3df0d5395a3fa76e09abbae519cb3f538 已推送 main。8 个发布文件从 GitHub Raw 回读一致（忽略 Windows 工作文件换行差异）；INI 中全部 22 个远程列表均 HTTP 200。直接让 Subconverter 获取已发布 Raw INI 及其真实 Raw 列表后，生成的 8722 条规则和 14 个组与快照验证完全一致，且再次通过 Mihomo -t。验证仅使用合成节点，没有上传或使用真实机场订阅。详见 Telegram-validation.json。

## 地区聚合补充（2026-10-16）

新增香港、台湾、日本、新加坡、美国、欧洲六个可复用节点组。地区组内可手选本地区节点；最后的“♻️ 自动选择”是全局兜底，选择它可能跨地区。TG 三组默认分别引用新加坡、美国、欧洲节点组；通用、AI、YouTube、谷歌、苹果、微软、漏网及 TG 兜底均可选择地区组。所有 ruleset 行、四份 Telegram IP 列表保持不变。最新聚合版四套合成订阅均为 20 组，已通过 Subconverter 转换、Mihomo -t、非空组、引用无环和地区正则反例检查。初轮发布验证段记录的是当时的 14 组版本；最新结构及使用方法见 Region-node-groups.md。
