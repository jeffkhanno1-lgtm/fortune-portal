// PASTE YOUR VALUES (Supabase > Project Settings > API)
const SUPABASE_URL='https://tttvdtljwobjhdgsueko.supabase.co', SUPABASE_KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0dHZkdGxqd29iamhkZ3N1ZWtvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI2ODAyMDcsImV4cCI6MjEwODI1NjIwN30.yQpXLfLxeoj-UMzEsHYHFqoY-DA5QkXKK3PQca9WgrI';
const sb=supabase.createClient(SUPABASE_URL,SUPABASE_KEY);
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
