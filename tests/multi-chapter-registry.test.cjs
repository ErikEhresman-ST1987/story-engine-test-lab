'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {compilePackage}=require('../packages/story-engine/compile-package.cjs');
const {MultiChapterRegistry}=require('../packages/story-engine/multi-chapter-registry.cjs');
const dir=path.join(__dirname,'../fixtures/three-chapter');
const base=JSON.parse(fs.readFileSync(path.join(dir,'manifest.json'),'utf8'));
const files=Object.fromEntries(base.chapters.map(c=>[c.inkFile,fs.readFileSync(path.join(dir,c.inkFile),'utf8')]));
const packages=['alpha','beta'].map(id=>{const manifest={...base,storyId:id};return {manifest,compiledChapters:compilePackage(manifest,files).chapters}});
class Host{
 constructor(){this.state={count:0}}
 snapshot(){return structuredClone(this.state)}
 restore(s){if(!s||!Number.isInteger(s.count)||s.count<0)throw Error('Invalid host save');this.state=structuredClone(s)}
 event(){this.state.count++;return {changed:true,completed:true}}
}
const make=save=>new MultiChapterRegistry({packages,hostFactory:()=>new Host(),save});
test('two independent chapter stories persist in one envelope',()=>{
 const registry=make();
 registry.choose('alpha',0);registry.event('alpha','harvest.carrot');
 registry.nextChapter('alpha');registry.choose('alpha',1);
 assert.equal(registry.view('alpha').chapter,'chapter-2');
 assert.equal(registry.view('beta').chapter,'chapter-1');
 const saved=registry.snapshot(),reloaded=make(saved);
 assert.deepEqual(reloaded.snapshot(),saved);
 assert.equal(reloaded.view('beta').completed,false);
 assert.equal(reloaded.view('alpha').chapter,'chapter-2');
});
test('invalid second story save does not alter first story',()=>{
 const registry=make();registry.choose('alpha',0);registry.event('alpha','harvest.carrot');
 const before=registry.snapshot(),bad=structuredClone(before);
 bad.stories.beta.contentVersion='unsupported';
 assert.throws(()=>registry.restore(bad),/Invalid chapter save/);
 assert.deepEqual(registry.snapshot(),before);
});
