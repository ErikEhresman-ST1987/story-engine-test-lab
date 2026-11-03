'use strict';
const {Story}=require('inkjs');
const VERSION=1;
const IDS=['garden','dinner'];
class MultiStoryLab{
 constructor(compiled,save){
  this.compiled=compiled;
  this.stories=Object.fromEntries(IDS.map(id=>[id,new Story(compiled[id])]));
  this.phases={garden:'invitation',dinner:'invitation'};
  this.lines={garden:[],dinner:[]};
  this.facts={};
  this.receipts=[];
  if(save)this.restore(save);else for(const id of IDS)this.advance(id);
 }
 advance(id){const s=this.stories[id],lines=[];while(s.canContinue)lines.push(s.Continue().trim());this.lines[id]=lines.filter(Boolean);return this.view(id)}
 view(id){this.checkId(id);return {phase:this.phases[id],lines:[...this.lines[id]],choices:this.stories[id].currentChoices.map((c,index)=>({index,text:c.text}))}}
 checkId(id){if(!IDS.includes(id))throw Error('Unknown story')}
 choose(id,index){
  this.checkId(id);if(this.phases[id]!=='invitation')throw Error('Story already started');
  const s=this.stories[id];if(!Number.isInteger(index)||index<0||index>=s.currentChoices.length||index>1)throw Error('Invalid choice');
  s.ChooseChoiceIndex(index);
  this.phases[id]=index===0?'active':'declined';
  this.facts[id+'_offered_help']=index===0;
  return this.advance(id);
 }
 complete(id){
  this.checkId(id);if(this.phases[id]!=='active')return {changed:false,reason:'Story not active'};
  const receipt='story:'+id+':completed';if(this.receipts.includes(receipt))return {changed:false,reason:'Already completed'};
  this.stories[id].ChoosePathString('delivered');
  this.phases[id]='completed';this.facts[id+'_completed']=true;this.receipts.push(receipt);
  this.advance(id);return {changed:true};
 }
 // Shared memory is read by a different story without changing its Ink state.
 memory(id){
  this.checkId(id);
  if(id==='dinner')return this.facts.garden_completed?'Keiko mentions that the school garden is thriving thanks to you.':'Keiko has not yet heard news of a completed school garden.';
  return this.facts.dinner_completed?'The schoolchildren heard about Juliette’s successful community dinner.':'The schoolchildren are still wondering how Juliette’s dinner will turn out.';
 }
 snapshot(){return {version:VERSION,phases:{...this.phases},lines:structuredClone(this.lines),facts:{...this.facts},receipts:[...this.receipts],ink:Object.fromEntries(IDS.map(id=>[id,this.stories[id].state.ToJson()]))}}
 restore(saved){
  if(!saved||saved.version!==VERSION||!saved.phases||!saved.lines||!saved.facts||!saved.ink||!Array.isArray(saved.receipts))throw Error('Invalid multi-story save');
  const allowed=['invitation','active','declined','completed'];
  const candidates={};
  for(const id of IDS){
   if(!allowed.includes(saved.phases[id])||!Array.isArray(saved.lines[id])||saved.lines[id].some(x=>typeof x!=='string')||typeof saved.ink[id]!=='string')throw Error('Invalid story checkpoint');
   candidates[id]=new Story(this.compiled[id]);candidates[id].state.LoadJson(saved.ink[id]);
   if(saved.phases[id]==='completed'&&(saved.facts[id+'_completed']!==true||saved.receipts.filter(x=>x==='story:'+id+':completed').length!==1))throw Error('Invalid completion receipt');
   if(saved.phases[id]!=='completed'&&(saved.facts[id+'_completed']===true||saved.receipts.includes('story:'+id+':completed')))throw Error('Inconsistent story completion');
   if(['active','declined','completed'].includes(saved.phases[id])&&saved.facts[id+'_offered_help']!==(saved.phases[id]!=='declined'))throw Error('Inconsistent story choice');
   if(saved.phases[id]==='invitation'&&Object.hasOwn(saved.facts,id+'_offered_help'))throw Error('Unexpected choice memory');
  }
  if(saved.receipts.length!==new Set(saved.receipts).size||saved.receipts.some(x=>!IDS.some(id=>x==='story:'+id+':completed')))throw Error('Invalid receipts');
  this.stories=candidates;this.phases={...saved.phases};this.lines=structuredClone(saved.lines);this.facts={...saved.facts};this.receipts=[...saved.receipts];
 }
}
module.exports={MultiStoryLab};
