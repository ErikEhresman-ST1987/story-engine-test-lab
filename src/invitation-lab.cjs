'use strict';
const VERSION=1;
const DEFINITIONS={
 garden:{title:'Keiko · School garden',requires:[]},
 dinner:{title:'Juliette · Community dinner',requires:['town_met_juliette']}
};
class InvitationLab{
 constructor(saved){
  this.state={version:VERSION,facts:{town_met_juliette:false},stories:{garden:'hidden',dinner:'hidden'},receipts:[]};
  if(saved)this.restore(saved);else this.refreshEligibility();
 }
 refreshEligibility(){
  for(const [id,definition] of Object.entries(DEFINITIONS)){
   if(this.state.stories[id]==='hidden'&&definition.requires.every(f=>this.state.facts[f]===true))this.state.stories[id]='available';
  }
 }
 meetJuliette(){this.state.facts.town_met_juliette=true;this.refreshEligibility()}
 decide(id,decision){
  if(!DEFINITIONS[id])throw Error('Unknown story');
  if(!['accept','later','decline'].includes(decision))throw Error('Unknown decision');
  const phase=this.state.stories[id];
  if(!['available','deferred'].includes(phase))throw Error('Invitation is not available');
  this.state.stories[id]=decision==='accept'?'active':decision==='later'?'deferred':'declined';
 }
 revisit(id){
  if(!DEFINITIONS[id]||this.state.stories[id]!=='declined')throw Error('No declined invitation');
  this.state.stories[id]='available';
 }
 complete(id){
  if(!DEFINITIONS[id]||this.state.stories[id]!=='active')return false;
  const receipt='story:'+id+':completed';
  if(this.state.receipts.includes(receipt))return false;
  this.state.receipts.push(receipt);this.state.stories[id]='completed';this.state.facts[id+'_completed']=true;this.refreshEligibility();return true;
 }
 snapshot(){return structuredClone(this.state)}
 restore(saved){
  if(!saved||saved.version!==VERSION||!saved.facts||!saved.stories||!Array.isArray(saved.receipts))throw Error('Invalid invitation save');
  const phases=['hidden','available','deferred','declined','active','completed'];
  for(const id of Object.keys(DEFINITIONS)){
   if(!phases.includes(saved.stories[id]))throw Error('Invalid invitation phase');
   const receipt='story:'+id+':completed';
   if((saved.stories[id]==='completed')!==(saved.facts[id+'_completed']===true)||saved.receipts.filter(x=>x===receipt).length!==(saved.stories[id]==='completed'?1:0))throw Error('Inconsistent completion');
   if(id==='dinner'&&saved.stories[id]!=='hidden'&&saved.facts.town_met_juliette!==true)throw Error('Eligibility mismatch');
  }
  if(typeof saved.facts.town_met_juliette!=='boolean'||saved.receipts.length!==new Set(saved.receipts).size||saved.receipts.some(x=>!Object.keys(DEFINITIONS).some(id=>x==='story:'+id+':completed')))throw Error('Invalid invitation facts');
  this.state=structuredClone(saved);
 }
}
module.exports={InvitationLab,DEFINITIONS};
