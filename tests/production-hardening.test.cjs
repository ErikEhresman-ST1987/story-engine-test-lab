'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {AuthorizedGame}=require('../packages/story-engine/authorized-game.cjs');
const {migrateNarrativeSave}=require('../packages/story-engine/migrate-narrative-save.cjs');
class Game{
 constructor(){this.carrots=2;this.receipts=[]}
 snapshot(){return {carrots:this.carrots,receipts:[...this.receipts]}}
 restore(s){this.carrots=s.carrots;this.receipts=[...s.receipts]}
 event(name,context){
  const receipt=context.storyId+':'+context.chapterId+':delivery';
  if(name!=='deliver.dinner'||this.carrots<2||this.receipts.includes(receipt))return {changed:false,completed:false};
  this.carrots-=2;this.receipts.push(receipt);return {changed:true,completed:true};
 }
}
test('game policy rejects unauthorized story and missing context without consuming resources',()=>{
 const game=new AuthorizedGame({game:new Game(),policies:{'deliver.dinner':c=>c.storyId==='garden'&&c.chapterId==='chapter-1'}});
 assert.equal(game.event('deliver.dinner',{storyId:'dinner',chapterId:'chapter-1'}).changed,false);
 assert.equal(game.event('deliver.dinner').changed,false);
 assert.equal(game.snapshot().carrots,2);
 assert.equal(game.event('deliver.dinner',{storyId:'garden',chapterId:'chapter-1'}).completed,true);
 assert.equal(game.snapshot().carrots,0);
 assert.equal(game.event('deliver.dinner',{storyId:'garden',chapterId:'chapter-1'}).changed,false);
 assert.equal(game.snapshot().receipts.length,1);
});
test('migration validates candidate and leaves original untouched on rejection',()=>{
 const original={narrative:{registry:{stories:{garden:{contentVersion:'1'}}}}};
 const before=structuredClone(original);
 assert.throws(()=>migrateNarrativeSave(original,{fromVersion:'1',toVersion:'2',transform:s=>s,validate:()=>{}}),/update all/);
 assert.deepEqual(original,before);
 assert.throws(()=>migrateNarrativeSave(original,{fromVersion:'0',toVersion:'2',transform:s=>s,validate:()=>{}}),/Unsupported source/);
 const migrated=migrateNarrativeSave(original,{fromVersion:'1',toVersion:'2',transform:s=>{s.narrative.registry.stories.garden.contentVersion='2';return s},validate:s=>assert.equal(s.narrative.registry.stories.garden.contentVersion,'2')});
 assert.equal(migrated.narrative.registry.stories.garden.contentVersion,'2');
 assert.deepEqual(original,before);
});
