'use strict';
const {Compiler,Story}=require('inkjs/full');
const {validateManifest}=require('./validate-manifest.cjs');
const {validatePaths}=require('./validate-paths.cjs');
const {validateHostContract}=require('./host-contract.cjs');
function compilePackage(manifest,files,hostContract){
 validateManifest(manifest);
 if(hostContract)validateHostContract(manifest,hostContract);
 if(!files||typeof files!=='object')throw Error('Ink source files required');
 const chapters={};
 for(const chapter of manifest.chapters){
  const source=files[chapter.inkFile];
  if(typeof source!=='string'||!source.trim())throw Error('Missing Ink source: '+chapter.inkFile);
  let compiled;
  try{compiled=new Compiler(source).Compile().ToJson()}catch(e){throw Error('Ink compile failed for '+chapter.id+': '+e.message)}
  let story;
  try{
   story=new Story(compiled);
   story.ChoosePathString(chapter.entry);
   while(story.canContinue)story.Continue();
   // A completion checkpoint must exist and be runnable independently.
   const finish=new Story(compiled);finish.ChoosePathString(chapter.completion);
   while(finish.canContinue)finish.Continue();
  }catch(e){throw Error('Invalid Ink checkpoint in '+chapter.id+': '+e.message)}
  const pathReport=validatePaths(compiled,{entry:chapter.entry});
  chapters[chapter.id]={compiled,entry:chapter.entry,completion:chapter.completion,pathReport};
 }
 return {storyId:manifest.storyId,contentVersion:manifest.contentVersion,sourceApproval:manifest.sourceApproval,chapters};
}
module.exports={compilePackage};
