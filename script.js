// ═══════════════════════════════════════
// DATA
// ═══════════════════════════════════════
const EMOJIS = ['📄','📝','📋','📌','📎','🗂','📁','📂','📊','📈','📉','🗃','📑','🗒','📔','📒','📕','📗','📘','📙','📚','🔖','🏷','💡','🔍','🔎','⚙️','🛠','🔧','💻','🖥','📱','🌐','🚀','⭐','💎','🎯','🏆','✅','❌','⚠️','🔔','💬','👥','🏢','🌿','🔑','🗝','💰','📦'];
const TAG_CLASSES = ['t1','t2','t3','t4'];

let pages = JSON.parse(localStorage.getItem('wiki_pages') || 'null') || [
  {id:'home',title:'🏠 Bienvenue',emoji:'🌿',content:`<h2>Bienvenue sur votre Wiki Interne</h2><p>Votre base de connaissances centralisée pour toute l'équipe. Organisez, partagez et retrouvez facilement toutes vos informations.</p><div class="callout"><span class="callout-ico">💡</span><div><strong>Conseil de démarrage</strong><br>Tapez <code>/</code> dans l'éditeur pour accéder aux commandes rapides, ou utilisez la barre d'outils ci-dessus.</div></div><h2>Sections principales</h2><ul><li><strong>Onboarding</strong> — Guide de démarrage pour les nouvelles recrues</li><li><strong>Produit</strong> — Documentation technique et fonctionnelle</li><li><strong>Processus</strong> — Procédures et workflows internes</li><li><strong>RH & Culture</strong> — Politiques et valeurs de l'entreprise</li></ul><hr><p>Dernière mise à jour par <strong>Admin</strong> · <em>Aujourd'hui</em></p>`,tags:['accueil'],status:'published',views:142,created:Date.now()-86400000*7,modified:Date.now()-3600000,parent:null,fav:true},
  {id:'onboard',title:'Onboarding',emoji:'👋',content:`<h2>Guide d'intégration</h2><p>Bienvenue dans l'équipe ! Ce guide vous accompagne durant vos premières semaines.</p><h3>Semaine 1 — Installation</h3><ul><li>Configurer votre environnement de développement</li><li>Rejoindre les canaux Slack essentiels</li><li>Rencontrer votre équipe</li></ul><h3>Ressources utiles</h3><table><tr><th>Outil</th><th>Usage</th><th>Accès</th></tr><tr><td>Slack</td><td>Communication</td><td>IT</td></tr><tr><td>Notion</td><td>Documentation</td><td>Auto-inscription</td></tr><tr><td>GitHub</td><td>Code</td><td>Lead Dev</td></tr></table>`,tags:['rh','onboarding'],status:'published',views:38,created:Date.now()-86400000*5,modified:Date.now()-86400000*2,parent:null,fav:false},
  {id:'product',title:'Documentation Produit',emoji:'📦',content:`<h2>Architecture technique</h2><p>Notre produit est construit sur une architecture microservices moderne.</p><pre>src/\n  components/\n  pages/\n  utils/\n  api/\n  styles/</pre><h3>Technologies utilisées</h3><ul><li><strong>Frontend</strong> — React 18, TypeScript, Tailwind</li><li><strong>Backend</strong> — Node.js, Express, PostgreSQL</li><li><strong>Infra</strong> — AWS, Docker, GitHub Actions</li></ul><blockquote>Toujours écrire des tests avant de déployer en production.</blockquote>`,tags:['tech','produit'],status:'published',views:67,created:Date.now()-86400000*10,modified:Date.now()-86400000,parent:null,fav:false},
  {id:'process',title:'Processus & Workflows',emoji:'⚙️',content:`<h2>Processus de développement</h2><p>Nous suivons une méthodologie agile avec des sprints de 2 semaines.</p><h3>Cycle de vie d'une feature</h3><ol><li>Spécification et maquette</li><li>Review technique</li><li>Développement + tests</li><li>Code review</li><li>Déploiement staging</li><li>QA et validation</li><li>Déploiement production</li></ol>`,tags:['process','dev'],status:'published',views:29,created:Date.now()-86400000*3,modified:Date.now()-7200000,parent:null,fav:false},
  {id:'rh',title:'RH & Culture',emoji:'👥',content:`<h2>Nos valeurs</h2><div class="callout"><span class="callout-ico">🌟</span><div>Nous croyons en la transparence, l'autonomie et l'excellence collective.</div></div><h3>Politique de télétravail</h3><p>Le télétravail est autorisé jusqu'à <mark>3 jours par semaine</mark>. Les réunions d'équipe ont lieu le mardi matin en présentiel.</p><h3>Avantages</h3><ul><li>Budget formation : 2 000€/an</li><li>Mutuelle 100% prise en charge</li><li>25 jours de congés + RTT</li></ul>`,tags:['rh','culture'],status:'published',views:54,created:Date.now()-86400000*14,modified:Date.now()-86400000*4,parent:null,fav:false},
];

