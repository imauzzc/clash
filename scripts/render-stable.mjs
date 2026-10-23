import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import yaml from 'js-yaml';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const snapshot=JSON.parse(fs.readFileSync(path.join(root,'docs/MiSub_Stable_20261023.snapshot.json'),'utf8'));

/** Render from existing Clash nodes without relying on a particular MiSub version. */
export function renderStable(input){
    const config=structuredClone(input);
    if(!Array.isArray(config.proxies)||!config.proxies.length) throw new Error('Input must contain non-empty proxies.');
    const proxies=config.proxies.map(({metadata,...proxy})=>proxy);
    const groups=snapshot.groups.map(({nodeFilter,...group})=>({
        ...structuredClone(group),
        proxies:[...group.proxies,...(nodeFilter?proxies.filter(p=>new RegExp(nodeFilter,'i').test(p.name)).map(p=>p.name):[])],
    }));
    // Remove absent regional selectors together with their automatic child groups.
    const emptyRegions=new Set(groups.filter(g=>g.hidden&&g.name.startsWith('⚡️')&&!g.proxies.length).map(g=>g.name));
    const absentSelectors=new Set(groups.filter(g=>g.name.endsWith('节点')&&g.type==='select'&&g.proxies.every(n=>emptyRegions.has(n))).map(g=>g.name));
    const kept=groups.filter(g=>!emptyRegions.has(g.name)&&!absentSelectors.has(g.name));
    const valid=new Set([...kept.map(g=>g.name),...proxies.map(p=>p.name),'DIRECT','REJECT']);
    for(const group of kept){
        const preferred=group.proxies[0];
        group.proxies=group.proxies.filter(n=>valid.has(n));
        if(group.name.startsWith('📲 TG')&&group.name!=='📲 TG兜底'&&!valid.has(preferred)) group.proxies.unshift('REJECT');
        if(!group.proxies.length)group.proxies=['REJECT'];
    }
    return {
        ...config,'mixed-port':7890,'allow-lan':false,'bind-address':'127.0.0.1',ipv6:false,
        mode:'rule','log-level':'info','external-controller':'127.0.0.1:9090',
        dns:structuredClone(snapshot.dns),proxies,'proxy-groups':kept,
        'rule-providers':structuredClone(snapshot.providers),rules:[...snapshot.rules],
    };
}

if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
    const [inputPath,outputPath]=process.argv.slice(2);
    if(!inputPath||!outputPath)throw new Error('Usage: node scripts/render-stable.mjs nodes.yaml output.yaml');
    const rendered=renderStable(yaml.load(fs.readFileSync(inputPath,'utf8')));
    fs.writeFileSync(outputPath,yaml.dump(rendered,{lineWidth:-1,noRefs:true}));
    console.log('Stable Clash configuration written.');
}
