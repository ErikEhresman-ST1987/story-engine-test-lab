'use strict';
const {NarrativeManager}=require('./narrative-manager.cjs');
const SCHEMA=1;
class SharedGameNarrative{
 constructor({packages,createGame,save}){
  if(typeof createGame!=='function')throw Error('Game factory required');
  this.packages=packages;this.createGame=createGame;
  this.game=createGame();
  this.manager=this.makeManager();
  if(save)this.restore(save);
 }
 makeManager(){
  const game=this.game;
  return new NarrativeManager({packages:this.packages,hostFactory:()=>({
   snapshot:()=>({shared:true}),
   restore:()=>{},
   event:name=>game.event(name)
  })});
 }
 view(id){return this.manager.view(id)}
 decide(id,decision){return this.manager.decide(id,decision)}
 revisit(id){return this.manager.revisit(id)}
 choose(id,index){return this.manager.choose(id,index)}
 nextChapter(id){return this.manager.nextChapter(id)}
 fact(name,value){return this.manager.fact(name,value)}
 event(id,name){return this.manager.event(id,name)}
 snapshot(){return {schema:SCHEMA,game:this.game.snapshot(),narrative:this.manager.snapshot()}}
 restore(saved){
  if(!saved||saved.schema!==SCHEMA)throw Error('Invalid shared game save');
  const game=this.createGame();
  game.restore(saved.game);
  const manager=new NarrativeManager({packages:this.packages,hostFactory:()=>({
   snapshot:()=>({shared:true}),restore:s=>{if(!s||s.shared!==true)throw Error('Invalid shared host marker')},
   event:name=>game.event(name)
  }),save:saved.narrative});
  this.game=game;this.manager=manager;
 }
}
module.exports={SharedGameNarrative};
