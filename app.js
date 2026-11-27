import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';
const supabase=createClient('https://bichgdrmosqqfcxlffgq.supabase.co','sb_publishable_6Yb69CbrVEvsn0a9ZGIChg_0D3QqY9W');
const ADMIN='gudinot021@gmail.com';
const $=id=>document.getElementById(id);
const defaults={homeName:'LOCAL',awayName:'VISITANTE',homeScore:0,awayScore:0,homeFouls:0,awayFouls:0,period:1,sponsor:'',sponsorUrl:''};
let state={...defaults},saveTimer;
function show(id,on){$(id).hidden=!on}
function render(){for(const key of Object.keys(state)){const el=$(key);if(!el)continue;if(el.tagName==='INPUT')el.value=state[key]??'';else el.textContent=state[key]??''}}
async function load(){const {data,error}=await supabase.from('match_state').select('state').eq('id',1).single();if(!error&&data?.state)state={...defaults,...data.state};render()}
async function save(){ $('saveMsg').textContent='Guardando…';const {error}=await supabase.from('match_state').update({state,updated_at:new Date().toISOString()}).eq('id',1);$('saveMsg').textContent=error?'No se pudo guardar: '+error.message:'Cambios guardados';}
function changed(){render();clearTimeout(saveTimer);saveTimer=setTimeout(save,250)}
async function sessionCheck(session){if(session?.user?.email?.toLowerCase()===ADMIN){show('login',false);show('dashboard',true);await load()}else{show('dashboard',false);show('login',true);if(session)await supabase.auth.signOut()}}
$('loginForm').addEventListener('submit',async e=>{e.preventDefault();const email=$('email').value.trim().toLowerCase();if(email!==ADMIN){$('loginMsg').textContent='Este correo no está autorizado.';return}const {error}=await supabase.auth.signInWithOtp({email,options:{emailRedirectTo:location.href}});$('loginMsg').textContent=error?'Error: '+error.message:'Te enviamos un enlace. Revisá tu correo y abrilo en este dispositivo.'});
$('logout').addEventListener('click',()=>supabase.auth.signOut());
document.querySelectorAll('[data-team]').forEach(b=>b.addEventListener('click',()=>{const k=b.dataset.team+'Score';state[k]=Math.max(0,(state[k]||0)+Number(b.dataset.points));changed()}));
document.querySelectorAll('[data-foul]').forEach(b=>b.addEventListener('click',()=>{const k=b.dataset.foul+'Fouls';state[k]=Math.max(0,(state[k]||0)+Number(b.dataset.delta));changed()}));
['homeName','awayName','sponsor','sponsorUrl'].forEach(id=>$(id).addEventListener('change',()=>{state[id]=$(id).value.trim();changed()}));
$('periodUp').addEventListener('click',()=>{state.period=Math.min(4,state.period+1);changed()});
$('periodDown').addEventListener('click',()=>{state.period=Math.max(1,state.period-1);changed()});
supabase.auth.getSession().then(({data})=>sessionCheck(data.session));
supabase.auth.onAuthStateChange((_event,session)=>{if(session)sessionCheck(session);else{show('dashboard',false);show('login',true)}});