let currentPageId = 'home';
let ctxTargetId = null;
let favorites = JSON.parse(localStorage.getItem('wiki_favs') || '["home"]');
let cmdFocusIdx = 0;
let slashFocusIdx = 0;
let autoSaveTimer = null;

// ═══════════════════════════════════════
// SAVE / LOAD
// ═══════════════════════════════════════
function savePages(){
  try{localStorage.setItem('wiki_pages', JSON.stringify(pages));}catch(e){}
}
function saveDoc(){
  const page = pages.find(p=>p.id===currentPageId);
  if(!page) return;
  page.title = document.getElementById('pageTitle').innerText.trim() || 'Sans titre';
  page.content = document.getElementById('editor').innerHTML;
  page.emoji = document.getElementById('pageEmoji').textContent;
  page.status = document.getElementById('rpStatus').value;
  page.modified = Date.now();
  savePages();
  renderTree();
  updateRightPanel();
  toast('✅ Sauvegardé');
}
function scheduleAutoSave(){
  clearTimeout(autoSaveTimer);
  autoSaveTimer = setTimeout(()=>{
    const page = pages.find(p=>p.id===currentPageId);
    if(!page) return;
    page.title = document.getElementById('pageTitle').innerText.trim() || 'Sans titre';
    page.content = document.getElementById('editor').innerHTML;
    page.emoji = document.getElementById('pageEmoji').textContent;
    page.modified = Date.now();
    savePages();
    updateWordCount();
  }, 1500);
}

// ═══════════════════════════════════════
// LOAD PAGE
// ═══════════════════════════════════════
function loadPage(id){
  const page = pages.find(p=>p.id===id);
  if(!page) return;
  currentPageId = id;
  page.views = (page.views||0) + 1;
  document.getElementById('pageEmoji').textContent = page.emoji || '📄';
  document.getElementById('pageTitle').innerText = page.title.replace(/^[^\w\s]/,'').trim();
  document.getElementById('editor').innerHTML = page.content || '';
  document.getElementById('metaViews').textContent = page.views;
  document.getElementById('metaDate').textContent = timeAgo(page.modified);
  document.getElementById('rpStatus').value = page.status || 'draft';
  document.getElementById('favBtn').textContent = favorites.includes(id) ? '★ Favori' : '☆ Favori';
  renderTags();
  updateBreadcrumb(page);
  updateRightPanel();
  document.querySelectorAll('.tree-item').forEach(el=>el.classList.remove('active'));
  document.querySelector(`.tree-item[data-id="${id}"]`)?.classList.add('active');
  closeMobileSidebar();
  savePages();
}

function updateBreadcrumb(page){
  const bc = document.getElementById('breadcrumb');
  const parts = [];
  let cur = page;
  while(cur){
    parts.unshift(cur);
    cur = cur.parent ? pages.find(p=>p.id===cur.parent) : null;
  }
  bc.innerHTML = parts.map((p,i)=>{
    const isCurrent = i===parts.length-1;
    return `${i>0?'<span class="bc-sep">›</span>':''}
      <span class="bc-item ${isCurrent?'current':''}" onclick="loadPage('${p.id}')">
        ${p.emoji||'📄'} ${p.title.replace(/^[^\w\s]/,'').trim()}
      </span>`;
  }).join('');
}

// ═══════════════════════════════════════
// TREE
// ═══════════════════════════════════════
function renderTree(){
  const root = document.getElementById('treeRoot');
  const rootPages = pages.filter(p=>!p.parent);
  root.innerHTML = rootPages.map(p=>renderTreeNode(p, 0)).join('');
}

