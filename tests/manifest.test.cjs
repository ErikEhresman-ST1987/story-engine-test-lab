'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {validateManifest}=require('../packages/story-engine/validate-manifest.cjs');
const valid=()=>({schema:1,storyId:'sample-story',contentVersion:'1.0.0',sourceApproval:'approved-source-1',chapters:[{id:'chapter-1',inkFile:'chapter-1.ink',entry:'start',completion:'done'}],requiresFacts:[],events:['host.deliver'],effects:['sample:delivery']});
test('accepts a structurally valid approved story manifest',()=>assert.equal(validateManifest(valid()),true));
test('rejects missing approval and unsupported schema',()=>{
 const a=valid();a.sourceApproval='';assert.throws(()=>validateManifest(a),/sourceApproval/);
 const b=valid();b.schema=2;assert.throws(()=>validateManifest(b),/schema/);
});
test('rejects duplicate chapters, unsafe file paths and duplicate effects',()=>{
 const a=valid();a.chapters.push({...a.chapters[0]});assert.throws(()=>validateManifest(a),/chapter ID/);
 const b=valid();b.chapters[0].inkFile='../escape.ink';assert.throws(()=>validateManifest(b),/inkFile/);
 const c=valid();c.effects.push(c.effects[0]);assert.throws(()=>validateManifest(c),/effects/);
});
