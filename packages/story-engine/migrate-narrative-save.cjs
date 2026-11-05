'use strict';
function migrateNarrativeSave(saved,{fromVersion,toVersion,transform,validate}){
 if(!saved||!saved.narrative||!saved.narrative.registry||typeof transform!=='function'||typeof validate!=='function')throw Error('Invalid migration request');
 const versions=Object.values(saved.narrative.registry.stories||{}).map(s=>s.contentVersion);
 if(!versions.length||versions.some(v=>v!==fromVersion)||fromVersion===toVersion)throw Error('Unsupported source version');
 const copy=structuredClone(saved);
 const result=transform(copy);
 if(!result||!result.narrative||!result.narrative.registry)throw Error('Invalid migrated save');
 const updated=Object.values(result.narrative.registry.stories||{});
 if(updated.length!==versions.length||updated.some(s=>s.contentVersion!==toVersion))throw Error('Migration did not update all versions');
 validate(result);
 return result;
}
module.exports={migrateNarrativeSave};
