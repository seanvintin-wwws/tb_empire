const fs=require('fs'),vm=require('vm');
const dir=__dirname + '/../../js/';
const out={};
for(const f of fs.readdirSync(dir)){
  if(!f.endsWith('.js')||f.startsWith('vue')||f==='main.js'||f==='guide_data.js')continue;
  let captured=null;
  const ctx={Vue:function(){ }, window:{matchMedia:()=>({matches:false})}};
  ctx.Vue.component=(n,o)=>{if(n==='mission')captured=o.data()};
  ctx.Vue.directive=()=>{};
  try{vm.runInNewContext(fs.readFileSync(dir+f,'utf8'),ctx)}catch(e){}
  if(!captured){console.error('fail',f);continue}
  out[f.replace('.js','')]=captured;
}
fs.writeFileSync(__dirname + '/old.json',JSON.stringify(out,null,1));
for(const [p,d] of Object.entries(out)){
  console.log('== '+p);
  for(const m of d.missions){ if(m.type==='platoon'||m.type==='deploy')continue;
    console.log(`  ${m.id} ${m.name} ${m.type} ${m.position} reqs=${(m.reqs||[]).map(r=>d.reqs?.[r]).join(' / ')} squads=${(m.preferredSquads||[]).map(s=>d.squads[s]?.name).join(' ; ').slice(0,150)}`);
  }
}
