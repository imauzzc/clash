import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const revision='c8c1a27018377ec8a7f60c320efb3023681909eb';
const services=['openai','anthropic','google-gemini','github-copilot','xai','perplexity'];
const rules=new Set();
const sources=[];
for(const service of services){
    const url=`https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/${revision}/geo/geosite/${service}.list`;
    const response=await fetch(url,{signal:AbortSignal.timeout(30000)});
    if(!response.ok)throw new Error(`${service}: HTTP ${response.status}`);
    const entries=(await response.text()).split(/\r?\n/).map(s=>s.trim()).filter(s=>s&&!s.startsWith('#'));
    for(const entry of entries){
        // MetaCubeX domain format: bare name is exact, +.name includes all subdomains.
        // Reject new syntax rather than silently altering its matching semantics.
        if(!/^(\+\.)?[a-zA-Z0-9_.-]+$/.test(entry))throw new Error(`Unsupported domain rule: ${entry}`);
        rules.add(entry.startsWith('+.')?`DOMAIN-SUFFIX,${entry.slice(2)}`:`DOMAIN,${entry}`);
    }
    sources.push({service,url,entries:entries.length});
}
await fs.mkdir(path.join(root,'rules/compact'),{recursive:true});
await fs.writeFile(path.join(root,'rules/compact/AI_MetaCubeX.list'),[
    '# Source: https://github.com/MetaCubeX/meta-rules-dat',
    `# Frozen source revision: ${revision}`,
    '# Services: '+services.join(', '),
    '# Domain format converted to classical rules without expanding coverage.',
    ...rules,'',
].join('\n'));
await fs.writeFile(path.join(root,'docs/MiSub_Compact_20261023.ai-sources.json'),JSON.stringify({
    repository:'MetaCubeX/meta-rules-dat',revision,sources,uniqueRules:rules.size,
    conversion:'bare domain -> DOMAIN; +.domain -> DOMAIN-SUFFIX; no extra rules',
},null,2)+'\n');
console.log(`MetaCubeX AI: ${rules.size} unique rules from ${services.length} services.`);
