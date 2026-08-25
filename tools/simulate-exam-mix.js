const fs=require('fs'), path=require('path');
const root=path.resolve(__dirname,'..');
const manifest=JSON.parse(fs.readFileSync(path.join(root,'subject-manifest.json'),'utf8'));
const tests=JSON.parse(fs.readFileSync(path.join(root,'data/tests.json'),'utf8'));
const PAPER_SIZE={standard:20,intensive:40,advanced:60,deep:100};
const order=['easy','medium','good','excellent'];
function target(type){const size=PAPER_SIZE[type]; const mix=manifest.stageGate.difficultyMix; let used=0; const counts={}; order.forEach((d,i)=>{counts[d]=i===order.length-1?size-used:Math.floor(size*(mix[d]||0)); used+=counts[d];}); return counts;}
function pick(type, part){const size=PAPER_SIZE[type]; const pool=tests.items.filter(q=>q.stageId==='prepare' && Number(q.partId)===part); const picked=[]; const used=new Set(); Object.entries(target(type)).forEach(([difficulty,count])=>{pool.filter(q=>q.difficulty===difficulty).slice(0,count).forEach(q=>{if(!used.has(q.id)){used.add(q.id); picked.push(q);}});}); if(picked.length<size){pool.forEach(q=>{if(picked.length<size&&!used.has(q.id)){used.add(q.id); picked.push(q);}});} return picked.slice(0,size);}
let ok=true;
for(const part of [1,2,3,4]) for(const type of Object.keys(PAPER_SIZE)){const qs=pick(type,part); const by={easy:0,medium:0,good:0,excellent:0}; qs.forEach(q=>by[q.difficulty]++); const exp=target(type); const same=order.every(d=>by[d]===exp[d]); if(!same||qs.length!==PAPER_SIZE[type]){ok=false; console.error('FAIL',part,type,qs.length,by,exp)} else console.log('OK',`part${part}`,type,qs.length,JSON.stringify(by));}
process.exit(ok?0:1);
