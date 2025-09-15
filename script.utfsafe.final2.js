
/*! UTF‑8 SAFE, block-aware parser, kibo altName & dual container support */
'use strict';

/* ========= Korean keys/labels (escaped to be encoding-proof) ========= */
const KK = {
  CHAR_KEY: '\uCE90\uB9AD\uD130\uBA85',         // 캐릭터명
  CHAR_KEY_ALT: '\uCE90\uB9AD\uBA85',           // 캐릭명
  KIBO_KEY: '\uD0A4\uBCF4 \uC774\uB984',        // 키보 이름
  RACE: '\uC885\uC871',                         // 종족
  ATTR: '\uC18D\uC131',                         // 속성
  CHANNEL: '\uACF5\uAC1C\uCC44\uB110',          // 공개채널
  SHOT: '\uC2A4\uC0F7',                         // 스샷
  NOTE: '\uBE44\uACE0',                         // 비고
  UNKNOWN: '\uBBF8\uACF5\uAC1C',                // 미공개
  CHARACTERS: '\uCE90\uB9AD\uD130',             // 캐릭터
  KIBOS: '\uD0A4\uBCF4'                          // 키보
};

/* ========= Toast ========= */
const Toast = {
  el: null, queue: [], processing: false,
  init(){ this.el = document.getElementById('toast-container') || Object.assign(document.body.appendChild(document.createElement('div')), { id: 'toast-container' }); },
  show(msg, type='info', ms=2200){ this.queue.push({msg,type,ms}); if(!this.processing) this._process(); },
  _process(){ if(this.queue.length===0){ this.processing=false; return; } this.processing=true; const {msg,type,ms}=this.queue.shift(); const t=document.createElement('div'); t.className=`toast ${type}`; t.innerHTML=`<div class="toast-content"></div><button class="toast-close" aria-label="close">×</button><div class="toast-progress" style="animation-duration:${ms}ms"></div>`; t.querySelector('.toast-content').textContent=msg; this.el.appendChild(t); t.querySelector('.toast-close').onclick=()=>this.close(t); setTimeout(()=>this.close(t), ms); },
  close(t){ t.classList.add('closing'); t.addEventListener('animationend', ()=>{ t.remove(); this._process(); }); },
  success(m,ms){ this.show(m,'success',ms); }, error(m,ms){ this.show(m,'error',ms); }
};

/* ========= Helpers & Paths ========= */
const byId = id => document.getElementById(id);
const on = (el,ev,fn)=> el&&el.addEventListener(ev,fn);
const debounce=(fn,wait=180)=>{ let t; return (...a)=>{ clearTimeout(t); t=setTimeout(()=>fn(...a),wait); }; };

function baseDir(){
  const base=document.querySelector('base[href]');
  if(base){ try{ return new URL(base.getAttribute('href'), location.href).href; }catch{} }
  const u=new URL(location.href); if(!u.pathname.endsWith('/')) u.pathname=u.pathname.replace(/[^/]+$/,''); return u.origin+u.pathname;
}
const PATHS = (()=>{ const b=baseDir(); return { json: new URL('data.json',b).toString(), images: new URL('images/',b).toString(), kibo: new URL('kibo_image/',b).toString() }; })();

/* ========= State ========= */
let elements={};
let state={
  gameData:null,
  currentListType:'characters', // 'characters' | 'kibos'
  activeFilters:{ search:'', attributes:[], races:[], channels:[] },
  charts:{ attribute:null, race:null, channel:null, type:null },
  tournament:{ type:'', contestants:[], matchup:[], winners:[] },
  flashcard:{ questions:[], currentIndex:0, score:0, totalQuestions:10 }
};

