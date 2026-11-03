'use strict';
const {Compiler}=require('inkjs/full');
const {MultiStoryLab}=require('../src/multi-story-lab.cjs');
const compiled={garden:new Compiler(require('./multi-garden.cjs')).Compile().ToJson(),dinner:new Compiler(require('./multi-dinner.cjs')).Compile().ToJson()};
const KEY='story-lab-multi-v1',root=document.querySelector('#multi-stories');
let lab=null,locked=false;
try{const raw=localStorage.getItem(KEY);lab=new MultiStoryLab(compiled,raw?JSON.parse(raw):null)}catch(e){locked=true}
function render(message=''){
 root.replaceChildren();
 const status=document.createElement('p');status.textContent=message||(locked?'Saved multi-story state could not be loaded; original bytes preserved.':'Two stories with shared memory and independent progress.');root.append(status);
 if(!lab)return;
 for(const id of ['garden','dinner']){
  const v=lab.view(id),section=document.createElement('section');section.className='story';
  const h=document.createElement('h3');h.textContent=id==='garden'?'Keiko · School garden':'Juliette · Community dinner';section.append(h);
  const phase=document.createElement('p');phase.textContent='Phase: '+v.phase;section.append(phase);
  for(const line of v.lines){const p=document.createElement('p');p.textContent=line;section.append(p)}
  for(const choice of v.phase==='invitation'?v.choices:[]){
   const b=document.createElement('button');b.textContent=choice.text;b.disabled=locked;b.onclick=()=>act(()=>lab.choose(id,choice.index));section.append(b);
  }
  if(v.phase==='active'){const b=document.createElement('button');b.textContent='Complete '+(id==='garden'?'garden work':'dinner preparations');b.disabled=locked;b.onclick=()=>act(()=>lab.complete(id));section.append(b)}
  const memory=document.createElement('p');memory.textContent='From the other story: '+lab.memory(id);section.append(memory);root.append(section);
 }
 const p=document.createElement('pre');p.textContent='Shared facts and receipts:\n'+JSON.stringify({facts:lab.facts,receipts:lab.receipts},null,2);root.append(p);
}
function act(fn){const before=lab.snapshot();try{fn();localStorage.setItem(KEY,JSON.stringify(lab.snapshot()));render('Progress saved.')}catch(e){lab=new MultiStoryLab(compiled,before);render('Action not saved: '+e.message)}}
document.querySelector('#multi-reset').onclick=()=>{if(!confirm('Reset only Increment 7?'))return;try{localStorage.removeItem(KEY);lab=new MultiStoryLab(compiled);locked=false;render('Increment 7 reset.')}catch(e){render('Reset failed: '+e.message)}};
render();
