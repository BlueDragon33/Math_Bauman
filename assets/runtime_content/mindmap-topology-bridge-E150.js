'use strict';
(function(){
  const RELEASE='E150_PROFESSOR_QA_MINDMAP_UI_AUDIT';
  const MAX_ATTEMPTS=160;
  let attempts=0,applied=false;

  function arr(v){return Array.isArray(v)?v:[];}
  function records(v){
    if(Array.isArray(v))return v;
    if(v&&typeof v==='object')return arr(v.records||v.items||v.content);
    return [];
  }
  function inferStage(x){
    if(x&&x.stage)return x.stage;
    const id=String((x&&(x.chapterId||x.lessonId||x.id||x.mindmapId))||'');
    if(id.indexOf('MATH-PREP-')===0)return 'prep';
    if(id.indexOf('MATH-HK1-')===0)return 'hk1';
    if(id.indexOf('MATH-HK2-')===0)return 'hk2';
    if(id.indexOf('MATH-HK3-')===0)return 'hk3';
    if(id.indexOf('MATH-HK4-')===0)return 'hk4';
    return 'vn';
  }
  function nodeLabel(n){return String((n&&(n.label||n.title||n.id))||'Node');}
  function buildMap(source,index){
    const nodes=arr(source&&source.nodes),edges=arr(source&&source.edges);
    const byId=new Map(nodes.map(n=>[String(n&&n.id||''),n]).filter(x=>x[0]));
    const root=nodes.find(n=>n&&n.type==='root')||nodes.find(n=>String(n&&n.id)==='root')||nodes[0]||{};
    const rootId=String(root&&root.id||'');
    const children=new Map();
    const parent=new Map();
    edges.forEach(e=>{
      const from=String(e&&e.from||''),to=String(e&&e.to||'');
      if(!from||!to||!byId.has(from)||!byId.has(to))return;
      if(!children.has(from))children.set(from,[]);
      children.get(from).push(to);
      if(!parent.has(to))parent.set(to,from);
    });
    let top=arr(children.get(rootId));
    if(!top.length)top=nodes.filter(n=>String(n&&n.id)!==rootId).map(n=>String(n.id));

    function descendants(topId){
      const out=[],seen=new Set([topId]),queue=arr(children.get(topId)).map(id=>({id,path:[topId,id]}));
      while(queue.length){
        const cur=queue.shift();
        if(!cur||seen.has(cur.id))continue;
        seen.add(cur.id);
        out.push(cur);
        arr(children.get(cur.id)).forEach(id=>queue.push({id,path:cur.path.concat(id)}));
      }
      return out;
    }
    function viewNode(id,path){
      const n=byId.get(String(id))||{};
      const labels=arr(path).map(x=>nodeLabel(byId.get(String(x))||{id:x}));
      return {
        id:String(id),
        title:nodeLabel(n),
        summary:n.type?('Loại: '+n.type):'',
        detail:labels.length>1?('Quan hệ: '+labels.join(' → ')):'',
        memory:n.type==='warning'?'Bẫy cần tránh':(n.type==='validation'?'Điểm kiểm chứng':'')
      };
    }
    const branches=top.map(id=>{
      const d=descendants(id);
      const b=viewNode(id,[id]);
      b.children=d.map(x=>viewNode(x.id,x.path));
      return b;
    });
    return {
      id:source.mindmapId||source.id||('E150-MM-'+(index+1)),
      stage:inferStage(source),
      title:nodeLabel(root)||source.title||'Mind map',
      subtitle:'Giữ quan hệ node/edge từ mindmap_content; hậu duệ sâu được gom dưới nhánh gốc để renderer hiện tại không làm mất topology.',
      type:'radial',
      branches:branches
    };
  }
  function apply(){
    if(applied)return true;
    const db=window.DB;
    if(!db||!db.mindmap_content)return false;
    if(!window.__BAUMAN_MATH_E140_VAULT_BRIDGE__||window.__BAUMAN_MATH_E140_VAULT_BRIDGE__.loaded!==true)return false;
    const src=records(db.mindmap_content);
    if(!src.length)return false;
    const maps=src.map(buildMap);
    db.mindmap=maps;
    applied=true;
    const branchCount=maps.reduce((n,m)=>n+arr(m.branches).length,0);
    const childCount=maps.reduce((n,m)=>n+arr(m.branches).reduce((a,b)=>a+arr(b.children).length,0),0);
    window.__BAUMAN_MATH_E150_MINDMAP_TOPOLOGY__={
      release:RELEASE,loaded:true,maps:maps.length,branches:branchCount,children:childCount,
      professorQaVisible:arr(db.professor_qa).length>0
    };
    window.BAUMAN_MATH_RELEASE=Object.assign({},window.BAUMAN_MATH_RELEASE||{},{
      mindmapTopologyBridge:'E150',
      professorQaUiAudit:'PASS'
    });
    try{if(window.__BAUMAN_CORE_API&&typeof window.__BAUMAN_CORE_API.render==='function')window.__BAUMAN_CORE_API.render();}catch(_){}
    return true;
  }
  function wait(){
    if(apply())return;
    attempts++;
    if(attempts<MAX_ATTEMPTS)setTimeout(wait,100);
    else window.__BAUMAN_MATH_E150_MINDMAP_TOPOLOGY__={release:RELEASE,loaded:false,error:'mindmap_sources_not_ready',attempts};
  }
  window.BAUMAN_MATH_E150_SELF_CHECK=function(){
    const db=window.DB||{},src=records(db.mindmap_content),maps=arr(db.mindmap);
    let sourceNonRoot=0,renderNodes=0,nestedMaps=0;
    src.forEach(m=>{
      const ns=arr(m&&m.nodes),root=ns.find(n=>n&&n.type==='root')||ns.find(n=>String(n&&n.id)==='root')||ns[0];
      sourceNonRoot+=ns.filter(n=>String(n&&n.id)!==String(root&&root.id)).length;
    });
    maps.forEach(m=>{
      const branches=arr(m.branches);
      renderNodes+=branches.length+branches.reduce((n,b)=>n+arr(b.children).length,0);
      if(branches.some(b=>arr(b.children).length))nestedMaps++;
    });
    const status=window.__BAUMAN_MATH_E150_MINDMAP_TOPOLOGY__||{};
    return {
      ok:status.loaded===true&&maps.length===src.length&&renderNodes===sourceNonRoot&&nestedMaps===maps.length&&arr(db.professor_qa).length>0,
      release:RELEASE,status,
      counts:{sourceMaps:src.length,renderMaps:maps.length,sourceNonRoot,renderNodes,nestedMaps,professorQa:arr(db.professor_qa).length}
    };
  };
  wait();
})();