/* ========= Attr helpers ========= */
function emoji(a){ return ({ '\uBD88':'\uD83D\uDD25', '\uBB3C':'\uD83D\uDCA7', '\uB545':'\uD83C\uDF0B', '\uD770':'\uD83C\uDF0B', '\uBC88\uAC1C':'\u26A1\uFE0F', '\uBC14\uB78C':'\uD83C\uDF2A\uFE0F', '\uC5B4\uB984':'\uD83C\uDF11', '\uBE5B':'\u2728', '\uC5BC\uC74C':'\u2744\uFE0F', '\uB098\uBB34':'\uD83C\uDF33', '\uBBF8\uACF5\uAC1C':'' }[a]||''); }
function color(a){ return ({ '\uBD88':'#FF5722', '\uBB3C':'#2196F3', '\uB545':'#795548', '\uD770':'#795548', '\uBC88\uAC1C':'#FFEB3B', '\uBC14\uB78C':'#4CAF50', '\uC5B4\uB984':'#9C27B0', '\uBE5B':'#FFC107', '\uC5BC\uC74C':'#00BCD4', '\uB098\uBB34':'#8BC34A', '\uBBF8\uACF5\uAC1C':'#cfd8dc' }[a]||'#cfd8dc'); }

/* ========= Image fallback ========= */
const IMG_ALIAS = {
  '\uC0B4\uB808\u00B7\uC5D4\uC2DC\uC2A4':'shalle.gif',
  '\uBAA8\uB974\uC708\u00B7\uD560\uCF58':'\uBAA8\uB974\uC708 \uD560\uCF58.jpg',
  // kibo column labels commonly used as filenames
  '\uBC30\uCD94\uB2ED':'\uBC30\uCD94\uB2ED.webp',  // 배추닭
  '\uB808\uD53C\uB514\uB9AD':'\uB808\uD53C\uB514\uB9AD.webp', // 레피디릭
  '\uBE44\uBC84':'\uBE44\uBC84.webp',   // 비버
  '\uC5EC\uC6B0':'\uC5EC\uC6B0.webp'    // 여우
};
function _variants(name){
  const s=String(name||''); return Array.from(new Set([s, s.replace(/\s+/g,''), s.replace(/[·*]/g,'').replace(/\s+/g,''), s.replace(/[·*]/g,' ').replace(/\s+/g,'_')]));
}
function setImg(img, originalSrc, name, altName, kind){
  const exts=['.png','.jpg','.jpeg','.gif','.webp']; const bases=[PATHS.images, PATHS.kibo]; const cand=[];
  const names=[name, altName].filter(Boolean);
  if(originalSrc){ const f=originalSrc.split('/').pop(); cand.push(originalSrc,'./'+originalSrc, PATHS.images+f, PATHS.kibo+f); }
  names.forEach(n=>{ if(IMG_ALIAS[n]){ const f=IMG_ALIAS[n]; cand.push(PATHS.images+f, PATHS.kibo+f); }});
  names.forEach(n=> _variants(n).forEach(v=> exts.forEach(ext=> bases.forEach(b=> cand.push(b+v+ext)))));
  let i=0; const tried=new Set();
  const next=()=>{ while(i<cand.length && tried.has(cand[i])) i++; if(i>=cand.length) return; const url=cand[i++]; tried.add(url); const t=new Image(); t.onload=()=>{ img.src=url; }; t.onerror=next; t.src=url; };
  next();
}

