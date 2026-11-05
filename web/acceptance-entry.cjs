'use strict';
const {SharedGameNarrative}=require('../packages/story-engine/shared-game-narrative.cjs');
const {RecoverableNarrativeStore}=require('../packages/story-engine/recoverable-save-store.cjs');
const {compilePackage}=require('../packages/story-engine/compile-package.cjs');
const base=require('../fixtures/three-chapter/manifest.json');
const files={'chapter-1.ink':require('../fixtures/three-chapter/chapter-1.ink'),'chapter-2.ink':require('../fixtures/three-chapter/chapter-2.ink'),'chapter-3.ink':require('../fixtures/three-chapter/chapter-3.ink')};
const packages=['garden','dinner'].map(id=>{const manifest={...base,storyId:id};return {manifest,compiledChapters:compilePackage(manifest,files).chapters}});
class Game{
 constructor(){this.carrots=0;this.deliveries=0}
 snapshot(){return {carrots:this.carrots,deliveries:this.deliveries}}
 restore(s){if(!s||!Number.isSafeInteger(s.carrots)||s.carrots<0||!Number.isSafeInteger(s.deliveries)||s.deliveries<0)throw Error('Bad game save');Object.assign(this,s)}
 event(name){if(name==='harvest.carrot'){this.carrots++;return {changed:true,completed:false}}if(name==='deliver.dinner'&&this.carrots>=2){this.carrots-=2;this.deliveries++;return {changed:true,completed:true}}return {changed:false,completed:false}}
}
const create=save=>new SharedGameNarrative({packages,createGame:()=>new Game(),save});
const store=new RecoverableNarrativeStore({storage:localStorage,key:'story-lab-acceptance-v1'});
const root=document.querySelector('#acceptance-lab');
let lab,locked=false;try{lab=create(store.read())}catch(e){lab=create();locked=true}
const node=(tag,t)=>{const n=document.createElement(tag);n.textContent=t;return n};
function render(message=''){
 root.replaceChildren(node('p',message||(locked?'Invalid save; recovery or reset available.':'Sample-only narrative. Isolated save.')),node('p','Carrots: '+lab.game.carrots+' · Deliveries: '+lab.game.deliveries));
 const button=(parent,label,fn)=>{const b=node('button',label);b.disabled=locked;b.onclick=()=>{const before=lab.snapshot();try{fn();store.write(lab.snapshot(),s=>create(s));render('Saved. Refresh to verify.')}catch(e){lab=create(before);render('Not saved: '+e.message)}};parent.append(b)};
 for(const id of ['garden','dinner']){
  const v=lab.view(id),section=node('section','');section.className='story';
  section.append(node('h3',id),node('p',v.invitation+' · '+v.chapter+(v.completed?' · completed':'')));
  if(['available','deferred'].includes(v.invitation))for(const d of ['accept','later','decline'])button(section,d,()=>lab.decide(id,d));
  if(v.invitation==='declined')button(section,'Revisit',()=>lab.revisit(id));
  if(v.invitation==='active'){
   for(const line of v.lines)section.append(node('p',line));
   v.choices.forEach((c,i)=>button(section,c.text,()=>lab.choose(id,i)));
   button(section,'Harvest carrot',()=>lab.event(id,'harvest.carrot'));
   button(section,'Deliver two carrots',()=>lab.event(id,'deliver.dinner'));
   button(section,'Next chapter',()=>lab.nextChapter(id));
  }
  root.append(section);
 }
 const recovery=node('button','Restore previous save');recovery.onclick=()=>{if(!confirm('Load previous valid save into this session?'))return;try{const s=store.recover(x=>create(x));if(!s)throw Error('No backup');lab=create(s);locked=false;render('Backup loaded. Make a change to persist.')}catch(e){render(e.message)}};root.append(recovery);
 const reset=node('button','Reset acceptance lab');reset.onclick=()=>{if(!confirm('Reset only acceptance lab?'))return;try{localStorage.removeItem(store.key);localStorage.removeItem(store.backupKey);lab=create();locked=false;render('Reset complete')}catch(e){render(e.message)}};root.append(reset);
}
render();