function renderTreeNode(page, depth){
  const children = pages.filter(p=>p.parent===page.id);
  const hasChildren = children.length > 0;
  const isActive = page.id === currentPageId;
  const isFav = favorites.includes(page.id);
  return `
  <div class="tree-item ${isActive?'active':''}" data-id="${page.id}"
    onclick="loadPage('${page.id}')"
    oncontextmenu="showCtx(event,'${page.id}')">
    <div class="ti-toggle ${hasChildren?'':''}">
      ${hasChildren ? '▶' : ''}
    </div>
    <span class="ti-ico">${page.emoji||'📄'}</span>
    <span class="ti-title">${page.title.replace(/^[^\w\s]/,'').trim()||'Sans titre'}</span>
    ${isFav?'<span class="ti-badge">★</span>':''}
    <div class="ti-actions">
      <button class="ti-btn" onclick="event.stopPropagation();newPage('${page.id}')" title="Sous-page">+</button>
      <button class="ti-btn" onclick="event.stopPropagation();showCtx(event,'${page.id}')" title="Menu">⋯</button>
    </div>
  </div>
  ${hasChildren ? `<div class="ti-children" id="ch-${page.id}">${children.map(c=>renderTreeNode(c,depth+1)).join('')}</div>` : ''}`;
}

// ═══════════════════════════════════════
// NEW / DELETE PAGE
// ═══════════════════════════════════════
function newPage(parentId){
  const id = 'page_' + Date.now();
  const page = {
    id, title:'Nouvelle page', emoji:'📄',
    content:'<p>Commencez à écrire ici...</p>',
    tags:[], status:'draft', views:0,
    created:Date.now(), modified:Date.now(),
    parent:parentId||null, fav:false
  };
  pages.push(page);
  savePages();
  renderTree();
  loadPage(id);
  setTimeout(()=>{
    const t = document.getElementById('pageTitle');
    t.focus();
    const range = document.createRange();
    range.selectNodeContents(t);
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(range);
  }, 50);
  toast('📄 Nouvelle page créée');
}

function deletePage(id){
  if(!confirm('Supprimer cette page ?')) return;
  const toDelete = [id];
  const getChildren = (pid) => {
    pages.filter(p=>p.parent===pid).forEach(c=>{toDelete.push(c.id);getChildren(c.id);});
  };
  getChildren(id);
  pages = pages.filter(p=>!toDelete.includes(p.id));
  if(toDelete.includes(currentPageId)) loadPage('home');
  savePages();
  renderTree();
  toast('🗑 Page supprimée');
}

function duplicatePage(id){
  const src = pages.find(p=>p.id===id);
  if(!src) return;
  const nid = 'page_' + Date.now();
  pages.push({...src, id:nid, title:src.title+' (copie)', created:Date.now(), modified:Date.now(), views:0});
  savePages(); renderTree(); loadPage(nid);
  toast('⧉ Page dupliquée');
}

// ═══════════════════════════════════════
// TAGS
// ═══════════════════════════════════════
function renderTags(){
  const page = pages.find(p=>p.id===currentPageId);
  if(!page) return;
  const tags = page.tags||[];
  const meta = document.getElementById('metaTags');
  meta.innerHTML = tags.map((t,i)=>`<span class="tag ${TAG_CLASSES[i%4]}">${t}</span>`).join('');
  const rp = document.getElementById('rpTagsDisplay');
  rp.innerHTML = tags.map((t,i)=>`<span class="tag ${TAG_CLASSES[i%4]}" style="cursor:pointer" onclick="removeTag('${t}')" title="Retirer">${t} ×</span>`).join('');
}

function addTagFromPanel(){
  const input = document.getElementById('rpTagInput');
  const val = input.value.trim().toLowerCase();
  if(!val) return;
  const page = pages.find(p=>p.id===currentPageId);
  if(!page) return;
  if(!page.tags) page.tags=[];
  if(!page.tags.includes(val)) page.tags.push(val);
  input.value='';
  renderTags(); savePages();
}

function removeTag(tag){
  const page = pages.find(p=>p.id===currentPageId);
  if(!page) return;
  page.tags = (page.tags||[]).filter(t=>t!==tag);
  renderTags(); savePages();
}

