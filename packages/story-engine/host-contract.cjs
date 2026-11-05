'use strict';
function validateHostContract(manifest,host){
 if(!host||!Array.isArray(host.events)||!Array.isArray(host.effects)||typeof host.handleEvent!=='function')throw Error('Invalid host contract');
 for(const key of ['events','effects']){
  const allowed=new Set(host[key]);
  if(allowed.size!==host[key].length)throw Error('Duplicate host '+key);
  for(const name of manifest[key])if(!allowed.has(name))throw Error('Unsupported host '+key+': '+name);
 }
 return true;
}
function dispatchHostEvent(host,name){
 if(!host||!Array.isArray(host.events)||!host.events.includes(name)||typeof host.handleEvent!=='function')throw Error('Unsupported gameplay event');
 const result=host.handleEvent(name);
 if(!result||typeof result.changed!=='boolean')throw Error('Invalid host event result');
 return {changed:result.changed,completed:result.completed===true,reason:result.reason||null};
}
module.exports={validateHostContract,dispatchHostEvent};
