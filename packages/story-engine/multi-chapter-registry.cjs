'use strict';
const {ChapterSession}=require('./chapter-session.cjs');
const SCHEMA=1;
class MultiChapterRegistry{
 constructor({packages,hostFactory,save}){
  if(!Array.isArray(packages)||!packages.length||typeof hostFactory!=='function')throw Error('Invalid registry setup');
  this.packages=new Map();this.sessions=new Map();
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
   const original=this.get(id);
   const host=original.host;
   const previous=host.snapshot();
   // Validate Ink and host save in a temporary host before committing any live state.
   const shadow={snapshot:()=>structuredClone(previous),restore:(value,phase)=>host.restore(value,phase),event:()=>{throw Error('Validation host cannot play')}};
   try{
    const candidate=new ChapterSession({...pkg,host:shadow,save:saved.stories[id]});
    candidates.set(id,candidate);
   }finally{host.restore(previous,'active')}
  }
  // Restore each original session only after all candidate saves validate.
  for(const [id,snapshot] of Object.entries(saved.stories))this.get(id).restore(snapshot);
 }
}
module.exports={MultiChapterRegistry};