// ═══════════════════════════════════════
// FAVORITES
// ═══════════════════════════════════════
function toggleFav(){
  const id = currentPageId;
  if(favorites.includes(id)) favorites=favorites.filter(f=>f!==id);
  else favorites.push(id);
  localStorage.setItem('wiki_favs', JSON.stringify(favorites));
  document.getElementById('favBtn').textContent = favorites.includes(id)?'★ Favori':'☆ Favori';
  renderTree();
  toast(favorites.includes(id)?'⭐ Ajouté aux favoris':'Retiré des favoris');
}

// ═══════════════════════════════════════
// RIGHT PANEL
// ═══════════════════════════════════════
function openRightPanel(){document.getElementById('rightPanel').classList.add('open');}
function closeRightPanel(){document.getElementById('rightPanel').classList.remove('open');}
function updateRightPanel(){
  const page = pages.find(p=>p.id===currentPageId);
  if(!page) return;
  document.getElementById('rpCreated').textContent = fmtDate(page.created);
  document.getElementById('rpModified').textContent = fmtDate(page.modified);
  updateWordCount();
  renderTags();
}
function updateWordCount(){
  const txt = document.getElementById('editor').innerText || '';
  const words = txt.trim().split(/\s+/).filter(w=>w.length>0).length;
  document.getElementById('rpWords').textContent = words;
  document.getElementById('rpRead').textContent = Math.max(1,Math.round(words/200))+' min';
}

// ═══════════════════════════════════════
// FORMATTING
// ═══════════════════════════════════════
function fmt(cmd){document.getElementById('editor').focus();document.execCommand(cmd,false,null);updateToolbar();}
function fmtHighlight(){document.getElementById('editor').focus();document.execCommand('hiliteColor',false,'rgba(231,111,81,.2)');}
function fmtColor(c){document.getElementById('editor').focus();document.execCommand('foreColor',false,c);}
function fmtBlock(tag){
  document.getElementById('editor').focus();
  document.execCommand('formatBlock',false,tag);
}
function insertQuote(){
  document.getElementById('editor').focus();
  document.execCommand('formatBlock',false,'blockquote');
}
function insertCode(){
  const sel = window.getSelection();
  if(sel && !sel.isCollapsed){
    const range = sel.getRangeAt(0);
    const code = document.createElement('code');
    try{range.surroundContents(code);}catch(e){}
  } else {
    document.execCommand('insertHTML',false,'<code>code ici</code>');
  }
}
function insertCallout(){
  document.execCommand('insertHTML',false,`<div class="callout"><span class="callout-ico">💡</span><div>Votre note ici...</div></div><p></p>`);
}
function insertTable(){
  document.execCommand('insertHTML',false,`<table><tr><th>Colonne 1</th><th>Colonne 2</th><th>Colonne 3</th></tr><tr><td>Ligne 1</td><td>Valeur</td><td>Valeur</td></tr><tr><td>Ligne 2</td><td>Valeur</td><td>Valeur</td></tr></table><p></p>`);
}
function insertHR(){document.execCommand('insertHTML',false,'<hr><p></p>');}
function insertLink(){
  const url = prompt('URL du lien:','https://');
  if(url){
    const text = window.getSelection().toString() || url;
    document.execCommand('insertHTML',false,`<a href="${url}" target="_blank">${text}</a>`);
  }
}
function updateToolbar(){
  document.getElementById('tbBold').classList.toggle('on',document.queryCommandState('bold'));
  document.getElementById('tbItalic').classList.toggle('on',document.queryCommandState('italic'));
  document.getElementById('tbUnder').classList.toggle('on',document.queryCommandState('underline'));
}

