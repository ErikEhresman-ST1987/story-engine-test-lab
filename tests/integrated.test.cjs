'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {Compiler}=require('inkjs/full');
const {IntegratedCycle}=require('../src/integrated-cycle.cjs');
const ink=require('../web/integrated-story.cjs');
const compiled=new Compiler(ink).Compile().ToJson();
test('Ink choice activates gameplay, delivery advances Ink and survives reload',()=>{
 const cycle=new IntegratedCycle(compiled);
 assert.equal(cycle.advance().choices.length,2);
 assert.match(cycle.choose(0).lines.join(' '),/two carrots/);
 assert.equal(cycle.snapshot().phase,'collecting');
 for(const e of ['harvest.carrot','harvest.carrot','harvest.wheat'])cycle.event(e);
 assert.equal(cycle.snapshot().phase,'collecting');
 const result=cycle.event('deliver.dinner');
 assert.equal(result.changed,true);
 assert.match(result.story.lines.join(' '),/Juliette beams/);
 const restored=new IntegratedCycle(compiled,JSON.parse(JSON.stringify(cycle.snapshot())));
 assert.equal(restored.snapshot().phase,'completed');
 assert.equal(restored.event('deliver.dinner').changed,false);
 assert.deepEqual(restored.snapshot().game.inventory,{carrot:0,wheat:0});
 assert.equal(restored.snapshot().game.receipts.length,1);
});
test('decline cannot complete objective',()=>{
 const cycle=new IntegratedCycle(compiled);cycle.advance();cycle.choose(1);
 assert.equal(cycle.event('harvest.carrot').changed,false);
 assert.equal(cycle.event('deliver.dinner').changed,false);
 assert.equal(cycle.snapshot().phase,'declined');
});
test('insufficient supplies cannot advance narrative',()=>{
 const cycle=new IntegratedCycle(compiled);cycle.advance();cycle.choose(0);
 cycle.event('harvest.carrot');
 assert.equal(cycle.event('deliver.dinner').changed,false);
 assert.equal(cycle.snapshot().phase,'collecting');
});
test('incompatible integrated saves rejected',()=>{
 assert.throws(()=>new IntegratedCycle(compiled,{version:2}),/Invalid/);
});
