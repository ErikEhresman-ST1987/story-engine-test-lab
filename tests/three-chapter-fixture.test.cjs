'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {Story}=require('inkjs');
const {compilePackage}=require('../packages/story-engine/compile-package.cjs');
const {validateHostContract,dispatchHostEvent}=require('../packages/story-engine/host-contract.cjs');
const {GameplayBridge}=require('../src/gameplay-bridge.cjs');
const dir=path.join(__dirname,'../fixtures/three-chapter');
const manifest=JSON.parse(fs.readFileSync(path.join(dir,'manifest.json'),'utf8'));
const files=Object.fromEntries(manifest.chapters.map(c=>[c.inkFile,fs.readFileSync(path.join(dir,c.inkFile),'utf8')]));
test('three sample chapters compile, offer two paths each and preserve their states',()=>{
 const compiled=compilePackage(manifest,files);
 assert.equal(Object.keys(compiled.chapters).length,3);
 for(const c of manifest.chapters){
  const chapter=compiled.chapters[c.id];
  assert.equal(chapter.pathReport.endings,2);
  assert.equal(chapter.pathReport.choices,2);
  const s=new Story(chapter.compiled);s.ChoosePathString(chapter.entry);
  assert.match(s.Continue(),/sample-only/);
  const saved=s.state.ToJson();
  const restored=new Story(chapter.compiled);restored.state.LoadJson(saved);
  assert.equal(restored.currentChoices.length,2);
  restored.ChooseChoiceIndex(1);assert.match(restored.Continue(),/pauses/);
  const finished=new Story(chapter.compiled);finished.ChoosePathString(chapter.completion);
  assert.match(finished.Continue(),/marked complete/);
 }
});
test('three-chapter fixture requires host-confirmed delivery and one receipt',()=>{
 const bridge=new GameplayBridge();
 const host={events:manifest.events,effects:manifest.effects,handleEvent:n=>bridge.event(n)};
 assert.equal(validateHostContract(manifest,host),true);
 bridge.accept();
 assert.equal(dispatchHostEvent(host,'deliver.dinner').changed,false);
 for(const e of ['harvest.carrot','harvest.carrot','harvest.wheat'])dispatchHostEvent(host,e);
 const before=bridge.snapshot(),reloaded=new GameplayBridge(before);
 const host2={...host,handleEvent:n=>reloaded.event(n)};
 assert.equal(dispatchHostEvent(host2,'deliver.dinner').changed,true);
 const done=reloaded.snapshot();assert.equal(done.receipts.length,1);
 const again=new GameplayBridge(done);
 assert.equal(again.event('deliver.dinner').changed,false);
 assert.equal(again.snapshot().receipts.length,1);
});
test('missing or malformed chapter prevents package acceptance',()=>{
 const missing={...files};delete missing['chapter-2.ink'];
 assert.throws(()=>compilePackage(manifest,missing),/Missing Ink source/);
});
