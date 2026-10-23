import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const base=JSON.parse(fs.readFileSync(path.join(root,'docs/MiSub_Stable_20261023.snapshot.json'),'utf8'));
const policy=structuredClone(base);
const europe='🇪🇺 欧洲节点';
const other='🌍 其他节点';
const retained=['🇭🇰 香港节点','🇹🇼 台湾节点','🇯🇵 日本节点','🇸🇬 狮城节点','🇺🇸 美国节点'];
const european=['🇩🇪 德国节点','🇳🇱 荷兰节点','🇬🇧 英国节点','🇫🇷 法国节点','🇪🇸 西班牙节点'];
const regional=base.groups.filter(g=>g.type==='select'&&g.name.endsWith('节点'));
const europeFilter=[...european.map(name=>regional.find(g=>g.name===name).nodeFilter),
    '欧洲|Europe|🇪🇺|德国|🇩🇪|🇳🇱|🇬🇧|🇫🇷|🇪🇸|🇸🇪|🇫🇮|🇳🇴|🇩🇰|🇨🇭|🇦🇹|🇮🇹|🇮🇪|🇵🇱|🇵🇹|🇧🇪|🇨🇿|🇱🇺|🇮🇸',
    '瑞典|Sweden|Stockholm|芬兰|Finland|Helsinki|挪威|Norway|Oslo|丹麦|Denmark|Copenhagen|瑞士|Switzerland|Zurich|奥地利|Austria|Vienna|意大利|Italy|Milan|爱尔兰|Ireland|Dublin|波兰|Poland|Warsaw|葡萄牙|Portugal|Lisbon|比利时|Belgium|Brussels|捷克|Czech|Prague|卢森堡|Luxembourg|冰岛|Iceland|Reykjavik',
    '(?:^|[^a-z])(?:EU|SE|STO|FI|HEL|NO|OSL|DK|CPH|CH|ZRH|AT|VIE|IT|MIL|IE|DUB|PL|WAW|PT|LIS|BE|BRU|CZ|PRG|LU|IS|KEF)(?:$|[^a-z])'].join('|');
const regionGroups=retained.map(name=>({...structuredClone(regional.find(g=>g.name===name)),proxies:[]}));
regionGroups.push({name:europe,type:'select',proxies:[],nodeFilter:europeFilter});
regionGroups.push({name:other,type:'select',proxies:[],nodeFilter:`^(?!.*(?:${regionGroups.map(g=>g.nodeFilter).join('|')})).*$`});
const mapping=new Map(regional.map(g=>[g.name,retained.includes(g.name)?g.name:european.includes(g.name)?europe:other]));
policy.groups=base.groups.filter(g=>!regional.includes(g)&&!g.name.startsWith('⚡️')).map(g=>({
    ...structuredClone(g),proxies:[...new Set(g.proxies.map(n=>mapping.get(n)||n))],
}));
const insert=policy.groups.findIndex(g=>g.name==='🤖 智能 AI');
policy.groups.splice(insert,0,...regionGroups);
policy.groups.find(g=>g.name==='🤖 智能 AI').proxies=['🇺🇸 美国节点','🇯🇵 日本节点','🇸🇬 狮城节点','🇹🇼 台湾节点',europe,'👋 手动切换'];
// Replace all old AI matches at their original priority, before general Google and CN.
let inserted=false;
policy.rules=base.rules.flatMap(rule=>{
    if(rule.split(',')[2]!=='🤖 智能 AI')return [rule];
    if(inserted)return [];
    inserted=true;
    return ['RULE-SET,AI,🤖 智能 AI'];
});
const aiSources=JSON.parse(fs.readFileSync(path.join(root,'docs/MiSub_Compact_20261023.ai-sources.json'),'utf8'));
const revision=aiSources.revision;
policy.providers.AI={type:'http',behavior:'classical',format:'text',
    url:'https://raw.githubusercontent.com/imauzzc/clash/d649b5a17914df2d62b460add5fb72ce16904791/rules/compact/AI_MetaCubeX.list',
    path:'./ruleset/AI_Compact.list',interval:86400};
