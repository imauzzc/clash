# sing-box 自定义规则集

这些 JSON 源格式规则集由 `python tools/generate_singbox_rules.py` 从本仓库的 Clash 列表生成，支持 sing-box 1.11 及以上。在 HomeProxy 中选择「远程」和「源文件」。修改原列表后应重新生成并一同提交。

| 文件 | 来源 | 用途 |
| --- | --- | --- |
| emby_custom.json | rules/Emby_Custom_20261023.list | 自定义域名 |
| telegram_apac.json | rules/stable/Telegram_APAC.list | Telegram 亚太 IP |
| telegram_us.json | rules/stable/Telegram_US.list | Telegram 北美 IP |
| telegram_eu.json | rules/stable/Telegram_EU.list | Telegram 欧洲 IP |
| telegram_other.json | rules/stable/Telegram_Other.list | Telegram 兜底 IP 和域名 |
| telegram_eu_other.json | 欧洲及兜底两份列表 | 合并去重，供欧洲与兜底共用出口 |

Telegram 规则有重叠，合并模式下路由规则应按亚太、北美、欧洲及兜底的顺序匹配。原列表的 `no-resolve` 没有直接写入规则集：路由中不要为匹配 IP 人为增加域名解析，否则行为可能不同。域名匹配取决于 DNS 和流量嗅探。区域分配为原配置的经验规则，不保证反映实际服务器位置。

AI、YouTube 等通用分类优先使用维护中的 MetaCubeX sing-box 规则集；其内容会更新，与仓库中冻结的 Clash 快照不一定完全一致。规则集 URL、下载路径和 DNS 应在启用前验证。