/* ========= Render ========= */
function itemCard(item, kind){
  const card=document.createElement('div'); card.className='item-card'; card.dataset.name=item.name;
  card.style.borderLeft=`4px solid ${color(item.attribute)}`;
  const img=document.createElement('img'); img.alt=item.name||''; img.loading='lazy'; img.src=PATHS.images+'placeholder.png'; card.appendChild(img);
  const h3=document.createElement('h3'); h3.textContent=item.name||'(name)'; card.appendChild(h3);
  const tag=document.createElement('span'); tag.className='attribute-tag'; tag.textContent=`${emoji(item.attribute)}${item.attribute||''}`; card.appendChild(tag);
  const info=document.createElement('div'); info.className='item-info';
  const s1=document.createElement('small'); s1.textContent=(kind==='characters'? KK.RACE+': '+(item.race||KK.UNKNOWN) : (item.note||''));
  const s2=document.createElement('small'); s2.textContent=KK.CHANNEL+': '+(item.releaseChannel||KK.UNKNOWN);
  info.appendChild(s1); info.appendChild(s2); card.appendChild(info);
  card.onclick=()=>showDetail(item, kind);
  requestAnimationFrame(()=> setImg(img, item.imageUrl||'', item.name||'', item.altName||'', kind));
  return card;
}
function renderList(){
  if(!state.gameData) return;
  // Choose target list container by mode
  const list = state.currentListType==='characters'
    ? byId('item-list')
    : (document.querySelector('#keyboard .keyboard-list') || byId('item-list'));
  if(!list) return;
  const kind=state.currentListType; const src=(kind==='characters'? state.gameData.characters : state.gameData.kibos)||[];
  const q=state.activeFilters.search;
  const f=src.filter(o=> (!q || JSON.stringify(o).toLowerCase().includes(q))
    && (state.activeFilters.attributes.length===0 || state.activeFilters.attributes.includes(o.attribute))
    && (kind!=='characters' || state.activeFilters.races.length===0 || state.activeFilters.races.includes(o.race))
    && (state.activeFilters.channels.length===0 || (o.releaseChannel && state.activeFilters.channels.some(ch => o.releaseChannel.includes(ch))))
  );
  const rc=byId('result-count'); if(rc) rc.textContent=String(f.length);
  list.innerHTML=''; const frag=document.createDocumentFragment(); f.forEach(it=> frag.appendChild(itemCard(it, kind))); list.appendChild(frag);
}
function showDetail(item, kind){
  const box=byId('item-detail'); if(!box) return; showSection('detail-section');
  box.innerHTML='';
  const img=document.createElement('img'); img.id='detail-image'; img.src=PATHS.images+'placeholder.png'; img.alt=item.name||'';
  const h2=document.createElement('h2'); h2.textContent=item.name||'';
  const grid=document.createElement('div'); grid.className='info-grid';
  const rows=[ [KK.ATTR, `${emoji(item.attribute)}${item.attribute||KK.UNKNOWN}`], [kind==='characters'?KK.RACE:KK.NOTE, kind==='characters'?(item.race||''):(item.note||'')], [KK.CHANNEL, item.releaseChannel||''] ];
  Object.entries(item.details||{}).forEach(([k,v])=> rows.push([k,v]));
  rows.forEach(([k,v])=>{ const s=document.createElement('strong'); s.textContent=k+':'; const span=document.createElement('span'); span.textContent=v; grid.appendChild(s); grid.appendChild(span); });
  box.appendChild(img); box.appendChild(h2); box.appendChild(grid);
  setImg(img, item.imageUrl||'', item.name||'', item.altName||'', kind);
}

/* ========= Sections / Nav ========= */
function showSection(id){
  document.querySelectorAll('main section, section.panel').forEach(s=>s.classList.add('hidden'));
  const el=byId(id); if(el) el.classList.remove('hidden');
  document.querySelectorAll('.nav-btn').forEach(b=> b.classList.toggle('active', b.dataset.target===id));
  if(id==='stats' && state.gameData) setTimeout(initCharts, 40);
}
function displayList(type){ state.currentListType=type; showSection(type==='characters'?'character':'keyboard'); renderList(); }

