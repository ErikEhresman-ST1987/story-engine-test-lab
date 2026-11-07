'use strict';
// Independent browser host; consumes canonical engine unchanged.
const {Compiler}=require('inkjs/full');
const {MultiChapterRegistry}=require('../packages/story-engine/multi-chapter-registry.cjs');
const manifest=require('../fixtures/three-chapter/manifest.json');
const source=[
 require('../fixtures/three-chapter/chapter-1.ink'),
 require('../fixtures/three-chapter/chapter-2.ink'),
 require('../fixtures/three-chapter/chapter-3.ink')
];
const packages=[{manifest,compiledChapters:Object.fromEntries(manifest.chapters.map((chapter,i)=>[
 chapter.id,{compiled:new Compiler(source[i]).Compile().ToJson()}
]))}];
const KEY='story-engine-portable-browser-v1';
const id=manifest.storyId;
const $=selector=>document.querySelector(selector);
class Game {
 constructor(){this.resources=0;this.deliveries=0;}
 snapshot(){return {resources:this.resources,deliveries:this.deliveries};}
 restore(s){if(!s||!Number.isSafeInteger(s.resources)||s.resources<0||!Number.isSafeInteger(s.deliveries)||s.deliveries<0)throw Error('Invalid host save');this.resources=s.resources;this.deliveries=s.deliveries;}
 event(name){
  if(name!=='harvest.carrot'||this.resources<2||this.deliveries!==0)return {changed:false,completed:false};
  this.resources-=2;this.deliveries++;
  return {changed:true,completed:true};
 }
}
let game,registry,status='';
function create(save){
 game=new Game();
 registry=new MultiChapterRegistry({packages,hostFactory:()=>game,save:save?.narrative});
 if(save){game.restore(save.game);}
}
function snapshot(){return {schema:1,game:game.snapshot(),narrative:registry.snapshot()};}
function save(){try{localStorage.setItem(KEY,JSON.stringify(snapshot()));status='Saved locally.';}catch(e){status='Save failed: '+e.message;}}
try{
 const raw=localStorage.getItem(KEY);
 create(raw?JSON.parse(raw):null);
}catch(e){create();status='Invalid saved session; started a fresh isolated test: '+e.message;}
function render(){
 const view=registry.view(id);
 $('#portable-lines').replaceChildren();
 $('#portable-choices').replaceChildren();
 for(const line of view.lines){const p=document.createElement('p');p.textContent=line;$('#portable-lines').append(p);}
 for(const choice of view.choices){const b=document.createElement('button');b.textContent=choice.text;b.onclick=()=>{registry.choose(id,choice.index);save();render();};$('#portable-choices').append(b);}
 $('#portable-state').textContent=JSON.stringify({chapter:view.chapter,completed:view.completed,resources:game.resources,deliveries:game.deliveries},null,2);
 $('#portable-status').textContent=status;
 $('#portable-next').disabled=view.completed;
}
$('#portable-harvest').onclick=()=>{game.resources++;save();render();};
$('#portable-deliver').onclick=()=>{const r=registry.event(id,'harvest.carrot');status=r.completed?'Authorized delivery completed.':'Delivery denied: harvest two carrots first, or chapter already completed.';save();render();};
$('#portable-next').onclick=()=>{try{registry.nextChapter(id);status='Next chapter.';save();}catch(e){status=e.message;}render();};
$('#portable-reset').onclick=()=>{if(!confirm('Reset only the portable browser test?'))return;localStorage.removeItem(KEY);create();status='Portable test reset.';render();};
render();
