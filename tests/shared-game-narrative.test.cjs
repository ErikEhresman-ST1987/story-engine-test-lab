'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {compilePackage}=require('../packages/story-engine/compile-package.cjs');
const {SharedGameNarrative}=require('../packages/story-engine/shared-game-narrative.cjs');
const dir=path.join(__dirname,'../fixtures/three-chapter');
const base=JSON.parse(fs.readFileSync(path.join(dir,'manifest.json'),'utf8'));
const files=Object.fromEntries(base.chapters.map(c=>[c.inkFile,fs.readFileSync(path.join(dir,c.inkFile),'utf8')]));
const packages=['alpha','beta'].map(id=>{const manifest={...base,storyId:id};return {manifest,compiledChapters:compilePackage(manifest,files).chapters}});
class Game{
 constructor(){this.resources=0;this.receipts=[]}
 snapshot(){return {resources:this.resources,receipts:[...this.receipts]}}
 restore(s){if(!s||!Number.isInteger(s.resources)||s.resources<0||!Array.isArray(s.receipts))throw Error('Invalid game state');this.resources=s.resources;this.receipts=[...s.receipts]}
 event(name){
  if(name==='harvest.carrot'){this.resources++;return {changed:true,completed:false}}
  if(name==='deliver.dinner'&&this.resources>=2){this.resources-=2;this.receipts.push('delivery:'+this.receipts.length);return {changed:true,completed:true}}
  return {changed:false,completed:false}
 }
}
const make=save=>new SharedGameNarrative({packages,createGame:()=>new Game(),save});
test('two stories spend the same shared inventory and restore as one snapshot',()=>{
 const g=make();g.decide('alpha','accept');g.decide('beta','accept');
 g.event('alpha','harvest.carrot');g.event('beta','harvest.carrot');
 assert.equal(g.snapshot().game.resources,2);
 assert.equal(g.event('alpha','deliver.dinner').completed,true);
 assert.equal(g.snapshot().game.resources,0);
 assert.equal(g.event('beta','deliver.dinner').changed,false);
 const saved=g.snapshot(),reloaded=make(saved);
 assert.deepEqual(reloaded.snapshot(),saved);
 assert.equal(reloaded.view('alpha').chapter,'chapter-1');
 assert.equal(reloaded.view('beta').chapter,'chapter-1');
 assert.throws(()=>reloaded.nextChapter('beta'),/not ready/);
});
test('invalid narrative snapshot does not overwrite running game',()=>{
 const g=make();g.decide('alpha','accept');g.event('alpha','harvest.carrot');
 const before=g.snapshot(),bad=structuredClone(before);
 bad.narrative.registry.stories.beta.contentVersion='wrong';
 assert.throws(()=>g.restore(bad));
 assert.deepEqual(g.snapshot(),before);
});