/* ========= Charts ========= */
function initCharts(){
  if(typeof Chart==='undefined' || !state.gameData) return;
  const mk=(canvas, prev, type, data, options)=>{ if(!canvas) return null; if(prev) prev.destroy(); return new Chart(canvas.getContext('2d'), { type, data, options }); };
  const opts={ responsive:true, maintainAspectRatio:false };
  state.charts.attribute = mk(byId('attribute-chart-canvas'), state.charts.attribute, 'pie', {
    labels: state.gameData.attributes.map(a=>a.name),
    datasets:[{ data: state.gameData.attributes.map(a=>a.count), backgroundColor: state.gameData.attributes.map(a=>a.color||color(a.name)) }]
  }, opts);
  state.charts.race = mk(byId('race-chart-canvas'), state.charts.race, 'bar', {
    labels: state.gameData.races.map(r=>r.name),
    datasets:[{ label:'\uCE90\uB9AD\uD130 \uC218', data: state.gameData.races.map(r=>r.count), backgroundColor:'#5c6bc0' }]
  }, { ...opts, plugins:{ legend:{ display:false } } });
  state.charts.channel = mk(byId('channel-chart-canvas'), state.charts.channel, 'doughnut', {
    labels: state.gameData.releaseChannels.map(c=>c.name),
    datasets:[{ data: state.gameData.releaseChannels.map(c=>c.count), backgroundColor:['#00BCD4','#CDDC39','#FF5722','#9E9E9E','#8BC34A','#3F51B5'] }]
  }, opts);
  state.charts.type = mk(byId('type-chart-canvas'), state.charts.type, 'pie', {
    labels:['\uCE90\uB9AD\uD130', '\uD0A4\uBCF4'],
    datasets:[{ data:[state.gameData.characters.length, state.gameData.kibos.length], backgroundColor:['#5c6bc0','#26a69a'] }]
  }, opts);
}

/* ========= Filters ========= */
function initFilters(){
  if(!state.gameData) return;
  const chip=(label,count,val)=>`<div class="chip" data-value="${val}">${label} (${count})</div>`;
  const attr=byId('attribute-filters'); if(attr){ attr.innerHTML=state.gameData.attributes.filter(a=>a.count>0).map(a=> chip(`${emoji(a.name)} ${a.name}`, a.count, a.name)).join(''); attr.querySelectorAll('.chip').forEach(c=> c.onclick=()=>toggleFilter(c,'attributes')); }
  const race=byId('race-filters'); if(race){ race.innerHTML=state.gameData.races.map(r=> chip(r.name, r.count, r.name)).join(''); race.querySelectorAll('.chip').forEach(c=> c.onclick=()=>toggleFilter(c,'races')); }
  const ch=byId('channel-filters'); if(ch){ ch.innerHTML=state.gameData.releaseChannels.map(x=> chip(x.name, x.count, x.name)).join(''); ch.querySelectorAll('.chip').forEach(c=> c.onclick=()=>toggleFilter(c,'channels')); }
}
function toggleFilter(el,key){
  const v=el.dataset.value; const onAct=el.classList.contains('active');
  if(onAct){ el.classList.remove('active'); const i=state.activeFilters[key].indexOf(v); if(i>-1) state.activeFilters[key].splice(i,1); }
  else { el.classList.add('active'); if(!state.activeFilters[key].includes(v)) state.activeFilters[key].push(v); }
  activeFiltersView(); renderList();
}
function activeFiltersView(){
  const dv=byId('active-filters'); if(!dv) return;
  const tags=[ ...state.activeFilters.attributes.map(a=>({type:'attribute',value:a,display:`${emoji(a)} ${a}`})), ...state.activeFilters.races.map(r=>({type:'race',value:r,display:r})), ...state.activeFilters.channels.map(c=>({type:'channel',value:c,display:c})) ];
  dv.innerHTML = tags.map(f=>`<span class="active-filter">${f.display}<span class="remove-filter" data-type="${f.type}" data-value="${f.value}">×</span></span>`).join('');
  dv.querySelectorAll('.remove-filter').forEach(b=> b.onclick=()=>removeFilter(b.dataset.type, b.dataset.value));
}
function removeFilter(type, value){
  const map={ attribute:'attributes', race:'races', channel:'channels' }; const key=map[type]; if(!key) return;
  const i=state.activeFilters[key].indexOf(value); if(i>-1) state.activeFilters[key].splice(i,1);
  document.querySelectorAll(`.chip.active[data-value="${value}"]`).forEach(c=> c.classList.remove('active'));
  activeFiltersView(); renderList();
}

