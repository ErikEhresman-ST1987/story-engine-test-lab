'use strict';
const {Compiler}=require('inkjs/full');
const {StoryCoordinator}=require('../src/story-coordinator.cjs');
const {FarmHost}=require('../src/farm-host.cjs');
const {ColonyHost}=require('../src/colony-host.cjs');
const configs={
 farm:{source:require('./integrated-story.cjs'),Host:FarmHost,events:[['Harvest carrot','harvest.carrot'],['Harvest wheat','harvest.wheat'],['Deliver supplies','deliver.dinner']]},
 colony:{source:require('./colony-story.cjs'),Host:ColonyHost,events:[['Scavenge supplies','colony.scavenge'],['Advance turn','colony.wait'],['Assist survey team','colony.assist']]}
};
const compiled={};for(const [id,c] of Object.entries(configs))compiled[id]=new Compiler(c.source).Compile().ToJson();
const KEY='story-lab-two-hosts-v1',output=document.querySelector('#two-hosts');
let sessions={},blocked=false;
function make(id,saved){const c=new StoryCoordinator({compiled:compiled[id],adapter:new configs[id].Host(),storyId:id,save:saved});if(!saved)c.advance();return c}
try{
 const raw=localStorage.getItem(KEY),saved=raw?JSON.parse(raw):null;
 if(saved&&(!saved.farm||!saved.colony))throw Error('Missing host state');
 for(const id of Object.keys(configs))sessions[id]=make(id,saved?saved[id]:null);
}catch(e){blocked=true;output.textContent='Two-host save could not be restored. Original bytes retained. Use Reset two-host lab to recover.'}
function snapshot(){return Object.fromEntries(Object.entries(sessions).map(([id,c])=>[id,c.snapshot()]))}
function commit(before){
 try{localStorage.setItem(KEY,JSON.stringify(snapshot()));return true}
 catch(e){sessions=Object.fromEntries(Object.keys(configs).map(id=>[id,make(id,before[id])]));blocked=true;return false}
}
function render(message=''){
 output.replaceChildren();
 const status=document.createElement('p');status.textContent=message||'Both host simulations use one StoryCoordinator implementation.';output.append(status);
 for(const [id,config] of Object.entries(configs)){
  const section=document.createElement('section');section.className='story';
  const title=document.createElement('h3');title.textContent=id==='farm'?'Farm host':'Colony host';section.append(title);
  const c=sessions[id];if(!c)continue;
  for(const line of c.view().lines){const p=document.createElement('p');p.textContent=line;section.append(p)}
  if(c.view().phase==='invitation')for(const choice of c.view().choices){
   const b=document.createElement('button');b.textContent=choice.text;b.disabled=blocked;
   b.onclick=()=>act(id,()=>c.choose(choice.index));section.append(b);
  }
  for(const [label,event] of config.events){
   const b=document.createElement('button');b.textContent=label;b.disabled=blocked||c.view().phase!=='active';
   b.onclick=()=>act(id,()=>c.event(event));section.append(b);
  }
  const state=document.createElement('pre');state.textContent='Phase: '+c.view().phase+'\n'+JSON.stringify(c.view().game,null,2);section.append(state);
  output.append(section);
 }
}
function act(id,fn){const before=snapshot();try{const result=fn();const ok=commit(before);render(ok?(result&&result.reason||'Saved both independent host states.'):'Save failed; original state restored and controls locked.')}catch(e){sessions=Object.fromEntries(Object.keys(configs).map(k=>[k,make(k,before[k])]));render('Action rejected: '+e.message)}}
document.querySelector('#two-host-reset').onclick=()=>{if(!confirm('Reset only the two-host test?'))return;try{localStorage.removeItem(KEY);sessions=Object.fromEntries(Object.keys(configs).map(id=>[id,make(id)]));blocked=false;commit(snapshot());render('Two-host lab reset.')}catch(e){render('Reset failed: '+e.message)}};
if(!blocked)render();else{const b=document.querySelector('#two-host-reset');b.disabled=false}
