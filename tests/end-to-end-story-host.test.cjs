'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {Compiler}=require('inkjs/full');
const {StoryCoordinator}=require('../packages/story-engine/index.cjs');
const {FarmHost}=require('../src/farm-host.cjs');
const {ColonyHost}=require('../src/colony-host.cjs');
const {validateHostContract,dispatchHostEvent}=require('../packages/story-engine/host-contract.cjs');
const cases=[
 {id:'farm',Host:FarmHost,source:require('../web/integrated-story.cjs'),events:['harvest.carrot','harvest.carrot','harvest.wheat'],finish:'deliver.dinner',receipt:'juliette:dinner:delivery'},
 {id:'colony',Host:ColonyHost,source:require('../web/colony-story.cjs'),events:['colony.scavenge','colony.wait','colony.scavenge'],finish:'colony.assist',receipt:'colony:survey:assist'}
];
for(const item of cases){
 test(item.id+' preserves host-confirmed story progression across reload and replay',()=>{
  const compiled=new Compiler(item.source).Compile().ToJson();
  const host=new item.Host();
  const c=new StoryCoordinator({compiled,adapter:host,storyId:item.id});
  c.advance();c.choose(0);
  assert.equal(c.event(item.finish).changed,false,'cannot complete without resources');
  assert.equal(c.view().phase,'active');
  const early=c.snapshot();
  const reload=new StoryCoordinator({compiled,adapter:new item.Host(),storyId:item.id,save:early});
  assert.deepEqual(reload.snapshot(),early);
  for(const event of item.events)reload.event(event);
  const before=reload.snapshot();
  const pending=new StoryCoordinator({compiled,adapter:new item.Host(),storyId:item.id,save:before});
  assert.equal(pending.view().phase,'active');
  assert.equal(pending.snapshot().game.receipts.length,0);
  const outcome=pending.event(item.finish);
  assert.equal(outcome.changed,true);assert.equal(outcome.completed,true);
  assert.equal(pending.view().phase,'completed');
  const complete=pending.snapshot();
  assert.equal(complete.game.receipts.filter(x=>x===item.receipt).length,1);
  const replay=new StoryCoordinator({compiled,adapter:new item.Host(),storyId:item.id,save:complete});
  assert.deepEqual(replay.snapshot(),complete);
  assert.equal(replay.event(item.finish).changed,false);
  assert.deepEqual(replay.snapshot(),complete);
  const tampered=structuredClone(complete);tampered.phase='active';
  assert.throws(()=>new StoryCoordinator({compiled,adapter:new item.Host(),storyId:item.id,save:tampered}));
 });
}
test('manifest event capabilities are not themselves gameplay permissions',()=>{
 const bridge=new FarmHost();
 const manifest={events:['deliver.dinner'],effects:['juliette:dinner:delivery']};
 const host={events:['deliver.dinner'],effects:['juliette:dinner:delivery'],handleEvent:name=>bridge.event(name)};
 assert.equal(validateHostContract(manifest,host),true);
 assert.equal(dispatchHostEvent(host,'deliver.dinner').changed,false);
 assert.equal(bridge.snapshot().receipts.length,0);
 assert.throws(()=>dispatchHostEvent(host,'harvest.carrot'),/Unsupported gameplay event/);
});
