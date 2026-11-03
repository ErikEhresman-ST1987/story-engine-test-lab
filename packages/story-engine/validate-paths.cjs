'use strict';
const {Story}=require('inkjs');
function validatePaths(compiled,{entry,maxStates=500,maxSteps=1000}={}){
 if(typeof entry!=='string'||!entry.trim())throw Error('Entry checkpoint required');
 const root=new Story(compiled);
 try{root.ChoosePathString(entry)}catch(e){throw Error('Invalid entry checkpoint: '+e.message)}
 const queue=[{ink:root.state.ToJson(),path:[]}],seen=new Set();
 let endings=0,choices=0,steps=0;
 while(queue.length){
  if(++steps>maxSteps||seen.size>maxStates)throw Error('Story traversal limit exceeded; review loops manually');
  const node=queue.shift(),s=new Story(compiled);s.state.LoadJson(node.ink);
  while(s.canContinue){
   s.Continue();
   if(++steps>maxSteps)throw Error('Story traversal limit exceeded; review loops manually');
  }
  const signature=s.state.ToJson();
  if(seen.has(signature))continue;
  seen.add(signature);
  const options=s.currentChoices;
  if(!options.length){endings++;continue}
  for(let i=0;i<options.length;i++){
   const branch=new Story(compiled);branch.state.LoadJson(signature);
   branch.ChooseChoiceIndex(i);choices++;
   queue.push({ink:branch.state.ToJson(),path:[...node.path,i]});
  }
 }
 return {states:seen.size,choices,endings};
}
module.exports={validatePaths};
