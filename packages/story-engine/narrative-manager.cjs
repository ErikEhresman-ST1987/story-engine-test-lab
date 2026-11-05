'use strict';
const {MultiChapterRegistry}=require('./multi-chapter-registry.cjs');
const SCHEMA=1;
class NarrativeManager{
 constructor({packages,hostFactory,save}){
  this.packages=packages;
  this.registry=new MultiChapterRegistry({packages,hostFactory});
  this.facts={};this.invitations=Object.fromEntries(packages.map(p=>[p.manifest.storyId,'hidden']));
  if(save)this.restore(save);else this.refresh();
 }
 refresh(){
  for(const p of this.packages){
   const id=p.manifest.storyId;
   if(this.invitations[id]==='hidden'&&p.manifest.requiresFacts.every(f=>this.facts[f]===true))this.invitations[id]='available';
  }
 }
 fact(name,value=true){if(typeof name!=='string'||!name.trim()||typeof value!=='boolean')throw Error('Invalid fact');this.facts[name]=value;this.refresh()}
 decide(id,decision){
  const phase=this.invitations[id];
  if(!['available','deferred'].includes(phase)||!['accept','later','decline'].includes(decision))throw Error('Invitation unavailable');
  this.invitations[id]=decision==='accept'?'active':decision==='later'?'deferred':'declined';
  return this.view(id);
 }
 revisit(id){if(this.invitations[id]!=='declined')throw Error('Invitation not declined');this.invitations[id]='available'}
 view(id){if(!Object.hasOwn(this.invitations,id))throw Error('Unknown story');return {invitation:this.invitations[id],...this.registry.view(id)}}
 choose(id,index){if(this.invitations[id]!=='active')throw Error('Story not active');return this.registry.choose(id,index)}
 event(id,name){
  if(this.invitations[id]!=='active')return {changed:false,reason:'Story not active'};
  const result=this.registry.event(id,name);
  if(this.registry.view(id).completed){this.invitations[id]='completed';this.facts[id+'_completed']=true;this.refresh()}
  return result;
 }
 nextChapter(id){if(this.invitations[id]!=='active')throw Error('Story not active');return this.registry.nextChapter(id)}
 snapshot(){return {schema:SCHEMA,facts:structuredClone(this.facts),invitations:{...this.invitations},registry:this.registry.snapshot()}}
 restore(saved){
  if(!saved||saved.schema!==SCHEMA||!saved.facts||typeof saved.facts!=='object'||!saved.invitations||typeof saved.invitations!=='object')throw Error('Invalid narrative save');
  const ids=this.packages.map(p=>p.manifest.storyId);
  if(Object.keys(saved.invitations).length!==ids.length||ids.some(id=>!Object.hasOwn(saved.invitations,id)))throw Error('Invalid invitations');
  const allowed=['hidden','available','deferred','declined','active','completed'];
  for(const p of this.packages){
   const id=p.manifest.storyId,phase=saved.invitations[id],entry=saved.registry?.stories?.[id];
   if(!allowed.includes(phase)||!entry||(phase==='completed')!==entry.completed)throw Error('Inconsistent narrative completion');
   if(phase!=='hidden'&&!p.manifest.requiresFacts.every(f=>saved.facts[f]===true))throw Error('Inconsistent narrative eligibility');
   if((phase==='completed')!==(saved.facts[id+'_completed']===true))throw Error('Inconsistent completion fact');
  }
  const candidate=new MultiChapterRegistry({packages:this.packages,hostFactory:this.registry.hostFactory,save:saved.registry});
  this.registry=candidate;this.facts=structuredClone(saved.facts);this.invitations={...saved.invitations};
 }
}
module.exports={NarrativeManager};
