const fs=require('fs'), path=require('path');
const root=path.resolve(__dirname,'..');
let ok=true;
for(const file of fs.readdirSync(path.join(root,'data')).filter(x=>x.endsWith('.json'))){try{JSON.parse(fs.readFileSync(path.join(root,'data',file),'utf8')); console.log('OK',file)}catch(e){ok=false; console.error('FAIL',file,e.message)}}
process.exit(ok?0:1);
