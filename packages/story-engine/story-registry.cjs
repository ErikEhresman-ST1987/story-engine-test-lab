'use strict';
const {Story}=require('inkjs');
const SCHEMA=1;
const PHASES=['hidden','available','deferred','declined','active','completed'];
const clone=value=>structuredClone(value);
function validateDefinitions(definitions){
 if(!Array.isArray(definitions)||!definitions.length)throw Error('Story definitions required');
 const ids=new Set();
 for(const d of definitions){
  if(!d||typeof d.id!=='string'||!d.id.trim()||ids.has(d.id)||!d.compiled||!Array.isArray(d.requires)||d.requires.some(f=>typeof f!=='string'||!f.trim())||typeof d.completionPath!=='string'||!d.completionPath.trim())throw Error('Invalid story definition');
  ids.add(d.id);
 }
}
class StoryRegistry{
 constructor({definitions,save}){
  validateDefinitions(definitions);
  this.definitions=new Map(definitions.map(d=>[d.id,d]));
  this.stories=new Map(definitions.map(d=>[d.id,new Story(d.compiled)]));
  this.state={schema:SCHEMA,facts:{},receipts:[],entries:Object.fromEntries(definitions.map(d=>[d.id,{phase:'hidden',lines:[]}]))};
  if(save)this.restore(save);else this.refresh();
 }
 check(id){if(!this.definitions.has(id))throw Error('Unknown story');return this.state.entries[id]}
 refresh(){
  for(const [id,d] of this.definitions)if(this.state.entries[id].phase==='hidden'&&d.requires.every(f=>this.state.facts[f]===true))this.state.entries[id].phase='available';
 }
 fact(name,value=true){
  if(typeof name!=='string'||!name.trim()||typeof value!=='boolean')throw Error('Invalid fact');
  this.state.facts[name]=value;this.refresh();
 }
 view(id){const e=this.check(id);return {phase:e.phase,lines:[...e.lines],choices:this.stories.get(id).currentChoices.map((c,index)=>({index,text:c.text}))}}
 advance(id){const story=this.stories.get(id),lines=[];while(story.canContinue)lines.push(story.Continue().trim());this.check(id).lines=lines.filter(Boolean);return this.view(id)}
 decide(id,decision){
  const e=this.check(id);
  if(!['available','deferred'].includes(e.phase)||!['accept','later','decline'].includes(decision))throw Error('Invitation unavailable');
  e.phase=decision==='accept'?'active':decision==='later'?'deferred':'declined';
  if(decision==='accept')this.advance(id);
  return this.view(id);
 }
 revisit(id){const e=this.check(id);if(e.phase!=='declined')throw Error('No declined invitation');e.phase='available';return this.view(id)}
 complete(id){
  const e=this.check(id);if(e.phase!=='active')return false;
  const receipt='story:'+id+':completed';
  if(this.state.receipts.includes(receipt))return false;
  const s=this.stories.get(id);
  // Check that the narrative checkpoint is valid before committing completion.
  const candidate=new Story(this.definitions.get(id).compiled);candidate.state.LoadJson(s.state.ToJson());
  candidate.ChoosePathString(this.definitions.get(id).completionPath);
  const lines=[];while(candidate.canContinue)lines.push(candidate.Continue().trim());
  this.stories.set(id,candidate);e.phase='completed';e.lines=lines.filter(Boolean);
  this.state.receipts.push(receipt);this.state.facts[id+'_completed']=true;this.refresh();return true;
 }
 snapshot(){return {schema:SCHEMA,definitions:[...this.definitions.keys()],state:clone(this.state),ink:Object.fromEntries([...this.stories].map(([id,s])=>[id,s.state.ToJson()]))}}
 restore(saved){
  if(!saved||saved.schema!==SCHEMA||!Array.isArray(saved.definitions)||JSON.stringify(saved.definitions)!==JSON.stringify([...this.definitions.keys()])||!saved.state||saved.state.schema!==SCHEMA||!saved.state.facts||!saved.state.entries||!Array.isArray(saved.state.receipts)||!saved.ink)throw Error('Invalid registry save');
  const receipts=saved.state.receipts;
  if(receipts.length!==new Set(receipts).size||receipts.some(r=>!this.definitions.has(r.replace(/^story:/,'').replace(/:completed$/,''))||!/^story:.+:completed$/.test(r)))throw Error('Invalid receipts');
  const candidates=new Map();
  for(const [id,d] of this.definitions){
   const e=saved.state.entries[id],receipt='story:'+id+':completed';
   if(!e||!PHASES.includes(e.phase)||!Array.isArray(e.lines)||e.lines.some(x=>typeof x!=='string')||typeof saved.ink[id]!=='string')throw Error('Invalid registry entry');
   if((e.phase==='completed')!==(receipts.includes(receipt))||(e.phase==='completed')!==(saved.state.facts[id+'_completed']===true))throw Error('Inconsistent completion');
   if(e.phase!=='hidden'&&!d.requires.every(f=>saved.state.facts[f]===true))throw Error('Inconsistent eligibility');
   const story=new Story(d.compiled);story.state.LoadJson(saved.ink[id]);candidates.set(id,story);
  }
  this.stories=candidates;this.state=clone(saved.state);
 }
}
module.exports={StoryRegistry};
