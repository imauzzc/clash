#!/usr/bin/env python3
"""Generate sing-box source rule sets from the repository's Clash lists."""
import ipaddress
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCES = {
    "emby_custom": "rules/Emby_Custom_20261023.list",
    **{f"telegram_{name.lower()}": f"rules/stable/Telegram_{name}.list"
       for name in ("APAC", "US", "EU", "Other")},
}

def convert(path):
    fields = {"domain": [], "domain_suffix": [], "ip_cidr": []}
    kinds = {"DOMAIN": "domain", "DOMAIN-SUFFIX": "domain_suffix",
             "IP-CIDR": "ip_cidr", "IP-CIDR6": "ip_cidr"}
    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        parts = line.split(",")
        if parts[0] not in kinds or len(parts) not in (2, 3):
            raise ValueError(f"Unsupported rule in {path}: {line}")
        if len(parts) == 3 and (parts[0] not in ("IP-CIDR", "IP-CIDR6") or parts[2] != "no-resolve"):
            raise ValueError(f"Unsupported modifier in {path}: {line}")
        if parts[0].startswith("IP-"):
            net = ipaddress.ip_network(parts[1], strict=True)
            if net.version != (6 if parts[0] == "IP-CIDR6" else 4):
                raise ValueError(f"Wrong address family: {line}")
        fields[kinds[parts[0]]].append(parts[1])
    # Separate headless rules are ORed, including mixed domain/IP lists.
    return {"version": 3, "rules": [{k: v} for k, v in fields.items() if v]}

if __name__ == "__main__":
    out = ROOT / "rules" / "sing-box"
    out.mkdir(parents=True, exist_ok=True)
    for name, source in SOURCES.items():
        (out / f"{name}.json").write_text(
            json.dumps(convert(ROOT / source), ensure_ascii=False, indent=2) + "\n",
            encoding="utf-8", newline="\n")

