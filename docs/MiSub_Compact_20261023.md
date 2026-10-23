# MiSub 精简版：欧洲合并与 MetaCubeX AI

入口：

```text
https://raw.githubusercontent.com/imauzzc/clash/main/config/MiSub_Compact_20261023.ini
```

这是稳定版的独立修订，不覆盖 `MiSub_Stable_20261023.ini`，也没有切换 MiSub 网站的订阅设置。

## 本次变化

- 地区仅保留香港、台湾、日本、新加坡、美国、欧洲及其他。欧洲合并德国、荷兰、英国、法国、西班牙，并识别常见北欧、中欧节点名称；未识别的节点仍可从其他或手动切换选择。俄罗斯、土耳其暂归其他，避免地理跨区歧义。没有节点的地区可由当前 MiSub 清理。
- 每个地区只有一个手选组，不再生成各国的自动测速子组；全局自动选择、故障转移仍保留。Telegram 欧洲出口首选改为欧洲组。
- AI 使用 MetaCubeX 的 openai、anthropic、google-gemini、github-copilot、xai、perplexity 六项清单，共 104 条，全部指向同一个“🤖 智能 AI”。默认候选顺序为美国、日本、新加坡、台湾、欧洲、手动切换。出口能否使用服务须实测。
- AI 匹配置于原 AI 位置，保持广告优先以及后面的通用 Google、Apple、Microsoft、GEOIP CN、MATCH 顺序。DNS、非 AI 规则和规则源保持稳定版内容。

## AI 来源与兼容方式

来源固定在 MetaCubeX/meta-rules-dat 的 `c8c1a27018377ec8a7f60c320efb3023681909eb`，详见同目录 `MiSub_Compact_20261023.ai-sources.json`。

MiSub 当前自定义 INI 将外部 `.list` 作为 classical 读取，无法直接使用 MetaCubeX 的 domain 格式。因此 `scripts/build-meta-ai.mjs` 把裸域名转为 DOMAIN，把 `+.域名` 转为 DOMAIN-SUFFIX，没有扩展范围，再存入本仓库 `rules/compact/AI_MetaCubeX.list`。配置引用该文件的固定提交；以后更新源和脚本后，需要重新校验并更新配置引用。

没有添加整个 auth0.com、stripe.com、intercom.io 的匹配，但保留上游包含的具体辅助服务域名（如部分遥测和语音连接域名）。新清单与原生 AI 范围不同：本次六项清单不含原生显式匹配的 DeepSeek、Poe、Hugging Face、Groq、OpenRouter 等，未匹配的流量按后续规则处理。如需加入，应添加相应专项规则，不能声称新清单与旧版覆盖完全相同。

## 使用与验证

1. 保留原订阅作对照，在 MiSub 的自定义远程规则 URL 中使用本页入口，使用自定义模式（规则等级 none）。
2. DNS 与 `config/MiSub_Stable_20261023.dns.yaml` 相同；当前网站留空时的默认 DNS 也相同，不必为这次 AI 替换另改路由器 DNS。
3. 更新 OpenClash 配置，检查 AI 出口、TG 各分区出口及广告组选择。缺少对应分区节点时，当前独立生成器对 TG 分区使用 REJECT 保护，需手动指定合适出口。
4. 实测 Google Play 下载、ChatGPT/Claude/Gemini、Emby 和 Telegram。配置校验与模拟节点测试无法替代实际网络测试。

已验证五种节点组合，INI 展开后的规则与完整生成器一致，地区成员归类及组引用正常，Mihomo 配置检查通过且 11 个远程规则源全部加载。详见 validation.json。INI 仍不能携带隐藏 DNS 组标记，节点地区识别依赖名称。

本地独立生成完整配置：

```text
npm install
node scripts/render-compact.mjs nodes.yaml output.yaml
```

本地生成不会上传节点。输出含节点凭据，不要发布到仓库。重建精简模板使用 `node scripts/build-compact.mjs`，原稳定版工具仍可使用。

## 其他规则源建议

暂不一起迁移。MetaCubeX Apple、Microsoft 清单覆盖范围明显大于当前 ACL4SSR 快照，替换会改变大量流量走向，应在有具体漏匹配时单独测试。MetaCubeX category-ads-all 是另一套广告域名集合，不等价于 BanAD、BanProgramAD、BanEasyListChina，不能只按条数判断强弱或直接替掉三份清单。Telegram 通用域名清单不能代替现有 IP 分区；Emby 继续维护个人服务器域名；Google/Play 与 DNS 保留当前稳定逻辑。
