import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../docs/',import.meta.url)),files=[];
function walk(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true})){const p=path.join(dir,e.name);e.isDirectory()?walk(p):files.push(p);}}walk(root);
const errors=[];
for(const file of files){
 if(file.endsWith('.js')){const r=spawnSync(process.execPath,['--check',file],{encoding:'utf8'});if(r.status!==0)errors.push(r.stderr);}
 if(/\.(html|css|js)$/.test(file)){const s=fs.readFileSync(file,'utf8');for(const m of s.matchAll(/(?:src|href)=["']([^"']+)["']|(?:from\s*|import\s*)["'](\.[^"']+)["']/g)){const ref=m[1]||m[2];if(ref.startsWith('#')||ref.startsWith('data:')||ref.includes('${'))continue;if(/^https?:/.test(ref))errors.push(`External dependency: ${ref}`);else if(!fs.existsSync(path.resolve(path.dirname(file),ref)))errors.push(`Missing: ${file} -> ${ref}`);}}
}
const manifest=JSON.parse(fs.readFileSync(path.join(root,'manifest.webmanifest'),'utf8'));
for(const icon of manifest.icons)if(!fs.existsSync(path.join(root,icon.src)))errors.push('Missing icon: '+icon.src);
if(manifest.scope!=='./'||manifest.start_url!=='./')errors.push('Manifest must remain relative to its own repository');
if(errors.length){console.error(errors.join('\n'));process.exit(1);}
console.log(`Syntax, local references and standalone manifest OK: ${files.length} runtime files`);
