'use strict';
const {Compiler}=require('inkjs/full');
const {IntegratedCycle}=require('../src/integrated-cycle.cjs');
const source=require('./integrated-story.cjs');
const compiled=new Compiler(source).Compile().ToJson();
const KEY='story-lab-integrated-v1';
const lines=document.querySelector('#integrated-lines'),choices=document.querySelector('#integrated-choices'),state=document.querySelector('#integrated-state'),status=document.querySelector('#integrated-status');
let cycle,blocked=false;
try{const raw=localStorage.getItem(KEY);cycle=new IntegratedCycle(compiled,raw?JSON.parse(raw):undefined)}
catch(e){cycle=new IntegratedCycle(compiled);blocked=true;status.textContent='Existing integrated save could not be restored. Reset this test to proceed.'}
let currentLines=[];
function save(previous){
 if(blocked)return false;
 try{localStorage.setItem(KEY,JSON.stringify(cycle.snapshot()));status.textContent='Narrative and inventory saved in one record.';return true}
 catch(e){cycle=new IntegratedCycle(compiled,previous);blocked=true;status.textContent='Save failed; changes rolled back and controls locked.';return false}
}
function draw(){
 const s=cycle.snapshot();lines.replaceChildren();choices.replaceChildren();
 for(const line of currentLines){const p=document.createElement('p');p.textContent=line;lines.append(p)}
 if(!currentLines.length){const p=document.createElement('p');p.textContent=s.phase==='collecting'?'Juliette is waiting for her ingredients.':s.phase==='completed'?'Dinner delivery complete.':s.phase==='declined'?'Invitation declined. Reset to try again.':'Choose how to respond to Juliette.';lines.append(p)}
 if(s.phase==='invitation'&&!blocked){
  const options=cycle.story.currentChoices;
  for(let i=0;i<options.length;i++){const b=document.createElement('button');b.textContent=options[i].text;b.addEventListener('click',()=>{const before=cycle.snapshot();currentLines=cycle.choose(i).lines;save(before);draw()});choices.append(b)}
 }
 state.textContent='Phase: '+s.phase+'\nCarrots: '+s.game.inventory.carrot+' · Wheat: '+s.game.inventory.wheat+'\nDelivery receipts: '+s.game.receipts.length+'\nStory fact: '+(s.game.facts.juliette_dinner_delivered?'Dinner supplies delivered':'Not yet');
 for(const b of document.querySelectorAll('[data-integrated-event]'))b.disabled=blocked||s.phase!=='collecting';
}
for(const b of document.querySelectorAll('[data-integrated-event]'))b.addEventListener('click',()=>{const before=cycle.snapshot(),result=cycle.event(b.dataset.integratedEvent);if(result.changed){if(result.story)currentLines=result.story.lines;save(before)}else status.textContent=result.reason;draw()});
document.querySelector('#integrated-reset').addEventListener('click',()=>{if(!confirm('Reset only the integrated story test?'))return;try{localStorage.removeItem(KEY);cycle=new IntegratedCycle(compiled);blocked=false;currentLines=cycle.advance().lines;save(cycle.snapshot());draw()}catch(e){status.textContent='Reset failed: '+e.message}});
if(!blocked){const before=cycle.snapshot();const result=cycle.advance();currentLines=result.lines;if(result.lines.length)save(before)}
draw();
