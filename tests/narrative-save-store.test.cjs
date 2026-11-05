'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {compilePackage}=require('../packages/story-engine/compile-package.cjs');
const {SharedGameNarrative}=require('../packages/story-engine/shared-game-narrative.cjs');
const {NarrativeSaveStore}=require('../packages/story-engine/narrative-save-store.cjs');
const dir=path.join(__dirname,'../fixtures/three-chapter');
const manifest=JSON.parse(fs.readFileSync(path.join(dir,'manifest.json'),'utf8'));
const files=Object.fromEntries(manifest.chapters.map(c=>[c.inkFile,fs.readFileSync(path.join(dir,c.inkFile),'utf8')]));
const packages=[{manifest,compiledChapters:compilePackage(manifest,files).chapters}];
class Game{
 constructor(){this.count=0}
 snapshot(){return {count:this.count}}
 restore(s){if(!s||!Number.isInteger(s.count)||s.count<0)throw Error('Invalid game state');this.count=s.count}
 event(){this.count++;return {changed:true,completed:true}}
}
const create=save=>new SharedGameNarrative({packages,createGame:()=>new Game(),save});
function memory(){const data=new Map();return {getItem:k=>data.has(k)?data.get(k):null,setItem:(k,v)=>data.set(k,v),data}}
test('single-key save reloads game and narrative together',()=>{
 const storage=memory(),store=new NarrativeSaveStore({storage,key:'isolated-story-save'});
 const g=create();g.decide(manifest.storyId,'accept');g.choose(manifest.storyId,0);g.event(manifest.storyId,'harvest.carrot');
 store.write(g.snapshot(),candidate=>create(candidate));
 assert.equal(storage.data.size,1);
 const reload=create();assert.equal(store.restoreInto(reload),true);
 assert.deepEqual(reload.snapshot(),g.snapshot());
});
test('failed validation and failed storage write preserve prior save',()=>{
 const storage=memory(),store=new NarrativeSaveStore({storage,key:'isolated-story-save'});
 const g=create();store.write(g.snapshot(),candidate=>create(candidate));
 const before=storage.getItem('isolated-story-save');
 assert.throws(()=>store.write({broken:true},candidate=>create(candidate)));
 assert.equal(storage.getItem('isolated-story-save'),before);
 const failed={getItem:storage.getItem,setItem:()=>{throw Error('Storage unavailable')}};
 const blocked=new NarrativeSaveStore({storage:failed,key:'isolated-story-save'});
 assert.throws(()=>blocked.write(g.snapshot(),candidate=>create(candidate)),/Storage unavailable/);
 assert.equal(storage.getItem('isolated-story-save'),before);
});
test('unknown format and malformed save are rejected without replacing runtime',()=>{
 const storage=memory(),store=new NarrativeSaveStore({storage,key:'isolated-story-save'});
 const g=create(),before=g.snapshot();
 storage.setItem('isolated-story-save',JSON.stringify({format:999,data:before}));
 assert.throws(()=>store.restoreInto(g),/Unsupported save format/);
 assert.deepEqual(g.snapshot(),before);
 storage.setItem('isolated-story-save','not json');
 assert.throws(()=>store.restoreInto(g));
 assert.deepEqual(g.snapshot(),before);
});
