const fs=require('fs'), path=require('path');
const root=path.resolve(__dirname,'..');
const manifest=JSON.parse(fs.readFileSync(path.join(root,'subject-manifest.json'),'utf8'));
const tests=JSON.parse(fs.readFileSync(path.join(root,'data/tests.json'),'utf8'));
const lessons=JSON.parse(fs.readFileSync(path.join(root,'data/lessons.json'),'utf8'));
const curriculum=JSON.parse(fs.readFileSync(path.join(root,'data/curriculum.json'),'utf8'));
let ok=true;
function fail(msg){ok=false; console.error('FAIL',msg)}
function pass(msg){console.log('OK',msg)}
const pt=manifest.stageGate?.paperTypes||[];
const req={standard:20,intensive:40,advanced:60,deep:100};
const grid={standard:'4x5',intensive:'4x5_page20',advanced:'4x5_page20',deep:'5x5_page25'};
for(const [id,n] of Object.entries(req)){const p=pt.find(x=>x.id===id); if(!p)fail('missing paper type '+id); else if(p.questions!==n)fail('wrong question count '+id); else if(p.flagGrid!==grid[id])fail('wrong flag grid '+id); else pass('paper '+id+' '+n+' '+grid[id]);}
const mix=manifest.stageGate?.difficultyMix||tests.difficultyMix||{};
const sum=Object.values(mix).reduce((a,b)=>a+Number(b||0),0); if(Math.abs(sum-1)>0.001)fail('difficulty mix sum !=1'); else pass('difficulty mix sum 1');
const lessonIds=new Set((lessons.items||[]).map(x=>x.id));
for(const q of tests.items||[]){ if(!lessonIds.has(q.lessonId)) fail('question '+q.id+' points to missing lesson '+q.lessonId); if(!['easy','medium','good','excellent'].includes(q.difficulty)) fail('question '+q.id+' wrong difficulty '+q.difficulty); if(!q.remediation?.lessonId) fail('question '+q.id+' missing remediation lesson');}
for(const st of curriculum.stages||[]){const parts=st.parts || (st.durationDays>21?4:(st.durationDays>=14?3:2)); for(let part=1; part<=parts; part++){const qs=(tests.items||[]).filter(q=>q.stageId===st.id && Number(q.partId||1)===part); if(qs.length < 20) fail(`stage ${st.id} part ${part} has <20 questions`); const byDiff={easy:0,medium:0,good:0,excellent:0}; qs.forEach(q=>byDiff[q.difficulty]=(byDiff[q.difficulty]||0)+1); if(Object.values(byDiff).some(v=>v===0)) fail(`stage ${st.id} part ${part} misses a difficulty bucket`); else pass(`stage ${st.id} part ${part} coverage ${qs.length}`); }}
process.exit(ok?0:1);