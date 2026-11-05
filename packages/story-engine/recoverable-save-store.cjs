'use strict';
const {NarrativeSaveStore}=require('./narrative-save-store.cjs');
class RecoverableNarrativeStore extends NarrativeSaveStore{
 constructor(options){super(options);this.backupKey=this.key+':backup'}
 write(data,validate){
  if(typeof validate!=='function')throw Error('Save validator required');
  validate(data);
  const encoded=this.encode(data);this.decode(encoded);
  const current=this.storage.getItem(this.key);
  if(current!==null){
   // Never promote corrupt current data into the backup slot.
   const decoded=this.decode(current);validate(decoded);
   this.storage.setItem(this.backupKey,current);
  }
  this.storage.setItem(this.key,encoded);
  return {saved:true,backupAvailable:current!==null};
 }
 recover(validate){
  if(typeof validate!=='function')throw Error('Recovery validator required');
  const raw=this.storage.getItem(this.backupKey);
  if(raw===null)return null;
  const data=this.decode(raw);validate(data);
  return data;
 }
 restoreBackupInto(target,validate){
  if(!target||typeof target.restore!=='function')throw Error('Restore target required');
  const data=this.recover(validate);
  if(data===null)return false;
  target.restore(data);
  return true;
 }
}
module.exports={RecoverableNarrativeStore};