// ═══════════════════════════════════════
// SLASH COMMANDS
// ═══════════════════════════════════════
const SLASH_CMDS = [
  {ico:'H1',title:'Titre 1',sub:'Grand titre de section',fn:()=>fmtBlock('h1')},
  {ico:'H2',title:'Titre 2',sub:'Sous-titre',fn:()=>fmtBlock('h2')},
  {ico:'H3',title:'Titre 3',sub:'Petit titre',fn:()=>fmtBlock('h3')},
  {ico:'•',title:'Liste à puces',sub:'Liste non ordonnée',fn:()=>fmt('insertUnorderedList')},
  {ico:'1.',title:'Liste numérotée',sub:'Liste ordonnée',fn:()=>fmt('insertOrderedList')},
  {ico:'❝',title:'Citation',sub:'Bloc de citation',fn:()=>insertQuote()},
  {ico:'{ }',title:'Code',sub:'Code inline',fn:()=>insertCode()},
  {ico:'💡',title:'Encadré',sub:'Bloc callout',fn:()=>insertCallout()},
  {ico:'⊞',title:'Tableau',sub:'Tableau 3×2',fn:()=>insertTable()},
  {ico:'—',title:'Séparateur',sub:'Ligne horizontale',fn:()=>insertHR()},
  {ico:'🔗',title:'Lien',sub:'Insérer un hyperlien',fn:()=>insertLink()},
];
let slashRange = null;

document.getElementById('editor').addEventListener('keydown', e=>{
  const slash = document.getElementById('slashMenu');
  if(slash.classList.contains('show')){
    if(e.key==='ArrowDown'){e.preventDefault();slashFocusIdx=Math.min(slashFocusIdx+1,SLASH_CMDS.length-1);renderSlashFocus();return;}
    if(e.key==='ArrowUp'){e.preventDefault();slashFocusIdx=Math.max(slashFocusIdx-1,0);renderSlashFocus();return;}
    if(e.key==='Enter'){e.preventDefault();execSlash(slashFocusIdx);return;}
    if(e.key==='Escape'){closeSlash();return;}
  }
});

document.getElementById('editor').addEventListener('input', e=>{
  scheduleAutoSave();
  updateWordCount();
  updateToolbar();
  const sel = window.getSelection();
  if(!sel.rangeCount) return;
  const range = sel.getRangeAt(0);
  const text = range.startContainer.textContent || '';
  const slashPos = text.lastIndexOf('/');
  if(slashPos >= 0 && slashPos === text.length - 1){
    slashRange = range.cloneRange();
    showSlash(range);
  } else if(slashPos >= 0 && slashPos < text.length - 1){
    const query = text.slice(slashPos + 1);
    filterSlash(query);
  } else {
    closeSlash();
  }
});

function showSlash(range){
  const rect = range.getBoundingClientRect();
  const menu = document.getElementById('slashMenu');
  menu.innerHTML = SLASH_CMDS.map((c,i)=>`
    <div class="slash-item ${i===0?'focused':''}" onclick="execSlash(${i})">
      <div class="slash-ico">${c.ico}</div>
      <div><div class="slash-title">${c.title}</div><div class="slash-sub">${c.sub}</div></div>
    </div>`).join('');
  menu.style.top = (rect.bottom+6)+'px';
  menu.style.left = Math.min(rect.left, window.innerWidth-250)+'px';
  menu.classList.add('show');
  slashFocusIdx = 0;
}

function filterSlash(query){
  const filtered = SLASH_CMDS.filter(c=>c.title.toLowerCase().includes(query.toLowerCase()));
  if(!filtered.length){closeSlash();return;}
  const menu = document.getElementById('slashMenu');
  menu.innerHTML = filtered.map((c,i)=>`
    <div class="slash-item ${i===0?'focused':''}" onclick="execSlash(${i},true,'${query}')">
      <div class="slash-ico">${c.ico}</div>
      <div><div class="slash-title">${c.title}</div><div class="slash-sub">${c.sub}</div></div>
    </div>`).join('');
  slashFocusIdx=0;
}

function renderSlashFocus(){
  document.querySelectorAll('.slash-item').forEach((el,i)=>el.classList.toggle('focused',i===slashFocusIdx));
}

function execSlash(idx, withQuery=false, query=''){
  const fn = SLASH_CMDS[idx]?.fn;
  const sel = window.getSelection();
  if(sel.rangeCount){
    const range = sel.getRangeAt(0);
    const node = range.startContainer;
    const txt = node.textContent;
    const slashPos = txt.lastIndexOf('/');
    if(slashPos>=0){
      const delRange = document.createRange();
      delRange.setStart(node, slashPos);
      delRange.setEnd(node, txt.length);
      delRange.deleteContents();
    }
  }
  closeSlash();
  if(fn) fn();
}

function closeSlash(){document.getElementById('slashMenu').classList.remove('show');}

