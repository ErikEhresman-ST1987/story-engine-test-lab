'use strict';
const {Story}=require('inkjs');
const {validateManifest}=require('./validate-manifest.cjs');
const VERSION=1;
class ChapterSession{
 constructor({manifest,compiledChapters,host,save}){
  validateManifest(manifest);
  if(!compiledChapters||!host||typeof host.snapshot!=='function'||typeof host.restore!=='function'||typeof host.event!=='function')throw Error('Missing chapter session dependencies');
  this.manifest=manifest;this.compiledChapters=compiledChapters;this.host=host;
  this.index=0;this.completed=false;this.chapterReady=false;this.lines=[];this.story=this.newStory(0);
  if(save)this.restore(save);else this.advance();
 }
 newStory(i){
  const c=this.manifest.chapters[i],compiled=this.compiledChapters[c.id];
  if(!compiled)throw Error('Missing compiled chapter '+c.id);
  const s=new Story(compiled.compiled||compiled);s.ChoosePathString(c.entry);return s;
 }
 advance(){const lines=[];while(this.story.canContinue)lines.push(this.story.Continue().trim());this.lines=lines.filter(Boolean);return this.view()}
 view(){return {chapter:this.manifest.chapters[this.index].id,completed:this.completed,lines:[...this.lines],choices:this.story.currentChoices.map((c,index)=>({index,text:c.text}))}}
 choose(index){if(this.completed||!Number.isInteger(index)||index<0||index>=this.story.currentChoices.length)throw Error('Invalid chapter choice');this.story.ChooseChoiceIndex(index);return this.advance()}
 event(name){
  if(this.completed)return {changed:false,reason:'Story complete'};
  if(!this.manifest.events.includes(name))throw Error('Event not declared in manifest');
  const result=this.host.event(name);
  if(!result||typeof result.changed!=='boolean')throw Error('Invalid host result');
  return result;
 }
 completeChapter(confirmation){
  if(this.completed||this.chapterReady)return false;
  if(!confirmation||confirmation.completed!==true||confirmation.changed!==true)throw Error('Host confirmation required');
  const c=this.manifest.chapters[this.index],candidate=new Story(this.compiledChapters[c.id].compiled||this.compiledChapters[c.id]);
  candidate.ChoosePathString(c.completion);
  const final=[];while(candidate.canContinue)final.push(candidate.Continue().trim());
  this.story=candidate;this.lines=final.filter(Boolean);this.chapterReady=true;
  if(this.index===this.manifest.chapters.length-1)this.completed=true;
  return true;
 }
 nextChapter(){
  if(this.completed||!this.chapterReady)throw Error('Chapter not ready to advance');
  if(this.index>=this.manifest.chapters.length-1)throw Error('No next chapter');
  this.index++;this.chapterReady=false;this.story=this.newStory(this.index);this.advance();return this.view();
 }
 snapshot(){return {schema:VERSION,storyId:this.manifest.storyId,contentVersion:this.manifest.contentVersion,index:this.index,completed:this.completed,chapterReady:this.chapterReady,ink:this.story.state.ToJson(),lines:[...this.lines],game:this.host.snapshot()}}
 restore(saved){
  if(!saved||saved.schema!==VERSION||saved.storyId!==this.manifest.storyId||saved.contentVersion!==this.manifest.contentVersion||!Number.isInteger(saved.index)||saved.index<0||saved.index>=this.manifest.chapters.length||typeof saved.ink!=='string'||typeof saved.completed!=='boolean'||typeof saved.chapterReady!=='boolean'||(saved.completed&&!saved.chapterReady)||(saved.completed&&saved.index!==this.manifest.chapters.length-1)||!Array.isArray(saved.lines)||saved.lines.some(x=>typeof x!=='string'))throw Error('Invalid chapter save');
  const candidate=this.newStory(saved.index);candidate.state.LoadJson(saved.ink);
  const old=this.host.snapshot();
  try{this.host.restore(saved.game,saved.completed?'completed':'active')}catch(e){try{this.host.restore(old,'active')}catch{}throw e}
  this.index=saved.index;this.completed=saved.completed;this.chapterReady=saved.chapterReady;this.story=candidate;this.lines=[...saved.lines];
 }
}
module.exports={ChapterSession};
