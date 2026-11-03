'use strict';
const initial=()=>({version:1,supplies:0,turn:0,mission:{accepted:false,completed:false},receipts:[],facts:{}});
class ColonyHost{
 constructor(){this.state=initial()}
 snapshot(){return structuredClone(this.state)}
 restore(saved,phase){
  if(!saved||saved.version!==1||!Number.isSafeInteger(saved.supplies)||saved.supplies<0||!Number.isSafeInteger(saved.turn)||saved.turn<0||!saved.mission||typeof saved.mission.accepted!=='boolean'||typeof saved.mission.completed!=='boolean'||!Array.isArray(saved.receipts)||!saved.facts||typeof saved.facts!=='object')throw Error('Invalid colony save');
  const receipt=saved.receipts.filter(x=>x==='colony:survey:assist').length;
  if(saved.receipts.some(x=>typeof x!=='string')||receipt>1)throw Error('Invalid colony receipt');
  if(phase==='active'&&(!saved.mission.accepted||saved.mission.completed))throw Error('Inconsistent colony objective');
  if(phase==='completed'&&(!saved.mission.accepted||!saved.mission.completed||receipt!==1||saved.facts.survey_team_assisted!==true))throw Error('Inconsistent colony completion');
  if(['invitation','declined'].includes(phase)&&(saved.mission.accepted||saved.mission.completed||receipt))throw Error('Inconsistent colony invitation');
  this.state=structuredClone(saved);
 }
 decision(index){return index===0?'accept':index===1?'decline':null}
 accept(){if(this.state.mission.completed)throw Error('Already completed');this.state.mission.accepted=true}
 event(name){
  if(name==='colony.scavenge'){this.state.turn++;this.state.supplies++;return {changed:true,completed:false}}
  if(name==='colony.wait'){this.state.turn++;return {changed:true,completed:false}}
  if(name==='colony.assist'){
   if(!this.state.mission.accepted)return {changed:false,reason:'Mission not accepted'};
   if(this.state.receipts.includes('colony:survey:assist'))return {changed:false,reason:'Already assisted'};
   if(this.state.supplies<2)return {changed:false,reason:'Need two supplies'};
   this.state.supplies-=2;this.state.mission.completed=true;this.state.facts.survey_team_assisted=true;this.state.receipts.push('colony:survey:assist');
   return {changed:true,completed:true};
  }
  throw Error('Unsupported colony event');
 }
}
module.exports={ColonyHost};
