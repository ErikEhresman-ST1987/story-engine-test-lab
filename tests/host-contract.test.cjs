'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {validateHostContract,dispatchHostEvent}=require('../packages/story-engine/host-contract.cjs');
const {GameplayBridge}=require('../src/gameplay-bridge.cjs');
const manifest={events:['deliver.dinner'],effects:['juliette:dinner:delivery']};
function host(bridge){return {events:['deliver.dinner'],effects:['juliette:dinner:delivery'],handleEvent:name=>bridge.event(name)}}
test('host approves only declared gameplay capabilities',()=>{
 const bridge=new GameplayBridge();assert.equal(validateHostContract(manifest,host(bridge)),true);
 assert.throws(()=>validateHostContract({...manifest,events:['grant.gold']},host(bridge)),/Unsupported host events/);
 assert.throws(()=>validateHostContract({...manifest,effects:['unapproved:reward']},host(bridge)),/Unsupported host effects/);
});
test('host checks inventory, owns completion and prevents duplicate delivery',()=>{
 const bridge=new GameplayBridge(),h=host(bridge);
 assert.equal(dispatchHostEvent(h,'deliver.dinner').changed,false);
 bridge.accept();assert.equal(dispatchHostEvent(h,'deliver.dinner').changed,false);
 bridge.event('harvest.carrot');bridge.event('harvest.carrot');bridge.event('harvest.wheat');
 assert.equal(dispatchHostEvent(h,'deliver.dinner').completed,false); // bridge reports changed, not completion flag
 assert.equal(bridge.snapshot().receipts.length,1);
 assert.equal(dispatchHostEvent(h,'deliver.dinner').changed,false);
 assert.equal(bridge.snapshot().receipts.length,1);
 assert.throws(()=>dispatchHostEvent(h,'grant.gold'),/Unsupported gameplay event/);
});
