'use strict';
// Isolated adapter proof: the game owns inventory, the story owns eligibility and facts.
// One JSON record contains both the resources and the completion receipt.
const SAVE_VERSION=1;
const initial=()=>({version:SAVE_VERSION,inventory:{carrot:0,wheat:0},dinner:{accepted:false,completed:false},receipts:[],facts:{}});
function validate(value){
 if(!value||value.version!==SAVE_VERSION||!value.inventory||!value.dinner||!Array.isArray(value.receipts)||!value.facts)throw Error('Incompatible gameplay save');
 for(const item of ['carrot','wheat'])if(!Number.isSafeInteger(value.inventory[item])||value.inventory[item]<0)throw Error('Invalid inventory');
 if(typeof value.dinner.accepted!=='boolean'||typeof value.dinner.completed!=='boolean'||value.receipts.some(x=>typeof x!=='string'))throw Error('Invalid progress');
 return value;
}
class GameplayBridge {
 constructor(saved){this.state=saved?structuredClone(validate(saved)):initial()}
 snapshot(){return structuredClone(this.state)}
 accept(){if(this.state.dinner.completed)return false;this.state.dinner.accepted=true;return true}
 event(name){
  if(name==='harvest.carrot'||name==='harvest.wheat'){
   const item=name.slice(8);
   this.state.inventory[item]++;
   return {event:name,changed:true};
  }
  if(name==='deliver.dinner'){
   if(this.state.receipts.includes('juliette:dinner:delivery'))return {event:name,changed:false,reason:'Already completed'};
   if(!this.state.dinner.accepted)return {event:name,changed:false,reason:'Invitation not accepted'};
   if(this.state.inventory.carrot<2||this.state.inventory.wheat<1)return {event:name,changed:false,reason:'Need 2 carrots and 1 wheat'};
   // Commit the resource subtraction, story fact, and receipt in the same snapshot.
   this.state.inventory.carrot-=2;
   this.state.inventory.wheat-=1;
   this.state.dinner.completed=true;
   this.state.facts.juliette_dinner_delivered=true;
   this.state.receipts.push('juliette:dinner:delivery');
   return {event:name,changed:true,reason:'Delivery completed'};
  }
  throw Error('Unsupported gameplay event');
 }
}
module.exports={GameplayBridge,validate};