/* ========= Community ========= */
function setupCommunity(){
  const sec=byId('community'); if(!sec) return;
  sec.querySelectorAll('.community-link').forEach(a=> a.addEventListener('click', (e)=>{ e.preventDefault(); openCommunity(a.href); }));
  if(!byId('community-viewer')){
    const wrap=document.createElement('div'); wrap.id='community-viewer'; wrap.innerHTML=`<div class="stats-card"><iframe id="community-iframe" title="viewer" style="width:100%;height:520px;border:0;border-radius:12px;box-shadow:0 2px 12px rgba(0,0,0,.08)"></iframe><div id="community-fallback" style="display:none;margin-top:8px;color:#607d8b">\uC784\uBCA0\uB4DC\uAC00 \uCC28\uB2E8\uB41C \uC0AC\uC774\uD2B8\uC785\uB2C8\uB2E4. <a id="community-open-new" target="_blank" rel="noopener">\uC0C8 \uD0ED\uC5D0\uC11C \uC5F4\uAE30</a></div></div>`;
    sec.appendChild(wrap);
  }
}
function openCommunity(url){
  setupCommunity();
  setupMiniGames(); const f=byId('community-iframe'); const fb=byId('community-fallback'); const a=byId('community-open-new'); if(a) a.href=url; if(fb) fb.style.display='none';
  if(!f) return; f.onload=()=>{ setTimeout(()=>{ try{ const loc=f.contentWindow.location.href; if(loc==='about:blank' || loc==='about:blank#blocked'){ if(fb) fb.style.display='block'; } }catch(_){ /* cross-origin OK */ } }, 600); }; f.src=url;
}

