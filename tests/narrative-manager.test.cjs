'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {compilePackage}=require('../packages/story-engine/compile-package.cjs');
const {NarrativeManager}=require('../packages/story-engine/narrative-manager.cjs');
const dir=path.join(__dirname,'../fixtures/three-chapter');
const base=JSON.parse(fs.readFileSync(path.join(dir,'manifest.json'),'utf8'));
const files=Object.fromEntries(base.chapters.map(c=>[c.inkFile,fs.readFileSync(path.join(dir,c.inkFile),'utf8')]));
const packages=['alpha','beta'].map((id,i)=>{const manifest={...base,storyId:id,requiresFacts:i?['alpha_completed']:[]};return {manifest,compiledChapters:compilePackage(manifest,files).chapters}});
class Host{constructor(){this.count=0}snapshot(){return {count:this.count}}restore(s){if(!s||!Number.isInteger(s.count))throw Error('Bad save');this.count=s.count}event(){this.count++;return {changed:true,completed:true}}}
const make=save=>new NarrativeManager({packages,hostFactory:()=>new Host(),save});
test('invitation lifecycle and completion unlock dependent story',()=>{
 const m=make();
 assert.equal(m.view('alpha').invitation,'available');
 assert.equal(m.view('beta').invitation,'hidden');
 assert.throws(()=>m.choose('beta',0),/not active/);
 m.decide('alpha','later');assert.equal(m.view('alpha').invitation,'deferred');
 m.decide('alpha','decline');m.revisit('alpha');m.decide('alpha','accept');
 for(let i=0;i<3;i++){m.choose('alpha',0);m.event('alpha','harvest.carrot');if(i<2)m.nextChapter('alpha')}
 assert.equal(m.view('alpha').invitation,'completed');
 assert.equal(m.view('beta').invitation,'available');
 const saved=m.snapshot(),reloaded=make(saved);
 assert.deepEqual(reloaded.snapshot(),saved);
 reloaded.decide('beta','accept');assert.equal(reloaded.view('beta').invitation,'active');
});
test('invalid save cannot replace live state',()=>{
 const m=make();const before=m.snapshot(),bad=structuredClone(before);
 bad.invitations.alpha='completed';
 assert.throws(()=>m.restore(bad),/Inconsistent/);
 assert.deepEqual(m.snapshot(),before);
});
