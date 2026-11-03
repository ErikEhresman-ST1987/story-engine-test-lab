'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {Compiler}=require('inkjs/full');
const {StoryRegistry}=require('../packages/story-engine/story-registry.cjs');
const compiled=new Compiler('=== start ===\nHello.\n-> END\n=== finished ===\nDone.\n-> END').Compile().ToJson();
const definitions=[
 {id:'garden',compiled,requires:[],completionPath:'finished'},
 {id:'dinner',compiled,requires:['met_juliette'],completionPath:'finished'}
];
test('eligibility, deferral, decline, revisit and independent completion',()=>{
 const r=new StoryRegistry({definitions});
 assert.equal(r.view('garden').phase,'available');
 assert.equal(r.view('dinner').phase,'hidden');
 r.decide('garden','later');r.fact('met_juliette');
 assert.equal(r.view('dinner').phase,'available');
 r.decide('garden','decline');r.revisit('garden');r.decide('garden','accept');
 r.decide('dinner','accept');assert.equal(r.complete('garden'),true);
 assert.equal(r.complete('garden'),false);
 assert.equal(r.view('dinner').phase,'active');
 assert.equal(r.state.facts.garden_completed,true);
 assert.equal(r.state.receipts.length,1);
 const saved=r.snapshot(),restored=new StoryRegistry({definitions,save:saved});
 assert.deepEqual(restored.snapshot(),saved);
 assert.equal(restored.complete('dinner'),true);
 assert.equal(restored.state.receipts.length,2);
});
test('rejects corrupt saves without mutating original',()=>{
 const r=new StoryRegistry({definitions});r.decide('garden','accept');
 const original=r.snapshot(),bad=structuredClone(original);
 bad.state.entries.garden.phase='completed';
 assert.throws(()=>new StoryRegistry({definitions,save:bad}),/Inconsistent completion/);
 assert.deepEqual(r.snapshot(),original);
});
test('different story registries do not share facts',()=>{
 const a=new StoryRegistry({definitions}),b=new StoryRegistry({definitions});
 a.fact('met_juliette');
 assert.equal(a.view('dinner').phase,'available');
 assert.equal(b.view('dinner').phase,'hidden');
});
test('invalid completion path does not grant receipt',()=>{
 const broken=[{id:'bad',compiled,requires:[],completionPath:'missing'}];
 const r=new StoryRegistry({definitions:broken});r.decide('bad','accept');
 assert.throws(()=>r.complete('bad'));
 assert.equal(r.state.receipts.length,0);
 assert.equal(r.view('bad').phase,'active');
});