// ═══════════════════════════════════════
// COMMAND PALETTE
// ═══════════════════════════════════════
const CMD_ACTIONS = [
  {ico:'📄',title:'Nouvelle page',sub:'Créer une page vide',fn:()=>newPage(null)},
  {ico:'🔍',title:'Rechercher',sub:'Recherche globale',fn:()=>{closeCmdPalette();openSearch();}},
  {ico:'⭐',title:'Favoris',sub:'Voir les favoris',fn:()=>toast('Affichage des favoris')},
  {ico:'💾',title:'Sauvegarder',sub:'Ctrl+S',fn:()=>saveDoc()},
  {ico:'↗',title:'Partager',sub:'Copier le lien',fn:()=>shareDoc()},
  {ico:'🌙',title:'Mode sombre',sub:'Bientôt disponible',fn:()=>toast('Mode sombre bientôt !')},
  {ico:'📤',title:'Exporter HTML',sub:'Télécharger la page',fn:()=>exportPage()},
];

function openCmdPalette(){
  document.getElementById('cmdPalette').classList.add('show');
  document.getElementById('cmdInput').value='';
  filterCmd('');
  setTimeout(()=>document.getElementById('cmdInput').focus(),50);
}
function closeCmdPalette(){document.getElementById('cmdPalette').classList.remove('show');}

function filterCmd(q){
  const results = document.getElementById('cmdResults');
  q = q.toLowerCase();
  const matchPages = pages.filter(p=>p.title.toLowerCase().includes(q)||((p.tags||[]).some(t=>t.includes(q)))).slice(0,5);
  const matchActions = CMD_ACTIONS.filter(a=>!q||a.title.toLowerCase().includes(q));
  let html='';
  if(matchPages.length){
    html+=`<div class="cmd-section">Pages</div>`;
    html+=matchPages.map((p,i)=>`
      <div class="cmd-item ${i===0&&!q?'focused':''}" data-fn="page:${p.id}" onclick="loadPage('${p.id}');closeCmdPalette()">
        <div class="cmd-ico">${p.emoji||'📄'}</div>
        <span class="cmd-title">${p.title.replace(/^[^\w\s]/,'').trim()}</span>
        <span class="cmd-sub">${(p.tags||[]).join(', ')||'—'}</span>
      </div>`).join('');
  }
  if(matchActions.length){
    html+=`<div class="cmd-section">Actions</div>`;
    html+=matchActions.map((a,i)=>`
      <div class="cmd-item" style="cursor:pointer">
        <div class="cmd-ico">${a.ico}</div>
        <span class="cmd-title">${a.title}</span>
        <span class="cmd-sub">${a.sub}</span>
      </div>`).join('');
  }
  results.innerHTML=html;
  results.querySelectorAll('.cmd-item').forEach((el,i)=>{
    if(matchActions[i - matchPages.length]){
      el.onclick = ()=>{closeCmdPalette(); matchActions[i - matchPages.length].fn();};
    }
  });
  cmdFocusIdx=0;
}

function cmdKey(e){
  const items = document.querySelectorAll('.cmd-item');
  if(e.key==='ArrowDown'){cmdFocusIdx=Math.min(cmdFocusIdx+1,items.length-1);}
  else if(e.key==='ArrowUp'){cmdFocusIdx=Math.max(cmdFocusIdx-1,0);}
  else if(e.key==='Enter'&&items[cmdFocusIdx]){items[cmdFocusIdx].click();}
  else if(e.key==='Escape'){closeCmdPalette();return;}
  items.forEach((el,i)=>el.classList.toggle('focused',i===cmdFocusIdx));
}

