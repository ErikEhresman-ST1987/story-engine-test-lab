'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {compilePackage}=require('../packages/story-engine/compile-package.cjs');
const {ChapterSession}=require('../packages/story-engine/chapter-session.cjs');
const dir=path.join(__dirname,'../fixtures/three-chapter');
const manifest=JSON.parse(fs.readFileSync(path.join(dir,'manifest.json'),'utf8'));
const files=Object.fromEntries(manifest.chapters.map(c=>[c.inkFile,fs.readFileSync(path.join(dir,c.inkFile),'utf8')]));
const chapters=compilePackage(manifest,files).chapters;
class Host{constructor(){this.state={count:0}}snapshot(){return structuredClone(this.state)}restore(s){this.state=structuredClone(s)}event(){this.state.count++;return {changed:true,completed:true}}}
test('ordered chapters require checkpoint and restore after each chapter',()=>{
 let session=new ChapterSession({manifest,compiledChapters:chapters,host:new Host()});
 assert.throws(()=>session.nextChapter(),/not ready/);
 for(let i=0;i<3;i++){
  session.choose(0);assert.equal(session.event('harvest.carrot').completed,true);
  assert.equal(session.chapterReady,true);
  const saved=session.snapshot();
  session=new ChapterSession({manifest,compiledChapters:chapters,host:new Host(),save:saved});
  assert.deepEqual(session.snapshot(),saved);
  if(i<2)assert.equal(session.nextChapter().chapter,'chapter-'+(i+2));
 }
 assert.equal(session.view().completed,true);
 assert.equal(session.snapshot().game.count,3);
});
