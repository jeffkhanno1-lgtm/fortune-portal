// PASTE YOUR VALUES (Supabase > Project Settings > API)
const SUPABASE_URL='https://tttvdtljwobjhdgsueko.supabase.co', SUPABASE_KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0dHZkdGxqd29iamhkZ3N1ZWtvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI2ODAyMDcsImV4cCI6MjEwODI1NjIwN30.yQpXLfLxeoj-UMzEsHYHFqoY-DA5QkXKK3PQca9WgrI';
const sb=supabase.createClient(SUPABASE_URL,SUPABASE_KEY,{auth:{storageKey:location.pathname.endsWith('admin.html')?'fa-admin-session':'fa-partner-session'}});
const $=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const tagc=s=>/Enrolled|Completed|Processed|Passed|Approved/.test(s)?'ok':/Reject|Failed/.test(s)?'bad':'';
const tag=s=>`<span class="tag ${tagc(s)}">${esc(s)}</span>`;
function toast(m){let t=$('#toast');if(!t){t=document.createElement('div');t.id='toast';document.body.append(t)}t.textContent=m;t.hidden=false;setTimeout(()=>t.hidden=true,3000)}
function tabs(onShow){document.querySelectorAll('nav button').forEach(b=>b.onclick=()=>{document.querySelectorAll('nav button').forEach(x=>x.classList.toggle('on',x==b));document.querySelectorAll('.tab').forEach(s=>s.classList.toggle('hide',s.id!=b.dataset.t));onShow&&onShow(b.dataset.t)});document.querySelector('nav button').click()}
async function programOptions(el,ph){const{data}=await sb.from('programs').select('id,name').order('name');el.innerHTML=(ph?`<option value="">${ph}</option>`:'')+(data||[]).map(p=>`<option value="${p.id}">${esc(p.name)}</option>`).join('')}
async function login(role,onOk){
 const{data:{session}}=await sb.auth.getSession();
 if(session){const{data:p}=await sb.from('profiles').select('role').eq('id',session.user.id).single();
  if((p?.role==='admin')===(role==='admin')){$('#auth').classList.add('hide');$('#app').classList.remove('hide');return onOk(session.user)}
  await sb.auth.signOut();toast('This account cannot use this portal')}
 $('#auth').classList.remove('hide');$('#app').classList.add('hide')}
async function signIn(role,onOk){const{error}=await sb.auth.signInWithPassword({email:$('#em').value,password:$('#pw').value});if(error)return toast(error.message);login(role,onOk)}
async function signOut(){await sb.auth.signOut();location.reload()}

const fmt=s=>{let h='',o=false;String(s||'').split('\n').forEach(l=>{const m=l.match(/^\s*[-•*]\s+(.*)/);if(m){if(!o){h+='<ul>';o=true}h+='<li>'+esc(m[1])+'</li>'}else{if(o){h+='</ul>';o=false}if(l.trim())h+='<p>'+esc(l)+'</p>'}});return h+(o?'</ul>':'')};
function tg(h){const a=h.parentNode;a.classList.toggle('open');h.querySelector('i').textContent=a.classList.contains('open')?'−':'+'}
async function upLogo(f){const n=Date.now()+'-'+f.name.replace(/[^\w.]/g,'_');const{error}=await sb.storage.from('logos').upload(n,f);if(error){toast(error.message);return null}return sb.storage.from('logos').getPublicUrl(n).data.publicUrl}
function stat(S){const c=x=>S.filter(s=>s.status==x).length,n=new Date();return{t:S.length,pend:c('Submitted')+c('Processed'),prog:c('Enrolled'),done:c('Completed'),pass:S.filter(s=>s.final_exam=='Passed').length,mon:S.filter(s=>{const d=new Date(s.created_at);return d.getMonth()==n.getMonth()&&d.getFullYear()==n.getFullYear()}).length}}
const cards=a=>`<div class="kpis">${a.map(([l,v,i,c])=>`<div class="kpi" style="--c:${c||'#bf5a00'}"><div class="ki">${i}</div><div><b>${v}</b><span>${l}</span></div></div>`).join('')}</div>`;
function dist(S){const t=Math.max(1,S.length),L={Enrolled:'Enrolled (in progress)'};return['Submitted','Processed','Enrolled','Completed','Rejected'].map(x=>{const n=S.filter(s=>s.status==x).length;return`<div class="drow"><span>${L[x]||x}</span><div class="bar sm"><div style="width:${Math.round(n/t*100)}%"></div></div><b>${n}</b></div>`}).join('')}
function mchart(dates){const n=new Date(),m=[];for(let i=5;i>=0;i--){const d=new Date(n.getFullYear(),n.getMonth()-i,1);m.push({l:d.toLocaleString('en',{month:'short'}),y:d.getFullYear(),mo:d.getMonth(),c:0})}
 dates.forEach(x=>{const d=new Date(x),t=m.find(z=>z.mo==d.getMonth()&&z.y==d.getFullYear());if(t)t.c++});const mx=Math.max(1,...m.map(z=>z.c));
 return`<div class="mchart">${m.map(z=>`<div class="mc"><b>${z.c}</b><div class="mb" style="height:${Math.round(z.c/mx*100)}%"></div><span>${z.l}</span></div>`).join('')}</div>`}
let CD=[],CO=0;
function calDraw(){const n=new Date(),d=new Date(n.getFullYear(),n.getMonth()+CO,1),f=d.getDay(),dim=new Date(d.getFullYear(),d.getMonth()+1,0).getDate(),c={};
 CD.forEach(x=>{const t=new Date(x);if(t.getMonth()==d.getMonth()&&t.getFullYear()==d.getFullYear())c[t.getDate()]=(c[t.getDate()]||0)+1});
 let h=['S','M','T','W','T','F','S'].map(x=>`<b>${x}</b>`).join('')+'<i></i>'.repeat(f);
 for(let i=1;i<=dim;i++)h+=`<span class="${c[i]?'has':''} ${CO==0&&i==n.getDate()?'today':''}" title="${c[i]?c[i]+' registered':''}">${i}${c[i]?`<em>${c[i]}</em>`:''}</span>`;
 $('#cal').innerHTML=`<div class="calh"><button class="ghost" onclick="CO--;calDraw()">‹</button><b>${d.toLocaleString('en',{month:'long',year:'numeric'})}</b><button class="ghost" onclick="CO++;calDraw()">›</button></div><div class="calg">${h}</div>`}
