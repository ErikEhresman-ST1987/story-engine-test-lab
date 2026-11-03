'use strict';
const {Story}=require('inkjs');
const VERSION=1;
class StoryCoordinator{
 constructor({compiled,adapter,storyId,save,completionPath='delivered'}){
  if(!compiled||!adapter||!storyId)throw Error('Missing coordinator dependency');
  if(typeof completionPath!=='string'||!completionPath.trim())throw Error('Invalid completion path');
  this.completionPath=completionPath;this.compiled=compiled;this.adapter=adapter;this.storyId=storyId;this.story=new Story(compiled);
  this.phase='invitation';this.lastLines=[];
  if(save)this.restore(save);
 }
 advance(){
  const lines=[];while(this.story.canContinue)lines.push(this.story.Continue().trim());
  this.lastLines=lines.filter(Boolean);
  return this.view();
 }
 view(){return {phase:this.phase,lines:[...this.lastLines],choices:this.story.currentChoices.map((c,index)=>({index,text:c.text})),game:this.adapter.snapshot()}}
 choose(index){
  if(this.phase!=='invitation')throw Error('Invitation already resolved');
  if(!Number.isInteger(index)||index<0||index>=this.story.currentChoices.length)throw Error('Invalid choice');
  const decision=this.adapter.decision(index);
  if(!['accept','decline'].includes(decision))throw Error('Unsupported decision');
  this.story.ChooseChoiceIndex(index);
  if(decision==='accept'){this.adapter.accept();this.phase='active'}else this.phase='declined';
  return this.advance();
 }
 event(name){
  if(this.phase!=='active')return {changed:false,reason:'No active objective'};
  const result=this.adapter.event(name);
  if(result.completed){
   if(!result.changed)throw Error('Completion must change host state');
   this.story.ChoosePathString(this.completionPath);
   this.phase='completed';result.story=this.advance();
  }
  return result;
 }
 snapshot(){return {version:VERSION,storyId:this.storyId,phase:this.phase,ink:this.story.state.ToJson(),game:this.adapter.snapshot(),lastLines:[...this.lastLines]}}
 restore(saved){
  if(!saved||saved.version!==VERSION||saved.storyId!==this.storyId||!['invitation','active','declined','completed'].includes(saved.phase)||typeof saved.ink!=='string'||!Array.isArray(saved.lastLines)||saved.lastLines.some(x=>typeof x!=='string'))throw Error('Invalid coordinator save');
  const candidate=new Story(this.compiled);candidate.state.LoadJson(saved.ink);
  this.adapter.restore(saved.game,saved.phase);
  this.story=candidate;this.phase=saved.phase;this.lastLines=[...saved.lastLines];
 }
}
module.exports={StoryCoordinator};
