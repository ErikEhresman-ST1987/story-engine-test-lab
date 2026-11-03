'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {Compiler}=require('inkjs/full');
const {StoryHost}=require('../src/engine.cjs');
const compile=file=>new Compiler(fs.readFileSync(path.join(__dirname,'../stories',file),'utf8')).Compile().ToJson();
const content={single:compile('single.ink'),arc:compile('arc.ink')};
test('independent story instances and branching',()=>{
 const h=new StoryHost(content);
 assert.equal(h.advance('single').choices.length,2);
 assert.equal(h.advance('arc').choices.length,2);
 assert.equal(h.choose('single',0).ended,true);
 assert.match(h.choose('arc',0).lines.join(' '),/Wonderful/);
 assert.equal(h.open('arc').variablesState.$('helped_dinner'),true);
});
test('save/restore two narratives and shared facts',()=>{
 const h=new StoryHost(content);
 h.advance('single');h.choose('single',0);
 h.advance('arc');h.choose('arc',1);
 h.fact('school_garden_helped',true);
 const restored=new StoryHost(content,JSON.parse(JSON.stringify(h.snapshot())));
 assert.equal(restored.getFact('school_garden_helped'),true);
 assert.equal(restored.open('single').canContinue,false);
 assert.equal(restored.open('arc').canContinue,false);
});
test('effect ID deduplication across saved state',()=>{
 let coins=0;const h=new StoryHost(content);
 assert.equal(h.applyOnce('arc:dinner:reward',()=>{coins+=100}),true);
 assert.equal(h.applyOnce('arc:dinner:reward',()=>{coins+=100}),false);
 const restored=new StoryHost(content,h.snapshot());
 assert.equal(restored.applyOnce('arc:dinner:reward',()=>{coins+=100}),false);
 assert.equal(coins,100);
});
test('invalid save and unknown story rejected',()=>{
 assert.throws(()=>new StoryHost(content,{version:99}),/Invalid/);
 assert.throws(()=>new StoryHost(content,{version:1,facts:{},appliedEffects:[],stories:{missing:'{}'}}),/Incompatible/);
 assert.throws(()=>new StoryHost(content).open('missing'),/Unknown/);
});
