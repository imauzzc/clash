# MiSub 当前稳定版备用分流

对应用户于 2026-10-23 确认可正常使用的 MiSub 内置 Standard，来源提交：
`d26abf6f8c43b323d64b4ec29814f7b3a2394a11`。

## 备用入口

```text
https://raw.githubusercontent.com/imauzzc/clash/main/config/MiSub_Stable_20261023.ini
```

这是一份新的备用模板，原 `ACL4SSR_Mini_AI_Custom.ini` 保留作历史方案，二者不要混用。
当前 MiSub 网站仍使用已验证的内置 Standard，没有自动切换至备用模板。

需要测试备用方案时：

1. 保留原订阅作为对照。MiSub 选择“内置渲染 → 自定义远程规则 URL”，填入上述地址；也可把 INI 保存到本地自定义规则模板。当前 MiSub 会令自定义模式的规则等级为 none。
2. 设置页“DNS 覆写”可填入 `config/MiSub_Stable_20261023.dns.yaml` 的完整内容。该片段就是稳定版的默认 DNS，包含 `#🌐 DNS 出口`，因此需要同时使用本模板。设置是全局的，不能用于缺少同名 DNS 组的其他模板。原网站当前留空即使用相同默认 DNS，测试时无需同时改动路由器 DNS。
3. 更新、激活 OpenClash 订阅，确认“🎬 视频广告”选择 REJECT。Google 保持原节点选择逻辑，AI 聚合、Emby 和 Telegram 分区保持稳定版策略。
4. 测试 Google Play 下载、AI、Emby 和 Telegram。生成比较及核心校验不是实际手机下载测试，切换后的实际效果仍需本人确认。

## 与早期复杂 INI 的区别

- 沿用原内置 Google 域名、GitHub、GEOIP CN 和 MATCH；没有导入专项 Google Play、Google CN、UnBan、ChinaDomain 或 ProxyLite 规则。
- 使用原 BanAD，加 BanProgramAD 和 BanEasyListChina，共用一个广告组。
- 保留原 AI 域名范围和 OpenAi 规则源，只合并目标策略组；Emby 替换 Netflix 流媒体。
- Telegram 分区规则放在单独的 `rules/stable/` 清单，保留 IP-CIDR/IP-CIDR6 的 no-resolve。不要把这些规则改成 MiSub 当前会丢失该附加标记的内联格式。
- ACL4SSR 固定为当前内置同一提交，不追随上游列表变化。`rules/stable/` 是稳定快照；原根目录清单及旧 INI 维持原样。

## INI 可携带范围

实测将模板通过当前 MiSub 渲染后，把远程列表展开，得到的规则内容和顺序与稳定版完全一致，DNS 也相同。对应记录见 validation.json。

INI 不能携带所有客户端的完整配置：当前 MiSub 自定义模板渲染器不保留隐藏组标记，因此 DNS 组和地区测速组可能显示出来；这属于显示差异。它还会输出节点名称的内部 metadata，比较时只忽略该非路由字段。不同软件可能对候选默认值、空组清理和规则源路径有不同处理。

地区候选按本备用模板的固定顺序排列，支持原内置常用的 17 个地区及其他组。识别基于节点名称，无法复现任意节点 metadata 或 MiSub 的地区人工覆写，迁移前应检查地区归类。没有对应地区节点时要检查 Telegram 首选出口，避免误选其他地区。不能保证未来任意大版本无需检查即可完全等效。

## 独立完整配置生成

如果未来 MiSub 模板渲染行为变了，仓库还保存了不依赖 MiSub 的完整分流快照和生成工具：

```text
npm install
node scripts/render-stable.mjs nodes.yaml output.yaml
```

`nodes.yaml` 是你已有的 Clash 配置，必须包含自己的 proxies。工具在本地读取节点，替换为稳定版规则、DNS、策略组及规则源，不上传节点。输出文件包含节点凭据，不要提交到公开仓库。

这个工具在三组测试数据（18 地区节点、仅香港/美国、仅未知节点）中，与原内置生成器的 DNS、规则、规则源、节点和分组成员一致。候选地区顺序采用快照顺序，且使用名称正则识别，限制同上。它使用正确的 hidden 标记，保留 Telegram no-resolve。

修改分流时优先更新快照并重新比较；可运行 `node scripts/build-stable-ini.mjs` 从快照重建 INI。DNS 片段和 INI 必须一起维护，不能重新引入早期复杂 Google/Play 规则而仍声称与稳定版一致。
