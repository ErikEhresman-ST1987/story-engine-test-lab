'use strict';
const {Story}=require('inkjs');
const {GameplayBridge}=require('./gameplay-bridge.cjs');
const SCHEMA=1;
const CURRENT_CONTENT='juliette-dinner-v2';
const LEGACY_CONTENT='juliette-dinner-v1';
const phases=['invitation','collecting','declined','completed'];
function readSave(raw){
 const s=typeof raw==='string'?JSON.parse(raw):raw;
 if(!s||s.schema!==SCHEMA||!phases.includes(s.phase)||!s.game||typeof s.contentVersion!=='string'||typeof s.ink!=='string')throw Error('Unsupported or corrupt story save');
 const game=new GameplayBridge(s.game).snapshot();
 if(s.phase==='completed'&&(!game.dinner.completed||!game.facts.juliette_dinner_delivered||game.receipts.filter(x=>x==='juliette:dinner:delivery').length!==1))throw Error('Inconsistent completion receipt');
 if(s.phase==='collecting'&&(!game.dinner.accepted||game.dinner.completed))throw Error('Inconsistent active objective');
 if(s.phase==='invitation'&&(game.dinner.accepted||game.dinner.completed))throw Error('Inconsistent invitation');
 if(s.phase==='declined'&&(game.dinner.accepted||game.dinner.completed))throw Error('Inconsistent declined objective');
 return s;
}
function restoreWithPolicy(raw,compiled,options={}){
 const saved=readSave(raw);
 const target=options.targetVersion||CURRENT_CONTENT;
 const story=new Story(compiled);
 if(saved.contentVersion===target){
  story.state.LoadJson(saved.ink);
  return {status:'unchanged',story,game:new GameplayBridge(saved.game),phase:saved.phase,contentVersion:target};
 }
 if(saved.contentVersion!==LEGACY_CONTENT||target!==CURRENT_CONTENT)throw Error('No approved migration; original save preserved');
 // Explicit phase mapping, never load old Ink pointers into changed compiled content.
 // Existing game inventory, facts, and receipt remain authoritative.
 if(saved.phase==='invitation'){
  while(story.canContinue)story.Continue();
 }else if(saved.phase==='collecting'||saved.phase==='declined'){
  while(story.canContinue)story.Continue();
  const choiceIndex=story.currentChoices.findIndex(c=>c.text.includes(saved.phase==='collecting'?'Volunteer':'Ask for more time'));
  if(choiceIndex<0)throw Error('New story lacks approved invitation checkpoint');
  story.ChooseChoiceIndex(choiceIndex);
  while(story.canContinue)story.Continue();
 }else if(saved.phase==='completed'){
  story.ChoosePathString('delivered');
  while(story.canContinue)story.Continue();
 }
 return {status:'migrated',story,game:new GameplayBridge(saved.game),phase:saved.phase,contentVersion:target};
}
function exportSave(result){
 return {schema:SCHEMA,contentVersion:result.contentVersion,phase:result.phase,ink:result.story.state.ToJson(),game:result.game.snapshot()};
}
module.exports={restoreWithPolicy,exportSave,readSave,CURRENT_CONTENT,LEGACY_CONTENT};
