'use strict';
const {Compiler}=require('inkjs/full');
const {IntegratedCycle}=require('../src/integrated-cycle.cjs');
const {restoreWithPolicy,exportSave}=require('../src/story-update-compat.cjs');
const oldCompiled=new Compiler(require('./integrated-story.cjs')).Compile().ToJson();
const newCompiled=new Compiler(require('./integrated-story-v2.cjs')).Compile().ToJson();
const KEY='story-lab-update-test-v1';
const display=document.querySelector('#update-result');
const detail=document.querySelector('#update-detail');
const buttons=document.querySelectorAll('[data-update-action]');
let record=null;
function render(message){
 display.textContent=message;
 const original=record&&record.original;
 const updated=record&&record.updated;
 detail.textContent=record?[
 'Original content: '+original.contentVersion,
 'Original phase: '+original.phase,
 'Original receipt count: '+original.game.receipts.length,
 'Updated content: '+(updated?updated.contentVersion:'Not applied'),
 'Updated phase: '+(updated?updated.phase:'Not applied'),
 'Updated receipt count: '+(updated?updated.game.receipts.length:'Not applied'),
 'Original preserved: '+Boolean(original)
 ].join('\n'):'No compatibility test saved.';
}
function load(){
 try{
  const raw=localStorage.getItem(KEY);
  if(raw){
   const parsed=JSON.parse(raw);
   if(!parsed||!parsed.original||typeof parsed.original.ink!=='string')throw Error('Invalid lab record');
   record=parsed;
   render('Compatibility test restored after reload.');
  }else render('Choose an older saved-story scenario to begin.');
 }catch(e){record=null;render('Existing compatibility record could not be read. It was not overwritten. '+e.message)}
}
function persist(){
 localStorage.setItem(KEY,JSON.stringify(record));
}
function makeLegacy(phase){
 const cycle=new IntegratedCycle(oldCompiled);
 cycle.advance();
 if(phase!=='invitation')cycle.choose(phase==='declined'?1:0);
 if(phase==='completed')for(const e of ['harvest.carrot','harvest.carrot','harvest.wheat','deliver.dinner'])cycle.event(e);
 const s=cycle.snapshot();
 return {schema:1,contentVersion:'juliette-dinner-v1',phase:s.phase,ink:s.ink,game:s.game};
}
for(const b of buttons)b.addEventListener('click',()=>{
 const action=b.dataset.updateAction;
 try{
  if(action.startsWith('seed-')){
   const phase=action.slice(5);
   record={original:makeLegacy(phase),updated:null};
   persist();render('Created and saved an older v1 story at phase: '+phase+'.');
  }else if(action==='migrate'){
   if(!record)throw Error('Create an older save first.');
   const migrated=restoreWithPolicy(record.original,newCompiled);
   const candidate=exportSave(migrated);
   if(JSON.stringify(candidate.game)!==JSON.stringify(record.original.game))throw Error('Gameplay data changed unexpectedly');
   const prior=record;
   record={original:prior.original,updated:candidate};
   try{persist()}catch(e){record=prior;throw e}
   render('Approved v1 → v2 update succeeded. Inventory, facts, and receipt preserved.');
  }else if(action==='reject'){
   if(!record)throw Error('Create an older save first.');
   const originalBytes=JSON.stringify(record.original);
   const incompatible={...record.original,contentVersion:'juliette-dinner-unknown'};
   let rejected=false;
   try{restoreWithPolicy(incompatible,newCompiled)}catch(e){rejected=/No approved migration/.test(e.message)}
   if(!rejected||JSON.stringify(record.original)!==originalBytes)throw Error('Safety check failed');
   render('Unknown update rejected. The original saved story is unchanged.');
  }else if(action==='reset'){
   if(!confirm('Clear only the Increment 5 compatibility test?'))return;
   localStorage.removeItem(KEY);record=null;render('Compatibility test cleared; other story tests untouched.');
  }
 }catch(e){render('Operation stopped safely: '+e.message)}
});
load();
