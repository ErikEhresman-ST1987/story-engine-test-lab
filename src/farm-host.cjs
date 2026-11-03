'use strict';
const {GameplayBridge}=require('./gameplay-bridge.cjs');
class FarmHost{
 constructor(){this.bridge=new GameplayBridge()}
 snapshot(){return this.bridge.snapshot()}
 restore(saved,phase){
  const candidate=new GameplayBridge(saved),g=candidate.snapshot();
  if(phase==='active'&&(!g.dinner.accepted||g.dinner.completed||g.receipts.length!==0))throw Error('Inconsistent farm objective');
  if(phase==='completed'&&(!g.dinner.completed||g.receipts.filter(x=>x==='juliette:dinner:delivery').length!==1))throw Error('Inconsistent farm completion');
  if(['invitation','declined'].includes(phase)&&(g.dinner.accepted||g.dinner.completed))throw Error('Inconsistent farm invitation');
  this.bridge=candidate;
 }
 decision(index){return index===0?'accept':index===1?'decline':null}
 accept(){this.bridge.accept()}
 event(name){const r=this.bridge.event(name);return {...r,completed:name==='deliver.dinner'&&r.changed}}
}
module.exports={FarmHost};
