'use strict';
const {Story}=require('inkjs');
const {GameplayBridge}=require('./gameplay-bridge.cjs');
const VERSION=1;
class IntegratedCycle{
 constructor(compiled,saved){
  this.compiled=compiled;
  this.story=new Story(compiled);
  this.game=new GameplayBridge();
  this.phase='invitation';
  if(saved)this.restore(saved);
 }
 advance(){
  const lines=[];
  while(this.story.canContinue)lines.push(this.story.Continue().trim());
  return {lines:lines.filter(Boolean),choices:this.story.currentChoices.map((c,index)=>({index,text:c.text})),phase:this.phase};
 }
 choose(index){
  if(this.phase!=='invitation')throw Error('Invitation already resolved');
  const choices=this.story.currentChoices;
  if(!Number.isInteger(index)||index<0||index>=choices.length)throw Error('Invalid choice');
  const accepted=choices[index].text.includes('Volunteer');
  this.story.ChooseChoiceIndex(index);
  if(accepted){this.game.accept();this.phase='collecting'}
  else this.phase='declined';
  return this.advance();
 }
 event(name){
  if(this.phase!=='collecting')return {changed:false,reason:'No active ingredient objective'};
  const result=this.game.event(name);
  if(name==='deliver.dinner'&&result.changed){
   // The host, not the Ink runtime, owns inventory and the delivery receipt.
   this.story.ChoosePathString('delivered');
   this.phase='completed';
   result.story=this.advance();
  }
  return result;
 }
 snapshot(){return {version:VERSION,phase:this.phase,game:this.game.snapshot(),ink:this.story.state.ToJson()}}
 restore(saved){
  if(!saved||saved.version!==VERSION||!['invitation','collecting','declined','completed'].includes(saved.phase)||typeof saved.ink!=='string')throw Error('Invalid integrated save');
  const game=new GameplayBridge(saved.game);
  if((saved.phase==='collecting')!==Boolean(game.snapshot().dinner.accepted&&!game.snapshot().dinner.completed)) {
   if(saved.phase==='collecting')throw Error('Inconsistent objective');
  }
  if(saved.phase==='completed'&&(!game.snapshot().dinner.completed||game.snapshot().receipts.length!==1))throw Error('Inconsistent completion');
  const story=new Story(this.compiled);story.state.LoadJson(saved.ink);
  this.story=story;this.game=game;this.phase=saved.phase;
 }
}
module.exports={IntegratedCycle};