/* ========= Parse (block aware) ========= */
const pick=(obj,...keys)=>{ for(const k of keys){ const v=obj?.[k]; if(v!=null && String(v).trim()!=='') return String(v).trim(); } return ''; };
function parseCharacterBlocks(rows){
  const out=[]; if(!Array.isArray(rows)) return out; let i=0; const KEY1=KK.CHAR_KEY, KEY2=KK.CHAR_KEY_ALT;
  while(i<rows.length){
    const r=rows[i];
    if(r && (r[KEY1]===KK.CHAR_KEY || r[KEY2]===KK.CHAR_KEY_ALT)){
      const key = r[KEY1]!=null ? KEY1 : KEY2;
      const cols=Object.keys(r).filter(k=>k!==key);
      const nameByCol={}; cols.forEach(col=>{ const nm=pick(r,col); if(nm) nameByCol[col]=nm; });
      const block={}; let j=i+1;
      for(; j<rows.length; j++){
        const f=(rows[j]?.[key]); if(f===KK.CHAR_KEY || f===KK.CHAR_KEY_ALT) break;
        if(f===KK.SHOT){ j++; break; }
        if(f) block[f]=rows[j];
      }
      Object.entries(nameByCol).forEach(([col,realName])=>{
        const attribute = pick(block[KK.ATTR], col);
        const race      = pick(block[KK.RACE], col);
        const release   = pick(block[KK.CHANNEL], col);
        out.push({ name: realName, attribute, race, releaseChannel: release, imageUrl:'', details:{} });
      });
      i=j; continue;
    }
    i++;
  }
  return out;
}
function parseKiboBlocks(rows){
  const out=[]; if(!Array.isArray(rows)) return out; let i=0; const KEY=KK.KIBO_KEY;
  while(i<rows.length){
    const r=rows[i];
    if(r && r[KEY]===KK.KIBO_KEY){
      const cols=Object.keys(r).filter(k=>k!==KEY);
      const nameByCol={}; cols.forEach(col=>{ const nm=pick(r,col); if(nm) nameByCol[col]=nm; });
      const block={}; let j=i+1;
      for(; j<rows.length; j++){
        const f=rows[j]?.[KEY]; if(f===KK.KIBO_KEY) break;
        if(f===KK.SHOT){ j++; break; }
        if(f) block[f]=rows[j];
      }
      Object.entries(nameByCol).forEach(([col,realName])=>{
        const attribute = pick(block[KK.ATTR], col);
        const note      = pick(block[KK.NOTE], col);
        const release   = pick(block[KK.CHANNEL], col);
        out.push({ name: realName, altName: col, attribute, note, releaseChannel: release, imageUrl:'', details:{} });
      });
      i=j; continue;
    }
    i++;
  }
  return out;
}
function dedupeByName(items){
  const m=new Map();
  for(const it of items){
    if(!it || !it.name) continue;
    if(!m.has(it.name)) m.set(it.name, it);
    else{
      const p=m.get(it.name); const pickF=(a,b)=>(a && String(a).trim()!=='')?a:b;
      m.set(it.name, { ...p, altName: pickF(it.altName,p.altName), attribute: pickF(it.attribute,p.attribute), race: pickF(it.race,p.race), note: pickF(it.note,p.note), releaseChannel: pickF(it.releaseChannel,p.releaseChannel), imageUrl: pickF(it.imageUrl,p.imageUrl) });
    }
  }
  return Array.from(m.values());
}
function aggregate(arr, field){
  const m=new Map(); (arr||[]).forEach(o=> String(o[field]||'').split(/\s*&\s*|,\s*/).forEach(p=>{ p=p.trim(); if(p) m.set(p,(m.get(p)||0)+1); }));
  return Array.from(m,([name,count])=>({ name, count, color: color(name) }));
}
function normalize(raw){
  const chars=[ ...parseCharacterBlocks(raw?.characterDetails), ...parseCharacterBlocks(raw?.characters) ];
  const kibos=[ ...parseKiboBlocks(raw?.kibo) ];
  const characters=dedupeByName(chars);
  const kb=dedupeByName(kibos);
  const attributes=aggregate(characters,'attribute');
  const races=Array.from(new Set(characters.map(c=>c.race).filter(Boolean))).map(n=>({name:n, count: characters.filter(c=>c.race===n).length}));
  const releaseChannels=aggregate(characters,'releaseChannel');
  return { characters, kibos:kb, attributes, races, releaseChannels, metadata: raw?.metadata||{} };
}

/* ========= Community stats small ========= */
function updateCommunityStats(){
  if(!state.gameData) return;
  const g=state.gameData; const set=(id,v)=>{ const el=byId(id); if(el) el.textContent=v; };
  set('total-characters', g.characters.length); set('total-kibos', g.kibos.length); set('total-channels', g.releaseChannels.length); set('last-updated', g.metadata.lastUpdated || new Date().toISOString().slice(0,10));
}

