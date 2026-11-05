'use strict';
const {ChapterSession}=require('./chapter-session.cjs');
const SCHEMA=1;
class MultiChapterRegistry{
 constructor({packages,hostFactory,save}){
  if(!Array.isArray(packages)||!packages.length||typeof hostFactory!=='function')throw Error('Invalid registry setup');
  this.hostFactory=hostFactory;this.packages=new Map();this.sessions=new Map();
  for(const pkg of packages){
   if(!pkg||!pkg.manifest||!pkg.compiledChapters||this.packages.has(pkg.manifest.storyId))throw Error('Duplicate or invalid story package');
   const id=pkg.manifest.storyId;
   this.packages.set(id,pkg);
   this.sessions.set(id,new ChapterSession({...pkg,host:hostFactory(id)}));
  }
  if(save)this.restore(save);
 }
 get(id){const s=this.sessions.get(id);if(!s)throw Error('Unknown story');return s}
 view(id){return this.get(id).view()}
 choose(id,index){return this.get(id).choose(index)}
 event(id,name){return this.get(id).event(name)}
 nextChapter(id){return this.get(id).nextChapter()}
 snapshot(){return {schema:SCHEMA,stories:Object.fromEntries([...this.sessions].map(([id,s])=>[id,s.snapshot()]))}}
 restore(saved){
  if(!saved||saved.schema!==SCHEMA||!saved.stories||Object.keys(saved.stories).length!==this.packages.size)throw Error('Invalid multi-chapter save');
  const candidates=new Map();
  for(const [id,pkg] of this.packages){
   if(!Object.hasOwn(saved.stories,id))throw Error('Missing story save');
   candidates.set(id,new ChapterSession({...pkg,host:this.hostFactory(id),save:saved.stories[id]}));
  }
  this.sessions=candidates;
 }
}
module.exports={MultiChapterRegistry};
