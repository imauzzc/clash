import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import yaml from 'js-yaml';
import {renderStable} from './render-stable.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const policy=JSON.parse(fs.readFileSync(path.join(root,'docs/MiSub_Compact_20261023.snapshot.json'),'utf8'));
export function renderCompact(input){return renderStable(input,policy);}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
    const [inputPath,outputPath]=process.argv.slice(2);
    if(!inputPath||!outputPath)throw new Error('Usage: node scripts/render-compact.mjs nodes.yaml output.yaml');
    fs.writeFileSync(outputPath,yaml.dump(renderCompact(yaml.load(fs.readFileSync(inputPath,'utf8'))),{lineWidth:-1,noRefs:true}));
    console.log('Compact Clash configuration written.');
}
