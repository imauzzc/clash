import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const revision='c8c1a27018377ec8a7f60c320efb3023681909eb';
const url=`https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/${revision}/geo/geosite/youtube.list`;
const response=await fetch(url,{signal:AbortSignal.timeout(30000)});
if(!response.ok)throw new Error(`YouTube: HTTP ${response.status}`);
const entries=(await response.text()).split(/\r?\n/).map(s=>s.trim()).filter(s=>s&&!s.startsWith('#'));
const rules=[...new Set(entries.map(entry=>{
    if(!/^(\+\.)?[a-zA-Z0-9_.-]+$/.test(entry))throw new Error(`Unsupported domain rule: ${entry}`);
    return entry.startsWith('+.')?`DOMAIN-SUFFIX,${entry.slice(2)}`:`DOMAIN,${entry}`;
}))];
await fs.mkdir(path.join(root,'rules/compact'),{recursive:true});
await fs.writeFile(path.join(root,'rules/compact/YouTube_MetaCubeX.list'),[
    '# Source: https://github.com/MetaCubeX/meta-rules-dat',
    `# Frozen source revision: ${revision}`,
    '# YouTube routing; not an advertisement blocking list.',
    '# Bare domain -> DOMAIN; +.domain -> DOMAIN-SUFFIX. No extra matches.',
    ...rules,'',
].join('\n'));
await fs.writeFile(path.join(root,'docs/MiSub_Compact_20261023.youtube-source.json'),JSON.stringify({
    repository:'MetaCubeX/meta-rules-dat',revision,url,entries:entries.length,uniqueRules:rules.length,
    conversion:'bare domain -> DOMAIN; +.domain -> DOMAIN-SUFFIX; no extra rules',
},null,2)+'\n');
console.log(`MetaCubeX YouTube: ${rules.length} rules.`);
