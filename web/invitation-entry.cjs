'use strict';
const {InvitationLab,DEFINITIONS}=require('../src/invitation-lab.cjs');
const KEY='story-lab-invitations-v1',root=document.querySelector('#invitation-lab');
let lab,locked=false;
try{const raw=localStorage.getItem(KEY);lab=new InvitationLab(raw?JSON.parse(raw):null)}catch(e){locked=true}
function button(label,action){const b=document.createElement('button');b.textContent=label;b.disabled=locked;b.onclick=()=>act(action);return b}
function render(message=''){
 root.replaceChildren();const status=document.createElement('p');status.setAttribute('role','status');status.textContent=message||(locked?'Saved invitation record could not be restored; original data preserved.':'Invitation state is stored independently from Increment 7.');root.append(status);
 if(!lab)return;
 root.append(button('Meet Juliette in town',()=>lab.meetJuliette()));
 for(const [id,def] of Object.entries(DEFINITIONS)){
  const s=document.createElement('section');s.className='story';const h=document.createElement('h3');h.textContent=def.title;s.append(h);
  const phase=lab.state.stories[id];const p=document.createElement('p');p.textContent='Invitation: '+phase;s.append(p);
  if(phase==='available'||phase==='deferred'){
   s.append(button('Accept invitation',()=>lab.decide(id,'accept')),button('Maybe later',()=>lab.decide(id,'later')),button('Decline',()=>lab.decide(id,'decline')));
  }
  if(phase==='declined')s.append(button('Ask about it again',()=>lab.revisit(id)));
  if(phase==='active')s.append(button('Complete story',()=>lab.complete(id)));
  root.append(s);
 }
 const pre=document.createElement('pre');pre.textContent=JSON.stringify(lab.snapshot(),null,2);root.append(pre);
}
function act(fn){
 const before=lab.snapshot();
 try{fn();localStorage.setItem(KEY,JSON.stringify(lab.snapshot()));render('Invitation progress saved.')}
 catch(e){lab=new InvitationLab(before);render('Action not saved: '+e.message)}
}
document.querySelector('#invitation-reset').onclick=()=>{
 if(!confirm('Reset only Increment 8?'))return;
 try{localStorage.removeItem(KEY);lab=new InvitationLab();locked=false;render('Increment 8 reset.')}
 catch(e){render('Reset failed: '+e.message)}
};
render();
