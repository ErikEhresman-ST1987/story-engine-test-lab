'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),{Compiler}=require('inkjs/full');
const {MultiStoryLab}=require('../src/multi-story-lab.cjs');
const compiled={garden:new Compiler(require('../web/multi-garden.cjs')).Compile().ToJson(),dinner:new Compiler(require('../web/multi-dinner.cjs')).Compile().ToJson()};
test('two stories active at once and cross-story memory updates',()=>{
 const lab=new MultiStoryLab(compiled);lab.choose('garden',0);lab.choose('dinner',0);
 assert.equal(lab.view('garden').phase,'active');assert.equal(lab.view('dinner').phase,'active');
 assert.match(lab.memory('dinner'),/not yet heard/);
 assert.equal(lab.complete('garden').changed,true);assert.match(lab.memory('dinner'),/thriving/);
 assert.equal(lab.view('dinner').phase,'active');
 assert.equal(lab.complete('garden').changed,false);
 assert.equal(lab.complete('dinner').changed,true);
 assert.equal(lab.snapshot().receipts.length,2);
});
test('save and reload independently restores both stories and memory',()=>{
 const a=new MultiStoryLab(compiled);a.choose('garden',0);a.choose('dinner',0);a.complete('garden');
 const b=new MultiStoryLab(compiled,JSON.parse(JSON.stringify(a.snapshot())));
 assert.deepEqual(b.snapshot(),a.snapshot());assert.match(b.memory('dinner'),/thriving/);
 b.complete('dinner');assert.equal(a.view('dinner').phase,'active');
});
test('declined story does not block another',()=>{
 const a=new MultiStoryLab(compiled);a.choose('garden',1);a.choose('dinner',0);
 assert.equal(a.complete('garden').changed,false);assert.equal(a.complete('dinner').changed,true);
});
test('bad receipt and unknown versions are rejected',()=>{
 const a=new MultiStoryLab(compiled);a.choose('garden',0);a.complete('garden');
 const s=a.snapshot(),bad=structuredClone(s);bad.receipts.push('story:garden:completed');
 assert.throws(()=>new MultiStoryLab(compiled,bad));bad.receipts=[];
 assert.throws(()=>new MultiStoryLab(compiled,bad));const version=structuredClone(s);version.version=99;
 assert.throws(()=>new MultiStoryLab(compiled,version));assert.deepEqual(a.snapshot(),s);
});
