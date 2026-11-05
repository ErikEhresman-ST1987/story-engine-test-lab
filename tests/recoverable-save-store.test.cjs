'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {RecoverableNarrativeStore}=require('../packages/story-engine/recoverable-save-store.cjs');
const memory=()=>{const map=new Map();return {getItem:k=>map.has(k)?map.get(k):null,setItem:(k,v)=>map.set(k,v),map}};
const validate=d=>{if(!d||!Number.isInteger(d.count)||d.count<0)throw Error('Invalid game snapshot')};
test('previous valid snapshot is retained and recovered explicitly',()=>{
 const storage=memory(),store=new RecoverableNarrativeStore({storage,key:'lab'});
 store.write({count:1},validate);store.write({count:2},validate);
 assert.deepEqual(store.read(),{count:2});
 assert.deepEqual(store.recover(validate),{count:1});
 const target={state:null,restore(s){this.state=s}};
 assert.equal(store.restoreBackupInto(target,validate),true);
 assert.deepEqual(target.state,{count:1});
 assert.deepEqual(store.read(),{count:2});
});
test('invalid active save cannot replace valid backup',()=>{
 const storage=memory(),store=new RecoverableNarrativeStore({storage,key:'lab'});
 store.write({count:1},validate);store.write({count:2},validate);
 const backup=storage.getItem('lab:backup');
 storage.setItem('lab','corrupt');
 assert.throws(()=>store.write({count:3},validate));
 assert.equal(storage.getItem('lab:backup'),backup);
 assert.deepEqual(store.recover(validate),{count:1});
});
test('failed backup write leaves current save unchanged',()=>{
 const storage=memory(),store=new RecoverableNarrativeStore({storage,key:'lab'});
 store.write({count:1},validate);
 const broken={getItem:storage.getItem,setItem:(k,v)=>{if(k==='lab:backup')throw Error('Storage unavailable');storage.setItem(k,v)}};
 const blocked=new RecoverableNarrativeStore({storage:broken,key:'lab'});
 assert.throws(()=>blocked.write({count:2},validate),/Storage unavailable/);
 assert.deepEqual(store.read(),{count:1});
});
