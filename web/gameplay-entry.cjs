'use strict';
const {GameplayBridge}=require('../src/gameplay-bridge.cjs');
const KEY='story-engine-gameplay-lab-v1';
const status=document.querySelector('#game-status'),view=document.querySelector('#game-state');
let bridge,blocked=false;
try{const raw=localStorage.getItem(KEY);bridge=new GameplayBridge(raw?JSON.parse(raw):undefined)}
catch(e){bridge=new GameplayBridge();blocked=true;status.textContent='Existing gameplay save could not be loaded. No changes will be saved until you reset this lab.'}
function draw(){
 const s=bridge.snapshot();
 view.textContent='Carrots: '+s.inventory.carrot+' · Wheat: '+s.inventory.wheat+'\nInvitation: '+(s.dinner.accepted?'Accepted':'Not accepted')+'\nDelivery: '+(s.dinner.completed?'Completed':'Waiting')+'\nStory fact: '+(s.facts.juliette_dinner_delivered?'Dinner supplies delivered':'Not yet')+'\nDelivery receipts: '+s.receipts.length;
 for(const b of document.querySelectorAll('[data-game-event]'))b.disabled=blocked||s.dinner.completed&&b.dataset.gameEvent==='deliver.dinner';
 document.querySelector('#game-accept').disabled=blocked||s.dinner.accepted||s.dinner.completed;
}
function commit(){
 if(blocked)return;
 try{localStorage.setItem(KEY,JSON.stringify(bridge.snapshot()));status.textContent='Gameplay and story consequence saved together.'}
 catch(e){blocked=true;status.textContent='Save failed; further changes disabled to prevent unsafe progress.'}
 draw();
}
document.querySelector('#game-accept').addEventListener('click',()=>{bridge.accept();commit()});
for(const b of document.querySelectorAll('[data-game-event]'))b.addEventListener('click',()=>{const result=bridge.event(b.dataset.gameEvent);status.textContent=result.reason||'Harvest recorded.';if(result.changed)commit();else draw()});
document.querySelector('#game-reset').addEventListener('click',()=>{if(!confirm('Reset only the gameplay bridge demonstration?'))return;localStorage.removeItem(KEY);bridge=new GameplayBridge();blocked=false;status.textContent='Gameplay demonstration reset.';draw()});
draw();