// Keep the personal server list in one maintainable location, at its existing priority.
policy.providers.EMBY={type:'http',behavior:'classical',format:'text',
    url:'https://raw.githubusercontent.com/imauzzc/clash/main/rules/Emby.list',
    path:'./ruleset/Emby.list',interval:86400};
let embyInserted=false;
policy.rules=policy.rules.flatMap(rule=>{
    if(rule.split(',')[2]!=='🎬 Emby')return [rule];
    if(embyInserted)return [];
    embyInserted=true;
    return ['RULE-SET,EMBY,🎬 Emby'];
});
const youtubeSource=JSON.parse(fs.readFileSync(path.join(root,'docs/MiSub_Compact_20261023.youtube-source.json'),'utf8'));
policy.youtubeRevision=youtubeSource.revision;
policy.providers.YOUTUBE={type:'http',behavior:'classical',format:'text',
    url:'https://raw.githubusercontent.com/imauzzc/clash/8afaa2aea298a7bc346be40f639138d72fe403c1/rules/compact/YouTube_MetaCubeX.list',
    path:'./ruleset/YouTube_MetaCubeX.list',interval:86400};
policy.rules.splice(policy.rules.indexOf('RULE-SET,AI,🤖 智能 AI')+1,0,'RULE-SET,YOUTUBE,📺 YouTube');
policy.groups.splice(policy.groups.findIndex(g=>g.name==='🎬 Emby'),0,{
    name:'📺 YouTube',type:'select',
    proxies:['♻️ 自动选择','🔯 故障转移',...regionGroups.map(g=>g.name),'👋 手动切换'],
});
policy.supportedRegionNames=['香港','台湾','日本','新加坡','美国','欧洲','其他'];
policy.variant='compact';
policy.aiRevision=revision;
fs.writeFileSync(path.join(root,'docs/MiSub_Compact_20261023.snapshot.json'),JSON.stringify(policy,null,2)+'\n');
const lines=['[custom]','; Compact derivative of MiSub_Stable_20261023; user runtime test required.',
    '; Use ruleLevel=none; DNS matches MiSub_Stable_20261023.dns.yaml.',
    '; Six regional selectors plus Other. Each region has one manual selector.'];
const emitted=new Set();
for(const rule of policy.rules){
    const [type,value,target,...extra]=rule.split(',');
    if(type==='RULE-SET')lines.push(`ruleset=${target},${policy.providers[value].url}`);
    else if(target?.startsWith('📲 TG')){
        if(!emitted.has(target)){
            lines.push(`ruleset=${target},https://raw.githubusercontent.com/imauzzc/clash/${policy.telegramRevision}/rules/stable/${policy.telegramFiles[target]}`);
            emitted.add(target);
        }
    }else if(type==='MATCH')lines.push(`ruleset=${value},[]FINAL`);
    else lines.push(`ruleset=${target},[]${[type,value,...extra].join(',')}`);
}
lines.push('');
for(const group of policy.groups){
    const parts=[group.name,group.type,...group.proxies.map(n=>'[]'+n)];
    if(group.nodeFilter)parts.push(group.nodeFilter==='.*'?'.*':`(${group.nodeFilter})`);
    if(group.type==='url-test'||group.type==='fallback')parts.push(group.url||'http://www.gstatic.com/generate_204',`${group.interval||300},,${group.tolerance||50}`);
    lines.push('custom_proxy_group='+parts.join('`'));
}
lines.push('','enable_rule_generator=true','overwrite_original_rules=true','');
fs.writeFileSync(path.join(root,'config/MiSub_Compact_20261023.ini'),lines.join('\n'));
console.log('Compact snapshot and INI written.');
