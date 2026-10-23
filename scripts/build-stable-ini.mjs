import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const snapshot=JSON.parse(fs.readFileSync(path.join(root,'docs/MiSub_Stable_20261023.snapshot.json'),'utf8'));
const lines=[
    '[custom]',
    '; Stable backup of user-tested MiSub Standard '+snapshot.sourceCommit,
    '; Use with ruleLevel=none (MiSub remote/custom mode), not built-in smart injections.',
    '; DNS is supplied separately in MiSub_Stable_20261023.dns.yaml.',
    '; Hidden flags and exact dynamic region membership cannot be carried by portable INI.',
];
const emitted=new Set();
for(const rule of snapshot.rules){
    const [type,value,target,...extra]=rule.split(',');
    if(type==='RULE-SET'){
        lines.push(`ruleset=${target},${snapshot.providers[value].url}`);
    }else if(target?.startsWith('📲 TG')){
        if(!emitted.has(target)){
            lines.push(`ruleset=${target},https://raw.githubusercontent.com/imauzzc/clash/${snapshot.telegramRevision}/rules/stable/${snapshot.telegramFiles[target]}`);
            emitted.add(target);
        }
    }else if(type==='MATCH') lines.push(`ruleset=${value},[]FINAL`);
    else lines.push(`ruleset=${target},[]${[type,value,...extra].join(',')}`);
}
lines.push('');
for(const group of snapshot.groups){
    const parts=[group.name,group.type,...group.proxies.map(name=>'[]'+name)];
    if(group.nodeFilter)parts.push(group.nodeFilter==='.*'?'.*':`(${group.nodeFilter})`);
    if(group.type==='url-test'||group.type==='fallback'){
        parts.push(group.url||'http://www.gstatic.com/generate_204',`${group.interval||300},,${group.tolerance||50}`);
    }
    lines.push('custom_proxy_group='+parts.join('`'));
}
lines.push('','enable_rule_generator=true','overwrite_original_rules=true','');
fs.writeFileSync(path.join(root,'config/MiSub_Stable_20261023.ini'),lines.join('\n'));
console.log('Stable INI written.');
