'use strict';
const {Compiler}=require('inkjs/full');
const {StoryHost}=require('../src/engine.cjs');
const source=require('./story-sources.cjs');
const compiled=Object.fromEntries(Object.entries(source).map(([id,ink])=>[id,new Compiler(ink).Compile().ToJson()]));
const KEY='story-engine-test-lab-v2';
const status=document.querySelector('#status'),lines=document.querySelector('#lines'),choices=document.querySelector('#choices'),facts=document.querySelector('#facts'),selector=document.querySelector('#story');
let host;
try{const raw=localStorage.getItem(KEY);host=new StoryHost(compiled,raw?JSON.parse(raw):null)}
catch(e){host=new StoryHost(compiled);status.textContent='Previous lab save could not be loaded. New test session started.'}
function persist(){try{localStorage.setItem(KEY,JSON.stringify(host.snapshot()));status.textContent='Saved locally.'}catch(e){status.textContent='Save failed: '+e.message}}
function render(){
 const id=selector.value,story=host.open(id);
 let result;
 if(story.canContinue){result=host.advance(id);persist()}
 else result={lines:[],choices:story.currentChoices.map((c,i)=>({index:i,text:c.text})),ended:story.currentChoices.length===0};
 lines.replaceChildren();choices.replaceChildren();
 for(const line of result.lines){const p=document.createElement('p');p.textContent=line;lines.append(p)}
 if(!result.lines.length){const p=document.createElement('p');p.textContent=result.ended?'This story has finished. Switch stories or reset to play again.':'Choose what happens next.';lines.append(p)}
 for(const choice of result.choices){const button=document.createElement('button');button.textContent=choice.text;button.addEventListener('click',()=>{
  const next=host.choose(id,choice.index);
  host.fact(id==='single'?'garden_choice':'dinner_choice',choice.text);
  if(id==='arc')host.fact('dinner_help_offered',host.open('arc').variablesState.$('helped_dinner'));
  persist();renderResult(next);
 });choices.append(button)}
 facts.textContent=JSON.stringify(host.snapshot().facts,null,2);
}
function renderResult(result){lines.replaceChildren();choices.replaceChildren();for(const line of result.lines){const p=document.createElement('p');p.textContent=line;lines.append(p)}if(result.ended){const p=document.createElement('p');p.textContent='Story complete. Switch stories to continue exploring.';lines.append(p)}facts.textContent=JSON.stringify(host.snapshot().facts,null,2)}
selector.addEventListener('change',render);
document.querySelector('#reset').addEventListener('click',()=>{if(!confirm('Clear only the Story Lab progress on this device?'))return;localStorage.removeItem(KEY);host=new StoryHost(compiled);status.textContent='Lab reset.';render()});
render();
if('serviceWorker'in navigator)navigator.serviceWorker.register('./sw.js').catch(()=>{status.textContent='Offline caching unavailable.'});
