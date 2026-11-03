'use strict';
const ID=/^[a-z][a-z0-9]*(?:[-_][a-z0-9]+)*$/;
function validateManifest(m){
 if(!m||m.schema!==1)throw Error('Unsupported story manifest schema');
 for(const key of ['storyId','contentVersion','sourceApproval'])if(typeof m[key]!=='string'||!m[key].trim())throw Error('Missing '+key);
 if(!ID.test(m.storyId))throw Error('Invalid storyId');
 if(!Array.isArray(m.chapters)||m.chapters.length===0)throw Error('Missing chapters');
 const seen=new Set();
 for(const c of m.chapters){
  if(!c||!ID.test(c.id||'')||seen.has(c.id))throw Error('Invalid or duplicate chapter ID');
  seen.add(c.id);
  for(const key of ['inkFile','entry','completion'])if(typeof c[key]!=='string'||!c[key].trim())throw Error('Missing chapter '+key);
  if(!c.inkFile.endsWith('.ink')||c.inkFile.includes('..')||c.inkFile.startsWith('/'))throw Error('Invalid inkFile');
 }
 for(const key of ['requiresFacts','events','effects']){
  if(!Array.isArray(m[key])||m[key].some(x=>typeof x!=='string'||!x.trim())||new Set(m[key]).size!==m[key].length)throw Error('Invalid '+key);
 }
 return true;
}
module.exports={validateManifest};
