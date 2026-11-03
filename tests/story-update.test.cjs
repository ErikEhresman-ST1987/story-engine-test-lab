'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {Compiler}=require('inkjs/full');
const {IntegratedCycle}=require('../src/integrated-cycle.cjs');
const oldSource=require('../web/integrated-story.cjs');
const newSource=require('../web/integrated-story-v2.cjs');
const {restoreWithPolicy,exportSave,readSave}=require('../src/story-update-compat.cjs');
const oldCompiled=new Compiler(oldSource).Compile().ToJson();
const newCompiled=new Compiler(newSource).Compile().ToJson();
function oldSave(phase){
 const c=new IntegratedCycle(oldCompiled);c.advance();
 if(phase!=='invitation'){c.choose(phase==='declined'?1:0)}
 if(phase==='completed'){for(const e of ['harvest.carrot','harvest.carrot','harvest.wheat','deliver.dinner'])c.event(e)}
 const s=c.snapshot();return {schema:1,contentVersion:'juliette-dinner-v1',phase:s.phase,ink:s.ink,game:s.game};
}
test('unchanged story restores exact Ink state',()=>{
 const s=oldSave('collecting');
 const r=restoreWithPolicy(s,oldCompiled,{targetVersion:'juliette-dinner-v1'});
 assert.equal(r.status,'unchanged');assert.equal(r.story.state.ToJson(),s.ink);
});
for(const phase of ['invitation','collecting','declined','completed']){
 test('approved v1 to v2 migration preserves '+phase,()=>{
  const s=oldSave(phase);
  const r=restoreWithPolicy(s,newCompiled);
  assert.equal(r.status,'migrated');assert.equal(r.phase,phase);
  assert.deepEqual(r.game.snapshot(),s.game);
  const saved=exportSave(r);assert.equal(saved.contentVersion,'juliette-dinner-v2');
  assert.equal(restoreWithPolicy(saved,newCompiled).status,'unchanged');
  if(phase==='completed'){
   assert.equal(r.game.event('deliver.dinner').changed,false);
   assert.equal(r.game.snapshot().receipts.length,1);
  }
 });
}
test('unknown content versions reject without modifying original',()=>{
 const s=oldSave('completed'),copy=JSON.stringify(s);s.contentVersion='juliette-dinner-v0';
 assert.throws(()=>restoreWithPolicy(s,newCompiled),/No approved migration/);
 assert.equal(s.game.receipts.length,1);
 assert.notEqual(JSON.stringify(s),copy);
});
test('inconsistent completed receipt rejected',()=>{
 const s=oldSave('completed');s.game.receipts=[];
 assert.throws(()=>readSave(s),/Inconsistent completion/);
});
test('invalid content version and corrupt JSON fail closed',()=>{
 assert.throws(()=>restoreWithPolicy('{broken',newCompiled));
 const s=oldSave('collecting');s.contentVersion='juliette-dinner-v3';
 assert.throws(()=>restoreWithPolicy(s,newCompiled),/No approved migration/);
});
