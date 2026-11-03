'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {GameplayBridge}=require('../src/gameplay-bridge.cjs');
test('routine harvest does not complete story',()=>{
 const g=new GameplayBridge();g.event('harvest.carrot');g.event('harvest.carrot');g.event('harvest.wheat');
 assert.equal(g.snapshot().dinner.completed,false);
 assert.equal(g.event('deliver.dinner').changed,false);
});
test('acceptance and gameplay event gating',()=>{
 const g=new GameplayBridge();g.accept();assert.equal(g.event('deliver.dinner').changed,false);
 g.event('harvest.carrot');g.event('harvest.carrot');g.event('harvest.wheat');
 assert.equal(g.event('deliver.dinner').changed,true);
 assert.deepEqual(g.snapshot().inventory,{carrot:0,wheat:0});
 assert.equal(g.snapshot().facts.juliette_dinner_delivered,true);
});
test('one atomic snapshot prevents replayed delivery after restore',()=>{
 const g=new GameplayBridge();g.accept();
 for(const e of ['harvest.carrot','harvest.carrot','harvest.wheat'])g.event(e);
 g.event('deliver.dinner');
 const restored=new GameplayBridge(JSON.parse(JSON.stringify(g.snapshot())));
 assert.equal(restored.event('deliver.dinner').changed,false);
 assert.equal(restored.snapshot().receipts.length,1);
 assert.deepEqual(restored.snapshot().inventory,{carrot:0,wheat:0});
});
test('reject invalid inventory and unknown events',()=>{
 assert.throws(()=>new GameplayBridge({version:1,inventory:{carrot:-1,wheat:0},dinner:{accepted:false,completed:false},receipts:[],facts:{}}),/Invalid inventory/);
 assert.throws(()=>new GameplayBridge().event('routine.order'),/Unsupported/);
});
