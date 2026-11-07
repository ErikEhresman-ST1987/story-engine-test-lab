'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const {compileDirectory}=require('../scripts/compile-story-directory.cjs');
const {MultiChapterRegistry}=require('../packages/story-engine/multi-chapter-registry.cjs');
const fixture=path.resolve(__dirname,'../fixtures/three-chapter');
class IndependentHost {
 constructor(){this.count=0;}
 snapshot(){return {count:this.count};}
 restore(saved){if(!saved||!Number.isSafeInteger(saved.count)||saved.count<0)throw Error('Invalid host state');this.count=saved.count;}
 event(){this.count++;return {changed:true,completed:true};}
}
function install(save){
 return new MultiChapterRegistry({packages:[compileDirectory(fixture)],hostFactory:()=>new IndependentHost(),save});
}
test('generic directory compiler installs unchanged engine into independent host',()=>{
 const runtime=install();
 assert.equal(runtime.view('sample-three-chapter').chapter,'chapter-1');
 runtime.choose('sample-three-chapter',0);
 runtime.event('sample-three-chapter','harvest.carrot');
 runtime.nextChapter('sample-three-chapter');
 assert.equal(runtime.view('sample-three-chapter').chapter,'chapter-2');
 const saved=runtime.snapshot();
 assert.deepEqual(install(saved).snapshot(),saved);
});
test('independent host rejects malformed save without replacing valid state',()=>{
 const runtime=install();
 const before=runtime.snapshot();
 const bad=structuredClone(before);
 bad.stories['sample-three-chapter'].contentVersion='unknown';
 assert.throws(()=>runtime.restore(bad));
 assert.deepEqual(runtime.snapshot(),before);
});

test('host denial prevents chapter completion and changing inventory',()=>{
 class DenyingHost extends IndependentHost {
  event(){return {changed:false,completed:false};}
 }
 const runtime=new MultiChapterRegistry({packages:[compileDirectory(fixture)],hostFactory:()=>new DenyingHost()});
 const id='sample-three-chapter';
 runtime.choose(id,0);
 const before=runtime.snapshot();
 const result=runtime.event(id,'harvest.carrot');
 assert.equal(result.changed,false);
 assert.deepEqual(runtime.snapshot(),before);
 assert.throws(()=>runtime.nextChapter(id),/not ready/);
});
test('completed chapter cannot accept the same event twice',()=>{
 const runtime=install(),id='sample-three-chapter';
 runtime.choose(id,0);
 runtime.event(id,'harvest.carrot');
 const after=runtime.snapshot();
 const second=runtime.event(id,'harvest.carrot');
 assert.equal(second.changed,false);
 assert.deepEqual(runtime.snapshot(),after);
});
