/* E235 Reader Pro formula standard: fraction alignment, semantic indices, and theory-only reference panel. */
(function(){
  'use strict';
  var RELEASE='E235_READER_PRO_FORMULA_STANDARD_R2';
  var STYLE_ID='e235-formula-standard-style';
  var FORMULA_SELECTOR='.e211-formula-modal .e226-math[data-e226-raw-formula]';
  var scheduled=false;

  function escRe(s){return String(s).replace(/[.*+?^${}()|[\]\\]/g,'\\$&');}
  function text(node){return (node&&node.textContent||'').replace(/\s+/g,' ').trim();}

  function ensureStyle(){
    if(document.getElementById(STYLE_ID))return;
    var css=''
      +FORMULA_SELECTOR+' .e234-fraction{'
      +'display:inline-grid!important;'
      +'grid-template-rows:auto auto!important;'
      +'align-items:center!important;'
      +'justify-items:stretch!important;'
      +'vertical-align:middle!important;'
      +'transform:translateY(-.04em)!important;'
      +'line-height:1!important;'
      +'margin:0 .24em!important;'
      +'min-width:max-content!important;'
      +'}'
      +FORMULA_SELECTOR+' .e234-fraction-num,'
      +FORMULA_SELECTOR+' .e234-fraction-den{'
      +'display:block!important;'
      +'box-sizing:border-box!important;'
      +'width:100%!important;'
      +'text-align:center!important;'
      +'font-size:.90em!important;'
      +'line-height:1.18!important;'
      +'white-space:nowrap!important;'
      +'}'
      +FORMULA_SELECTOR+' .e234-fraction-num{'
      +'padding:0 .30em .13em!important;'
      +'border-bottom:1.55px solid currentColor!important;'
      +'}'
      +FORMULA_SELECTOR+' .e234-fraction-den{'
      +'padding:.13em .30em 0!important;'
      +'}'
      +FORMULA_SELECTOR+' .e234-fraction .e234-fraction{'
      +'font-size:.92em!important;'
      +'margin:0 .12em!important;'
      +'}'
      +FORMULA_SELECTOR+' .e234-op{'
      +'vertical-align:middle!important;'
      +'transform:translateY(-.01em)!important;'
      +'}'
      +FORMULA_SELECTOR+' sub{'
      +'font-size:.72em!important;'
      +'line-height:0!important;'
      +'vertical-align:-.34em!important;'
      +'position:relative!important;'
      +'bottom:auto!important;'
      +'top:auto!important;'
      +'}'
      +FORMULA_SELECTOR+' sup{'
      +'font-size:.72em!important;'
      +'line-height:0!important;'
      +'vertical-align:.58em!important;'
      +'position:relative!important;'
      +'bottom:auto!important;'
      +'top:auto!important;'
      +'}';
    var style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=css;
    document.head.appendChild(style);
  }

  function indexedTokens(raw){
    var tokens=[];
    var re=/\b([A-Za-z])_\{?([A-Za-z0-9,+\-]+)\}?/g;
    var m;
    while((m=re.exec(String(raw||''))))tokens.push({base:m[1],index:m[2]});
    return tokens;
  }

  function enforceSemanticSubscripts(node){
    var raw=node.getAttribute('data-e226-raw-formula')||'';
    var tokens=indexedTokens(raw);
    if(!tokens.length)return;
    var html=node.innerHTML;
    var changed=false;
    tokens.forEach(function(token){
      var base=escRe(token.base),index=escRe(token.index);
      var wrong=new RegExp('('+base+')\\s*<sup>'+index+'<\\/sup>','g');
      var fixed=html.replace(wrong,'$1<sub>'+token.index+'</sub>');
      if(fixed!==html){html=fixed;changed=true;}
    });
    if(changed)node.innerHTML=html;
    node.setAttribute('data-e235-index-checked','1');
  }

  function isCodeLike(value){
    var s=String(value||'');
    if(!s)return false;
    var hits=0;
    [
      /\bdef\s+[A-Za-z_]\w*\s*\(/,
      /\b(import|from|return|raise|lambda)\b/,
      /\b(if|for|while|try|except)\b[^\n:]*:/,
      /\b(np|numpy|sp|torch)\.[A-Za-z_]\w*/,
      /\b(ValueError|TypeError|RuntimeError)\s*\(/,
      /\bdtype\s*=/,
      /\b[a-zA-Z_]\w*\s*=\s*np\./
    ].forEach(function(re){if(re.test(s))hits++;});
    return hits>=2;
  }

  function activeFormula(){
    var node=document.querySelector('.e132-overlay-deck.open .e202-formula-strip code')
      ||document.querySelector('.e202-formula-strip code');
    return text(node);
  }

  function advancedTheory(formula){
    var raw=String(formula||'');
    var n=raw.toLowerCase();
    if(/cos\s*\(|cosine|x\s*[·⋅]\s*y/.test(n)){
      return 'Điều kiện biên cần nhớ: cosine chỉ xác định khi cả hai vector khác zero. Trong dữ liệu thực, phải kiểm tra norm gần 0 bằng một ngưỡng epsilon; không nên tự gán cosine bằng 0 vì giá trị 0 mang nghĩa trực giao, không phải “không xác định”.';
    }
    if(/proj|projection|chiếu|x_perp/.test(n)){
      return 'Góc nâng cao: phép chiếu tách vector thành thành phần nằm trên hướng tham chiếu và phần dư vuông góc. Hướng chiếu phải khác zero; norm của phần dư cho biết lượng thông tin chưa được giải thích bởi hướng hoặc không gian đang xét.';
    }
    if(/a\^\{-?1\}|a\^-?1|inverse|nghịch đảo|ax\s*=\s*b/.test(n)){
      return 'Điều kiện số học quan trọng: ma trận khả nghịch về đại số vẫn có thể gần suy biến. Khi condition number lớn, nhiễu nhỏ trong dữ liệu có thể làm nghiệm thay đổi mạnh; trong tính toán nên ưu tiên solve thay vì tạo nghịch đảo tường minh.';
    }
    if(/grad|gradient|∇|nabla|learning.?rate|eta|alpha/.test(n)){
      return 'Góc nâng cao: hướng gradient phụ thuộc scale của từng biến, còn độ dài bước phụ thuộc learning rate. Khi các trục có độ cong rất khác nhau, quỹ đạo có thể zigzag; chuẩn hóa, preconditioning hoặc scheduler giúp tối ưu ổn định hơn.';
    }
    if(/rank|span|col\s*\(|basis|cơ sở/.test(n)){
      return 'Góc nâng cao: số vector không đồng nghĩa số hướng thông tin. Rank mới đếm số hướng độc lập; với dữ liệu nhiễu nên xem singular values và rank hiệu dụng thay vì kết luận chỉ từ việc giá trị có khác zero hay không.';
    }
    if(/sqrt|norm|\|\|/.test(n)){
      return 'Điều kiện áp dụng: trước khi so độ lớn hoặc khoảng cách, các thành phần phải cùng schema và đơn vị. Nếu các chiều có scale khác nhau, một chiều lớn có thể chi phối toàn bộ kết quả dù không quan trọng hơn về mặt kỹ thuật.';
    }
    return 'Góc nâng cao: hãy kiểm tra miền xác định, đơn vị, trường hợp biên và độ nhạy số trước khi dùng công thức trong dữ liệu thật. Một kết quả có thể đúng đại số nhưng vẫn sai mô hình nếu giả thiết hoặc quy ước đầu vào không được giữ nguyên.';
  }

  function repairReferencePanel(panel){
    if(!panel)return;
    var body=panel.querySelector('.e211-summary-lead, p, pre');
    if(!body)return;
    if(!isCodeLike(text(body))){
      panel.setAttribute('data-e235-reference-ok','1');
      return;
    }
    var replacement=document.createElement('p');
    replacement.className='e211-summary-lead';
    replacement.textContent=advancedTheory(activeFormula());
    body.replaceWith(replacement);
    panel.setAttribute('data-e235-reference-repaired','1');
  }

  function apply(){
    ensureStyle();
    Array.prototype.slice.call(document.querySelectorAll(FORMULA_SELECTOR)).forEach(enforceSemanticSubscripts);
    Array.prototype.slice.call(document.querySelectorAll('.e211-extension-panel')).forEach(repairReferencePanel);
  }

  function schedule(){
    if(scheduled)return;
    scheduled=true;
    requestAnimationFrame(function(){scheduled=false;apply();});
  }

  function boot(){
    apply();
    try{new MutationObserver(schedule).observe(document.body,{childList:true,subtree:true,characterData:true});}catch(_){}
    document.addEventListener('click',function(){setTimeout(schedule,0);},true);
    document.addEventListener('keydown',function(){setTimeout(schedule,0);},true);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
  window.BAUMAN_MATH_E235_FORMULA_STANDARD={release:RELEASE,apply:apply};
})();