/* ========= App init ========= */
function init(){
  const kbH2=document.querySelector('#keyboard h2'); if(kbH2) kbH2.textContent=KK.KIBOS;
  Toast.init();
  elements={ mainContent:byId('main-content'), loader:byId('loader'),
    characterSection:byId('character'), keyboardSection:byId('keyboard'), detailSection:byId('detail-section'), statsSection:byId('stats'), communitySection:byId('community'), minigameSection:byId('minigame'),
    itemListDiv:byId('item-list'), itemDetailDiv:byId('item-detail'),
    attributeChartCanvas:byId('attribute-chart-canvas'), raceChartCanvas:byId('race-chart-canvas'), channelChartCanvas:byId('channel-chart-canvas'), typeChartCanvas:byId('type-chart-canvas')
  };
  document.querySelectorAll('.nav-btn').forEach(btn=> btn.onclick=()=>{ const t=btn.dataset.target; if(t==='character') displayList('characters'); else if(t==='keyboard') displayList('kibos'); else showSection(t); });
  const si=byId('search-input'); on(si,'input', debounce(e=>{ state.activeFilters.search=(e.target.value||'').toLowerCase(); renderList(); },200));
  on(byId('search-button'),'click', renderList);
  on(byId('apply-filters'),'click', renderList);
  on(byId('reset-filters'),'click', ()=>{ state.activeFilters={search:'',attributes:[],races:[],channels:[]}; if(si) si.value=''; document.querySelectorAll('.chip.active').forEach(c=>c.classList.remove('active')); activeFiltersView(); renderList(); });
  on(byId('back-to-list-button'),'click', ()=> showSection(state.currentListType==='characters'?'character':'keyboard'));
  setupCommunity();
  setupMiniGames();
  loadData();
}
async function loadData(){
  try{
    elements.loader.style.display='flex';
    const res=await fetch(PATHS.json,{cache:'no-store'}); if(!res.ok) throw new Error('HTTP '+res.status);
    const raw=await res.json(); state.gameData=normalize(raw); initFilters(); elements.loader.style.display='none'; elements.mainContent.classList.remove('hidden'); displayList('characters'); updateCommunityStats(); Toast.success('\uB370\uC774\uD130 OK');
  }catch(e){ console.error(e); elements.loader.innerHTML=`<div class="error-message"><h3>\uB370\uC774\uD130 \uB85C\uB529 \uC2E4\uD328</h3><p>${e.message}</p><button class="btn btn-primary" onclick="location.reload()">\uC0C8\uB85C\uACE0\uCE68</button></div>`; Toast.error('\uB370\uC774\uD130 \uC2E4\uD328'); }
}

if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', init);
else init();


// Patch: enforce Korean labels at runtime to beat encoding issues
(function enforceKoreanLabels(){
  const t=(sel,txt)=>{ const el=document.querySelector(sel); if(el) el.textContent=txt; };
  t('header h1', '\uC544\uC8FC\uB974 \uC815\uBCF4 \uBDF0\uC5B4'); // 아주르 정보 뷰어
  t('.nav-btn[data-target="character"]', '\uCE90\uB9AD\uD130');   // 캐릭터
  t('.nav-btn[data-target="keyboard"]', '\uD0A4\uBCF4');         // 키보
  t('.nav-btn[data-target="stats"]', '\uD1B5\uACC4');            // 통계
  t('.nav-btn[data-target="community"]', '\uCEE4\uBBA4\uB2C8\uD2F0'); // 커뮤니티
  t('.nav-btn[data-target="minigame"]', '\uBBF8\uB2C8\uAC8C\uC784'); // 미니게임
})();

