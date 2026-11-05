'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {compilePackage}=require('../packages/story-engine/compile-package.cjs');
const {ChapterSession}=require('../packages/story-engine/chapter-session.cjs');
const dir=path.join(__dirname,'../fixtures/three-chapter');
const manifest=JSON.parse(fs.readFileSync(path.join(dir,'manifest.json'),'utf8'));
const files=Object.fromEntries(manifest.chapters.map(c=>[c.inkFile,fs.readFileSync(path.join(dir,c.inkFile),'utf8')]));
const chapters=compilePackage(manifest,files).chapters;
class Host{constructor(){this.state={done:false}}snapshot(){return structuredClone(this.state)}restore(s){this.state=structuredClone(s)}event(){return {changed:false,completed:false}}}
test('unconfirmed gameplay cannot complete or advance chapters',()=>{
 const session=new ChapterSession({manifest,compiledChapters:chapters,host:new Host()});
 assert.equal(typeof session.completeChapter,'undefined');
 assert.equal(session.event('deliver.dinner').changed,false);
 assert.equal(session.chapterReady,false);
 assert.throws(()=>session.nextChapter(),/not ready/);
 const restored=new ChapterSession({manifest,compiledChapters:chapters,host:new Host(),save:session.snapshot()});
 assert.equal(restored.chapterReady,false);
});
