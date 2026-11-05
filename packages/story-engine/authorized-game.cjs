'use strict';
class AuthorizedGame{
 constructor({game,policies}){
  if(!game||typeof game.event!=='function'||typeof game.snapshot!=='function'||!policies||typeof policies!=='object')throw Error('Missing authorization dependencies');
  this.game=game;this.policies=policies;
 }
 snapshot(){return this.game.snapshot()}
 restore(s){return this.game.restore(s)}
 event(name,context){
  if(!context||typeof context.storyId!=='string'||typeof context.chapterId!=='string')return {changed:false,completed:false,reason:'Missing story context'};
  const policy=this.policies[name];
  if(typeof policy!=='function'||policy(context,this.game.snapshot())!==true)return {changed:false,completed:false,reason:'Event not authorized'};
  return this.game.event(name,context);
 }
}
module.exports={AuthorizedGame};
