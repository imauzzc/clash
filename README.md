# Clash 订阅转换规则

供 MiSub / Subconverter 使用的自定义规则模板，维护业务分流、地区节点和 Telegram 目标 IP 分区。

## 使用

在 MiSub 的「设置 → 服务集成 → 规则与配置方案」中填写：

```text
https://raw.githubusercontent.com/imauzzc/clash/main/config/Home_Routing.ini
```

这是转换模板，需配合节点订阅生成 Clash / Mihomo 配置，不能直接当成节点订阅导入。转换时保持 `sort=false`。

## 更新

1. 修改本仓库后，在 MiSub 刷新转换结果；如仍显示旧配置，可给 INI 地址加版本参数，例如 `?v=20261126`。
2. 在 OpenClash / 客户端更新订阅。

DNS 由 MiSub 内置生成器或「设置 → 服务集成 → DNS 覆写」管理。请保留 `🌐 DNS 出口` 策略组，否则 DNS 出口引用会失效。

编辑 INI 时保留 `ruleset=`、`custom_proxy_group=` 的顺序，不要用会合并同名键的 INI 读写器。

## 文件

```text
config/Home_Routing.ini   主配置
rules/                    Emby、私享空间、Telegram 分区列表
docs/                     地区组与 Telegram 分区说明
```

## 许可

[CC BY-SA 4.0](LICENSE)，Copyright (C) 2026 imauzzc。模板改编自 [ACL4SSR](https://github.com/ACL4SSR/ACL4SSR)，第三方规则版权归原项目所有。