/* === Minimal tournament & flashcard wiring === */
function setupMiniGames(){
  const favBtn=document.getElementById('open-favorite');
  const flashBtn=document.getElementById('open-flashcard');
  const tourSec=document.getElementById('tournament-section');
  const mainMinigame=document.getElementById('minigame');
  const backBtn=document.getElementById('back-to-main-menu');
  const restartBtn=document.getElementById('restart-tournament');
  if(favBtn) favBtn.onclick=()=> startTournament('characters');
  if(flashBtn) flashBtn.onclick = ()=> startFlashcard();
  if(backBtn) backBtn.onclick=()=> { showSection('minigame'); };
  if(restartBtn) restartBtn.onclick=()=> startTournament(state.tournament.type||'characters');
}
function startTournament(type){
  state.tournament.type=type;
  const pool=(type==='characters'? state.gameData.characters : state.gameData.kibos).slice();
  // pick up to 16
  for(let i=pool.length-1;i>0;i--){ const j=(Math.random()* (i+1))|0; [pool[i],pool[j]]=[pool[j],pool[i]]; }
  state.tournament.contestants = pool.slice(0, Math.min(16, pool.length));
  state.tournament.winners = [];
  showSection('tournament-section');
  nextMatch();
}
function nextMatch(){
  const list=state.tournament.contestants;
  if(list.length===1){
    // winner
    document.getElementById('winner-display').classList.remove('hidden');
    const w=list[0];
    const box=document.getElementById('final-winner');
    box.innerHTML='';
    const img=document.createElement('img'); img.alt=w.name; img.src=PATHS.images+'placeholder.png'; setImg(img, w.imageUrl||'', w.name||'', w.altName||'', state.tournament.type==='kibos'?'kibo':'character');
    const h=document.createElement('h3'); h.textContent=w.name;
    box.appendChild(img); box.appendChild(h);
    return;
  }else{
    document.getElementById('winner-display').classList.add('hidden');
  }
  const a=list.shift(); const b=list.shift();
  state.tournament.matchup=[a,b];
  drawMatchItem('match-item-1', a);
  drawMatchItem('match-item-2', b);
}
function drawMatchItem(id, item){
  const el=document.getElementById(id); if(!el) return;
  el.innerHTML='';
  const img=document.createElement('img'); img.alt=item.name; img.src=PATHS.images+'placeholder.png';
  const name=document.createElement('div'); name.style.textAlign='center'; name.textContent=item.name;
  const heart=document.createElement('div'); heart.className='heart'; heart.textContent='❤';
  el.appendChild(img); el.appendChild(name); el.appendChild(heart);
  setImg(img, item.imageUrl||'', item.name||'', item.altName||'', state.tournament.type==='kibos'?'kibo':'character');
  el.onclick=()=>{ state.tournament.winners.push(item); // winner advances
    // add back winner and remaining contestants
    state.tournament.contestants.push(...state.tournament.winners);
    state.tournament.winners=[];
    nextMatch();
  };
}


/* === Minimal Flashcard === */
function startFlashcard(){
  const wrap=document.getElementById('flashcard-wrap'); if(!wrap) return;
  const total=10;
  const pool=state.gameData.characters.slice();
  for(let i=pool.length-1;i>0;i--){ const j=(Math.random()* (i+1))|0; [pool[i],pool[j]]=[pool[j],pool[i]]; }
  state.flashcard.questions = pool.slice(0, Math.min(total, pool.length));
  state.flashcard.currentIndex=0; state.flashcard.score=0;
  wrap.classList.remove('hidden');
  drawFlashcard();
}
function drawFlashcard(){
  const q=state.flashcard.questions[state.flashcard.currentIndex];
  if(!q){ endFlashcard(); return; }
  document.getElementById('fc-counter').textContent = (state.flashcard.currentIndex+1)+' / '+state.flashcard.questions.length;
  document.getElementById('fc-score').textContent = state.flashcard.score+' 점';
  const img=document.getElementById('fc-image'); img.src=PATHS.images+'placeholder.png'; setImg(img, q.imageUrl||'', q.name||'', q.altName||'', 'character');
  // build 4 options
  const opts = new Set([q.name]); while(opts.size<4 && opts.size<state.gameData.characters.length){ const c=state.gameData.characters[(Math.random()*state.gameData.characters.length)|0]; opts.add(c.name); }
  const choices=[...opts]; for(let i=choices.length-1;i>0;i--){ const j=(Math.random()* (i+1))|0; [choices[i],choices[j]]=[choices[j],choices[i]]; }
  const box=document.getElementById('fc-options'); box.innerHTML='';
  choices.forEach(name=>{
    const b=document.createElement('button'); b.className='btn btn-secondary'; b.textContent=name;
    b.onclick=()=>{ if(name===q.name){ state.flashcard.score+=10; Toast.success('정답!'); } else { Toast.error('오답'); }
      state.flashcard.currentIndex++; drawFlashcard();
    };
    box.appendChild(b);
  });
}
function endFlashcard(){
  const wrap=document.getElementById('flashcard-wrap'); wrap.classList.add('hidden');
  document.getElementById('rank-title').classList.remove('hidden');
  const list=document.getElementById('rank-list'); if(list){ const li=document.createElement('li'); li.textContent = '오늘 점수: '+state.flashcard.score; list.appendChild(li); }
}
