'use strict';
const { Story } = require('inkjs');
class StoryHost {
  constructor(compiled, save) {
    this.compiled = compiled;
    this.instances = new Map();
    this.facts = Object.create(null);
    this.appliedEffects = new Set();
    if (save) this.restore(save);
  }
  open(id) {
    if (!Object.hasOwn(this.compiled,id)) throw Error('Unknown story');
    if (!this.instances.has(id)) this.instances.set(id,new Story(this.compiled[id]));
    return this.instances.get(id);
  }
  advance(id) {
    const story=this.open(id), lines=[];
    while(story.canContinue) lines.push(story.Continue().trim());
    return {lines:lines.filter(Boolean),choices:story.currentChoices.map((c,i)=>({index:i,text:c.text})),ended:!story.canContinue&&story.currentChoices.length===0};
  }
  choose(id,index) {
    const story=this.open(id);
    if(!Number.isInteger(index)||index<0||index>=story.currentChoices.length) throw Error('Invalid choice');
    story.ChooseChoiceIndex(index);
    return this.advance(id);
  }
  fact(name,value) {this.facts[name]=value;}
  getFact(name) {return this.facts[name];}
  applyOnce(effectId,apply) {
    if(this.appliedEffects.has(effectId))return false;
    apply();
    this.appliedEffects.add(effectId);
    return true;
  }
  snapshot() {
    return {version:1,facts:{...this.facts},appliedEffects:[...this.appliedEffects],stories:Object.fromEntries([...this.instances].map(([id,s])=>[id,s.state.ToJson()]))};
  }
  restore(save) {
    if(!save||save.version!==1||!save.facts||typeof save.facts!=='object'||Array.isArray(save.facts)||!Array.isArray(save.appliedEffects)||!save.stories||typeof save.stories!=='object'||Array.isArray(save.stories))throw Error('Invalid story save');
    const instances=new Map();
    for(const [id,state] of Object.entries(save.stories)){
      if(!Object.hasOwn(this.compiled,id)||typeof state!=='string')throw Error('Incompatible story save');
      const story=new Story(this.compiled[id]);story.state.LoadJson(state);instances.set(id,story);
    }
    this.instances=instances;
    this.facts=Object.assign(Object.create(null),save.facts);
    this.appliedEffects=new Set(save.appliedEffects);
  }
}
module.exports={StoryHost};