// ═══════════════════════════════════════
// SEARCH
// ═══════════════════════════════════════
function openSearch(){
  document.getElementById('searchOverlay').classList.add('show');
  setTimeout(()=>document.getElementById('searchInput').focus(),50);
}
function closeSearch(){document.getElementById('searchOverlay').classList.remove('show');}
function doSearch(q){
  const results = document.getElementById('searchResults');
  if(!q.trim()){results.innerHTML='<div class="sr-empty">Commencez à taper pour rechercher...</div>';return;}
  const ql = q.toLowerCase();
  const matches = pages.filter(p=>{
    const text = (p.title+' '+(p.content||'').replace(/<[^>]+>/g,' ')+(p.tags||[]).join(' ')).toLowerCase();
    return text.includes(ql);
  });
  if(!matches.length){results.innerHTML=`<div class="sr-empty">Aucun résultat pour "<strong>${q}</strong>"</div>`;return;}
  results.innerHTML = matches.map(p=>{
    const plain = (p.content||'').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ');
    const idx = plain.toLowerCase().indexOf(ql);
    const excerpt = idx>=0 ? '...'+plain.slice(Math.max(0,idx-40),idx+80).replace(new RegExp(q,'gi'),m=>`<span class="sr-highlight">${m}</span>`)+ '...' : plain.slice(0,120)+'...';
    return `<div class="sr-item" onclick="loadPage('${p.id}');closeSearch()">
      <div class="sr-title">${p.emoji||'📄'} ${p.title.replace(/<[^>]+>/g,'').replace(new RegExp(q,'gi'),m=>`<span class="sr-highlight">${m}</span>`)}</div>
      <div class="sr-excerpt">${excerpt}</div>
      <div class="sr-path">${(p.tags||[]).map(t=>`#${t}`).join(' ')||'sans tag'}</div>
    </div>`;
  }).join('');
}

// ═══════════════════════════════════════
// CONTEXT MENU
// ═══════════════════════════════════════
function showCtx(e, id){
  e.preventDefault(); e.stopPropagation();
  ctxTargetId = id;
  const menu = document.getElementById('ctxMenu');
  menu.style.top = Math.min(e.clientY, window.innerHeight-200)+'px';
  menu.style.left = Math.min(e.clientX, window.innerWidth-180)+'px';
  menu.classList.add('show');
}
function ctxAction(action){
  document.getElementById('ctxMenu').classList.remove('show');
  if(!ctxTargetId) return;
  if(action==='rename'){
    const page=pages.find(p=>p.id===ctxTargetId);
    if(!page) return;
    const n=prompt('Renommer:',page.title.replace(/^[^\w\s]/,'').trim());
    if(n){page.title=n;savePages();renderTree();if(ctxTargetId===currentPageId)document.getElementById('pageTitle').innerText=n;}
  }
  if(action==='duplicate') duplicatePage(ctxTargetId);
  if(action==='favorite'){
    if(favorites.includes(ctxTargetId)) favorites=favorites.filter(f=>f!==ctxTargetId);
    else favorites.push(ctxTargetId);
    localStorage.setItem('wiki_favs',JSON.stringify(favorites));
    renderTree();
    toast(favorites.includes(ctxTargetId)?'⭐ Favori ajouté':'Favori retiré');
  }
  if(action==='newchild') newPage(ctxTargetId);
  if(action==='copylink'){navigator.clipboard.writeText(location.href+'#'+ctxTargetId).then(()=>toast('🔗 Lien copié'));}
  if(action==='delete') deletePage(ctxTargetId);
  ctxTargetId=null;
}
document.addEventListener('click',()=>document.getElementById('ctxMenu').classList.remove('show'));
document.addEventListener('contextmenu',e=>{if(!e.target.closest('.tree-item'))document.getElementById('ctxMenu').classList.remove('show');});

// ═══════════════════════════════════════
// EMOJI PICKER
// ═══════════════════════════════════════
function openEmojiPicker(e){
  const picker = document.getElementById('emojiPicker');
  picker.innerHTML = EMOJIS.map(em=>`<div class="ep-emoji" onclick="setEmoji('${em}')">${em}</div>`).join('');
  picker.style.top = (e.clientY+10)+'px';
  picker.style.left = (e.clientX-100)+'px';
  picker.classList.add('show');
  e.stopPropagation();
}
function setEmoji(em){
  document.getElementById('pageEmoji').textContent=em;
  document.getElementById('emojiPicker').classList.remove('show');
  scheduleAutoSave();
}
document.addEventListener('click',e=>{if(!e.target.closest('#emojiPicker')&&!e.target.closest('.page-emoji'))document.getElementById('emojiPicker').classList.remove('show');});

// ═══════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════
function exportPage(){
  const page=pages.find(p=>p.id===currentPageId);
  if(!page) return;
  const html=`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${page.title}</title><style>body{font-family:Georgia,serif;max-width:720px;margin:40px auto;padding:0 20px;color:#1a1916;line-height:1.7}h1,h2{font-family:Georgia,serif}code{background:#f4f3ef;padding:2px 6px;border-radius:4px}pre{background:#1a1916;color:#e8ff47;padding:20px;border-radius:8px}blockquote{border-left:3px solid #2d6a4f;padding-left:16px;color:#7a7870;font-style:italic}table{width:100%;border-collapse:collapse}th,td{padding:8px 12px;border:1px solid #e4e2dc}th{background:#f4f3ef}</style></head><body><h1>${page.emoji} ${page.title.replace(/^[^\w\s]/,'').trim()}</h1>${page.content}</body></html>`;
  const blob=new Blob([html],{type:'text/html'});
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);
  a.download=(page.title.replace(/[^a-z0-9]/gi,'_').toLowerCase()||'page')+'.html';
  a.click();URL.revokeObjectURL(a.href);
  toast('📤 Page exportée');
}

function shareDoc(){
  navigator.clipboard.writeText(location.href+'#'+currentPageId).then(()=>toast('🔗 Lien copié dans le presse-papiers'));
}

// ═══════════════════════════════════════
// MOBILE
// ═══════════════════════════════════════
function toggleMobileSidebar(){
  const sb=document.getElementById('sidebar'),mo=document.getElementById('mobileOverlay');
  const open=sb.classList.toggle('mob-open');
  mo.classList.toggle('show',open);
}
function closeMobileSidebar(){
  document.getElementById('sidebar').classList.remove('mob-open');
  document.getElementById('mobileOverlay').classList.remove('show');
}

// ═══════════════════════════════════════
// NAV
// ═══════════════════════════════════════
function setNav(el,type){
  document.querySelectorAll('.nav-item').forEach(n=>n.classList.remove('active'));
  el.classList.add('active');
  if(type==='home') loadPage('home');
  else if(type==='favorites'){
    if(favorites.length) loadPage(favorites[0]);
    else toast('Aucun favori');
  } else if(type==='trash') toast('Corbeille vide');
  else if(type==='inbox') toast('3 nouvelles mentions');
}

// ═══════════════════════════════════════
// KEYBOARD SHORTCUTS
// ═══════════════════════════════════════
document.addEventListener('keydown',e=>{
  const tag=document.activeElement.tagName;
  const edit=document.activeElement.isContentEditable;
  if((e.ctrlKey||e.metaKey)&&e.key==='k'){e.preventDefault();openCmdPalette();}
  if((e.ctrlKey||e.metaKey)&&e.key==='s'){e.preventDefault();saveDoc();}
  if((e.ctrlKey||e.metaKey)&&e.key==='f'&&!edit){e.preventDefault();openSearch();}
  if((e.ctrlKey||e.metaKey)&&e.key==='n'&&!edit){e.preventDefault();newPage(null);}
  if(e.key==='Escape'){closeCmdPalette();closeSearch();closeSlash();closeRightPanel();}
});

// ═══════════════════════════════════════
// UTILS
// ═══════════════════════════════════════
function timeAgo(ts){
  const s=Math.round((Date.now()-ts)/1000);
  if(s<60) return 'il y a quelques sec';
  if(s<3600) return `il y a ${Math.round(s/60)} min`;
  if(s<86400) return `il y a ${Math.round(s/3600)}h`;
  return `il y a ${Math.round(s/86400)}j`;
}
function fmtDate(ts){
  return new Date(ts).toLocaleDateString('fr-FR',{day:'2-digit',month:'short',year:'numeric'});
}

let _tt;
function toast(msg){
  clearTimeout(_tt);
  const t=document.getElementById('toast');
  t.textContent=msg;t.classList.add('show');
  _tt=setTimeout(()=>t.classList.remove('show'),2400);
}

// ═══════════════════════════════════════
// INIT
// ═══════════════════════════════════════
(function init(){
  renderTree();
  loadPage('home');
  document.getElementById('editor').addEventListener('mouseup',updateToolbar);
  document.getElementById('editor').addEventListener('keyup',updateToolbar);
  document.getElementById('pageTitle').addEventListener('input',scheduleAutoSave);
  if(location.hash){
    const id=location.hash.slice(1);
    if(pages.find(p=>p.id===id)) loadPage(id);
  }
})();
