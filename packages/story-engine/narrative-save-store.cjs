'use strict';
const FORMAT=1;
class NarrativeSaveStore{
 constructor({storage,key}){
  if(!storage||typeof storage.getItem!=='function'||typeof storage.setItem!=='function'||typeof key!=='string'||!key.trim())throw Error('Invalid save store');
  this.storage=storage;this.key=key;
 }
 encode(data){return JSON.stringify({format:FORMAT,data})}
 decode(raw){
  if(typeof raw!=='string')throw Error('Missing save');
  const parsed=JSON.parse(raw);
  if(!parsed||parsed.format!==FORMAT||!parsed.data||typeof parsed.data!=='object')throw Error('Unsupported save format');
  return parsed.data;
 }
 read(){
  const raw=this.storage.getItem(this.key);
  if(raw===null)return null;
  return this.decode(raw);
 }
 write(data,validate){
  if(typeof validate!=='function')throw Error('Save validator required');
  validate(data);
  const encoded=this.encode(data);
  this.decode(encoded);
  const prior=this.storage.getItem(this.key);
  // The active key is replaced by a single storage write. Do not split game and story across keys.
  this.storage.setItem(this.key,encoded);
  return {saved:true,hadPrevious:prior!==null};
 }
 restoreInto(game){
  if(!game||typeof game.restore!=='function')throw Error('Restore target required');
  const candidate=this.read();
  if(candidate===null)return false;
  game.restore(candidate);
  return true;
 }
 export(){const raw=this.storage.getItem(this.key);return raw===null?null:this.decode(raw)}
}
module.exports={NarrativeSaveStore};
