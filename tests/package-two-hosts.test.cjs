'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {Compiler}=require('inkjs/full');
const {StoryCoordinator}=require('../packages/story-engine/index.cjs');
const {FarmHost}=require('../src/farm-host.cjs');
const {ColonyHost}=require('../src/colony-host.cjs');
const farm=new Compiler(require('../web/integrated-story.cjs')).Compile().ToJson();
const colony=new Compiler(require('../web/colony-story.cjs')).Compile().ToJson();
function start(compiled,Host,storyId){const c=new StoryCoordinator({compiled,adapter:new Host(),storyId});c.advance();return c}
for(const [id,compiled,Host,events,receipt] of [
 ['farm',farm,FarmHost,['harvest.carrot','harvest.carrot','harvest.wheat','deliver.dinner'],'juliette:dinner:delivery'],
 ['colony',colony,ColonyHost,['colony.scavenge','colony.wait','colony.scavenge','colony.assist'],'colony:survey:assist']
]){
 test(id+' uses extracted package, commits once and restores dialogue',()=>{
  const c=start(compiled,Host,id);c.choose(0);
  for(const e of events)assert.equal(c.event(e).changed,true);
  assert.equal(c.view().phase,'completed');
  const s=c.snapshot(),restored=new StoryCoordinator({compiled,adapter:new Host(),storyId:id,save:s});
  assert.deepEqual(restored.view().lines,c.view().lines);
  assert.equal(restored.snapshot().game.receipts.filter(x=>x===receipt).length,1);
  assert.equal(restored.event(events.at(-1)).changed,false);
  assert.deepEqual(restored.snapshot(),s);
 });
 test(id+' rejects bad saves without changing valid original',()=>{
  const c=start(compiled,Host,id);c.choose(0);
  const original=c.snapshot(),broken=structuredClone(original);broken.game.receipts=[receipt];
  assert.throws(()=>new StoryCoordinator({compiled,adapter:new Host(),storyId:id,save:broken}));
  assert.deepEqual(c.snapshot(),original);
  assert.throws(()=>new StoryCoordinator({compiled,adapter:new Host(),storyId:'wrong',save:original}),/Invalid coordinator/);
 });
 test(id+' refuses routine event as completion',()=>{
  const c=start(compiled,Host,id);c.choose(0);
  c.event(events[0]);assert.equal(c.view().phase,'active');
 });
}
test('colony cannot assist before resources and waiting does not complete',()=>{
 const c=start(colony,ColonyHost,'colony');c.choose(0);
 assert.equal(c.event('colony.assist').changed,false);
 c.event('colony.wait');assert.equal(c.view().phase,'active');
 assert.equal(c.snapshot().game.receipts.length,0);
});
test('two coordinators do not share state',()=>{
 const a=start(farm,FarmHost,'farm'),b=start(colony,ColonyHost,'colony');
 a.choose(0);assert.equal(b.view().phase,'invitation');
});
